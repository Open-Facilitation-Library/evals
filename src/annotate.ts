import OpenAI from 'openai';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Turn, AnnotatedTurn, WhwTags } from './types.js';
import * as log from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BATCH_SIZE = 15;
const OVERLAP = 2;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MODEL = 'gpt-4o-mini';

function loadPrompt(name: string): string {
  const promptPath = resolve(__dirname, '..', 'prompts', name);
  return readFileSync(promptPath, 'utf-8');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTurnsForPrompt(turns: Turn[], startIndex: number): string {
  return turns
    .map((t, i) => `[Turn ${startIndex + i}] ${t.speaker}: ${t.text}`)
    .join('\n\n');
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;

  // Handle {{#if var}} blocks
  result = result.replace(
    /\{\{#if (\w+)\}\}\n?([\s\S]*?)\{\{\/if\}\}/g,
    (_, varName, content) => (vars[varName] ? content : ''),
  );

  // Handle {{var}} substitutions
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  return result;
}

type Taxonomy = Record<keyof WhwTags, Set<string>>;

// Validate against the same canonical vocabulary sent to the model, rather than
// maintaining a second list that can drift from prompts/whw-annotate-system.md.
function parseTaxonomy(systemPrompt: string): Taxonomy {
  const taxonomy: Taxonomy = { why: new Set(), how: new Set(), who: new Set() };
  let inTaxonomy = false;
  let dimension: keyof WhwTags | undefined;

  for (const line of systemPrompt.split(/\r?\n/)) {
    if (line.startsWith('## ')) {
      inTaxonomy = line === '## Tag Taxonomy';
      dimension = undefined;
    } else if (inTaxonomy && line.startsWith('### ')) {
      const heading = /^### (Why|How|Who)\b/.exec(line);
      dimension = heading ? heading[1].toLowerCase() as keyof WhwTags : undefined;
    } else if (inTaxonomy && dimension) {
      const label = /^- `([^`]+)`/.exec(line);
      if (label) taxonomy[dimension].add(label[1]);
    }
  }

  if (Object.values(taxonomy).some(labels => labels.size === 0)) {
    throw new Error('Canonical WHoW prompt must define Why, How and Who tag lists');
  }
  return taxonomy;
}

function validateTagList(value: unknown, allowed: Set<string>, field: string, turn: number): string[] {
  if (!Array.isArray(value) || value.length === 0
    || value.some(label => typeof label !== 'string' || !allowed.has(label))) {
    throw new Error(`Invalid annotation for turn ${turn}: ${field} must be a nonempty array of canonical tags`);
  }
  if (new Set(value).size !== value.length) {
    throw new Error(`Invalid annotation for turn ${turn}: ${field} contains duplicate tags`);
  }
  return value;
}

function validateAnnotations(
  annotations: unknown[],
  batchStart: number,
  batchEnd: number,
  taxonomy: Taxonomy,
): Map<number, WhwTags> {
  const validated = new Map<number, WhwTags>();
  for (const annotation of annotations) {
    if (!annotation || typeof annotation !== 'object' || Array.isArray(annotation)) {
      throw new Error('Invalid annotation: each entry must be an object');
    }
    const { turn, why, how, who } = annotation as Record<string, unknown>;
    if (typeof turn !== 'number' || !Number.isInteger(turn)) {
      throw new Error('Invalid annotation: turn must be an integer');
    }
    if (turn < batchStart || turn >= batchEnd) {
      throw new Error(`Invalid annotation: turn ${turn} is outside batch ${batchStart}–${batchEnd - 1}`);
    }
    if (validated.has(turn)) {
      throw new Error(`Invalid annotation: duplicate turn ${turn}`);
    }
    const validWhy = validateTagList(why, taxonomy.why, 'why', turn);
    const validHow = validateTagList(how, taxonomy.how, 'how', turn);
    if (typeof who !== 'string' || !taxonomy.who.has(who)) {
      throw new Error(`Invalid annotation for turn ${turn}: who must be one canonical tag`);
    }
    validated.set(turn, { why: validWhy, how: validHow, who });
  }

  const missing = [];
  for (let turn = batchStart; turn < batchEnd; turn++) {
    if (!validated.has(turn)) missing.push(turn);
  }
  if (missing.length) {
    throw new Error(`Invalid annotations: missing turns ${missing.join(', ')} in batch ${batchStart}–${batchEnd - 1}`);
  }
  return validated;
}

async function callLlm(
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string,
): Promise<unknown[]> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt + '\n\nReturn your response as a JSON object with an "annotations" key containing the array.' },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty LLM response');

      const parsed: unknown = JSON.parse(content);
      const annotations = Array.isArray(parsed) ? parsed
        : parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>).annotations : undefined;

      if (!Array.isArray(annotations)) {
        throw new Error('LLM response is not an array');
      }

      return annotations;
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const isRetryable = status === 429 || (status !== undefined && status >= 500);

      if (isRetryable && attempt < MAX_RETRIES - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        log.warn(`API error (${status}), retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  throw new Error('Max retries exceeded');
}

export async function annotate(
  turns: Turn[],
  methodology: string,
): Promise<AnnotatedTurn[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const client = new OpenAI({ apiKey });
  const systemPrompt = loadPrompt('whw-annotate-system.md');
  const taxonomy = parseTaxonomy(systemPrompt);
  const userTemplate = loadPrompt('whw-annotate.md');

  const results: Map<number, WhwTags> = new Map();
  const totalBatches = Math.ceil(turns.length / BATCH_SIZE);

  for (let batchStart = 0; batchStart < turns.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, turns.length);
    const batchTurns = turns.slice(batchStart, batchEnd);
    const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;

    log.info(`Annotating batch ${batchNum}/${totalBatches} (turns ${batchStart}–${batchEnd - 1})`);

    // Build context from overlapping previous turns
    let previousTurns = '';
    if (batchStart > 0) {
      const overlapStart = Math.max(0, batchStart - OVERLAP);
      const contextTurns = turns.slice(overlapStart, batchStart);
      previousTurns = formatTurnsForPrompt(contextTurns, overlapStart);
    }

    const userPrompt = fillTemplate(userTemplate, {
      methodology,
      previous_turns: previousTurns,
      turns: formatTurnsForPrompt(batchTurns, batchStart),
    });

    const annotations = await callLlm(client, systemPrompt, userPrompt);
    const validated = validateAnnotations(annotations, batchStart, batchEnd, taxonomy);

    for (const [turn, tags] of validated) {
      results.set(turn, tags);
    }
  }

  // Merge annotations with turns
  return turns.map((turn, i): AnnotatedTurn => {
    const tags = results.get(i);
    if (!tags) throw new Error(`Missing validated annotation for turn ${i}`);
    return { ...turn, tags };
  });
}
