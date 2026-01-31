import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import type { AnnotatedTurn, ConversationSignature, BenchmarkMetadata } from './types.js';
import * as log from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function formatTags(tags: { why: string[]; how: string[]; who: string }): string {
  const parts: string[] = [];
  if (tags.why.length) parts.push(`why: ${tags.why.join(', ')}`);
  if (tags.how.length) parts.push(`how: ${tags.how.join(', ')}`);
  parts.push(`who: ${tags.who}`);
  return parts.join(' | ');
}

export function render(
  turns: AnnotatedTurn[],
  signature: ConversationSignature,
  methodology: string,
  date: string,
  facilitatorLabels: string[] = ['Facilitator'],
): string {
  const speakers = new Set(turns.map((t) => t.speaker));
  const facilitatorSet = new Set(facilitatorLabels);
  const participantCount = [...speakers].filter((s) => !facilitatorSet.has(s)).length;

  const metadata: BenchmarkMetadata = {
    methodology,
    date,
    participants: participantCount,
    turns: turns.length,
    facilitators: facilitatorLabels,
    signature,
  };

  const frontmatter = yaml.dump(metadata, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  const lines: string[] = [
    '---',
    frontmatter.trim(),
    '---',
    '',
    `# ${methodology} — ${date}`,
    '',
    `**Participants:** ${participantCount} + ${facilitatorLabels.length} facilitator${facilitatorLabels.length > 1 ? 's' : ''}`,
    `**Turns:** ${turns.length}`,
    '',
    '---',
    '',
  ];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const timestamp = turn.timestamp ? ` _(${turn.timestamp})_` : '';
    lines.push(`### Turn ${i}${timestamp}`);
    lines.push(`**${turn.speaker}:** ${turn.text}`);
    lines.push(`> ${formatTags(turn.tags)}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function writeBenchmark(
  content: string,
  methodology: string,
  date: string,
): string {
  const benchmarkDir = resolve(__dirname, '..', 'benchmarks');
  mkdirSync(benchmarkDir, { recursive: true });

  const slug = methodology.toLowerCase().replace(/\s+/g, '-');
  const filename = `${slug}-${date}.md`;
  const filePath = resolve(benchmarkDir, filename);

  writeFileSync(filePath, content, 'utf-8');
  log.success(`Benchmark written to benchmarks/${filename}`);

  return filePath;
}
