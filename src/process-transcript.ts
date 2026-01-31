import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(): void {
  const envPath = resolve(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();
import type { PipelineOptions, TranscriptFormat } from './types.js';
import { parseTranscript } from './parse.js';
import { anonymize } from './anonymize.js';
import { annotate } from './annotate.js';
import { computeSignature } from './signature.js';
import { render, writeBenchmark } from './render.js';
import * as log from './logger.js';

const VALID_FORMATS: TranscriptFormat[] = ['fireflies', 'notion', 'plaintext'];

function printUsage(): void {
  console.log(`
OFL Transcript Processor — Parse, anonymize, and annotate facilitation transcripts

Usage:
  npx tsx src/process-transcript.ts --input <file> --methodology <name> --date <YYYY-MM-DD> [options]

Required:
  --input <file>           Path to raw transcript file
  --methodology <name>     Facilitation methodology (e.g., "dynamic-facilitation")
  --date <YYYY-MM-DD>      Session date

Options:
  --format <type>          Force format: fireflies, notion, plaintext (default: auto-detect)
  --facilitator <names>    Specify facilitator name(s), comma-separated (default: auto-detect)
  --dry-run                Parse and anonymize only, no LLM calls
  --help                   Show this help message
`);
}

function parseArgs(argv: string[]): PipelineOptions | null {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printUsage();
    return null;
  }

  let input: string | undefined;
  let methodology: string | undefined;
  let date: string | undefined;
  let format: TranscriptFormat | undefined;
  let facilitators: string[] | undefined;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        input = args[++i];
        break;
      case '--methodology':
        methodology = args[++i];
        break;
      case '--date':
        date = args[++i];
        break;
      case '--format':
        format = args[++i] as TranscriptFormat;
        if (!VALID_FORMATS.includes(format)) {
          log.error(`Invalid format "${format}". Valid: ${VALID_FORMATS.join(', ')}`);
          process.exit(1);
        }
        break;
      case '--facilitator':
        facilitators = args[++i].split(',').map((s) => s.trim());
        break;
      case '--dry-run':
        dryRun = true;
        break;
      default:
        log.error(`Unknown argument: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  if (!input) {
    log.error('--input is required');
    process.exit(1);
  }
  if (!methodology) {
    log.error('--methodology is required');
    process.exit(1);
  }
  if (!date) {
    log.error('--date is required');
    process.exit(1);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    log.error('--date must be YYYY-MM-DD format');
    process.exit(1);
  }

  return { input, methodology, date, format, facilitators, dryRun };
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv);
  if (!opts) return;

  log.divider();
  log.info('OFL Transcript Processor');
  log.divider();

  log.stat('Input', opts.input);
  log.stat('Methodology', opts.methodology);
  log.stat('Date', opts.date);
  if (opts.dryRun) log.warn('Dry run — skipping LLM annotation');

  // Validate input file
  if (!existsSync(opts.input)) {
    log.error(`File not found: ${opts.input}`);
    process.exit(1);
  }

  // 1. Parse
  log.step('Parse', 'Reading and parsing transcript...');
  const turns = parseTranscript(opts.input, opts.format);

  if (turns.length === 0) {
    log.error('No turns found in transcript');
    process.exit(1);
  }

  // 2. Anonymize
  log.step('Anonymize', 'Replacing names and stripping PII...');
  const { turns: anonTurns, facilitatorLabels } = anonymize(turns, opts.facilitators);
  log.success(`Anonymized ${anonTurns.length} turns`);

  if (opts.dryRun) {
    log.divider();
    log.success('Dry run complete');
    log.stat('Turns', anonTurns.length);
    log.info('Preview (first 3 turns):');
    for (const turn of anonTurns.slice(0, 3)) {
      console.log(`  ${turn.speaker}: ${turn.text.slice(0, 100)}...`);
    }
    log.divider();
    return;
  }

  // 3. Annotate
  log.step('Annotate', 'Sending to LLM for Why-How-Who tagging...');
  const annotatedTurns = await annotate(anonTurns, opts.methodology);
  log.success(`Annotated ${annotatedTurns.length} turns`);

  // 4. Compute signature
  log.step('Signature', 'Computing conversation signature...');
  const signature = computeSignature(annotatedTurns, facilitatorLabels);

  const topWhy = Object.entries(signature.why)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} (${v})`)
    .join(', ');
  const topHow = Object.entries(signature.how)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} (${v})`)
    .join(', ');

  log.stat('Top Why', topWhy);
  log.stat('Top How', topHow);
  log.stat('Who distribution', Object.entries(signature.who).map(([k, v]) => `${k}: ${v}`).join(', '));

  // 5. Render
  log.step('Render', 'Writing benchmark file...');
  const content = render(annotatedTurns, signature, opts.methodology, opts.date, facilitatorLabels);
  const outputPath = writeBenchmark(content, opts.methodology, opts.date);

  log.divider();
  log.success('Pipeline complete');
  log.stat('Output', outputPath);
  log.stat('Turns', annotatedTurns.length);
  log.divider();
}

main().catch((err) => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
