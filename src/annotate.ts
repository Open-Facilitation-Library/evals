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

interface AnnotationResult {
  turn: number;
  why: string[];
  how: string[];
  who: string;
}

async function callLlm(
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string,
): Promise<AnnotationResult[]> {
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

      const parsed = JSON.parse(content);
      const annotations: AnnotationResult[] = parsed.annotations || parsed;

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

    for (const ann of annotations) {
      results.set(ann.turn, {
        why: ann.why || [],
        how: ann.how || [],
        who: ann.who || 'participant-to-participant',
      });
    }
  }

  // Merge annotations with turns
  return turns.map((turn, i): AnnotatedTurn => ({
    ...turn,
    tags: results.get(i) || {
      why: ['information-sharing'],
      how: ['instruction'],
      who: 'participant-to-participant',
    },
  }));
}
