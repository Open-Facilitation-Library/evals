// Offline execution probe: real annotation parsing/merge and signature code,
// fixed SDK responses, and a transport guard. No process-transcript/.env loader.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { annotate } from '../../src/annotate.ts';
import { computeSignature } from '../../src/signature.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
git('diff', '--exit-code', 'HEAD', '--', 'src/annotate.ts', 'src/signature.ts');
const completionPrototype = OpenAI.Chat.Completions.prototype;
const originalCreate = completionPrototype.create;
const originalRequest = Object.getOwnPropertyDescriptor(OpenAI.prototype, 'request');
const originalKey = process.env.OPENAI_API_KEY;
let transportAttempts = 0;
let stubCalls = 0;
let nextResponse;
const denyTransport = () => { transportAttempts++; throw new Error('Offline probe forbids transport'); };
const stubCreate = async () => {
  stubCalls++;
  if (nextResponse instanceof Error) throw nextResponse;
  return { choices: [{ message: { content: nextResponse } }] };
};
const observations = [];
const turn = { speaker: 'Facilitator', text: 'Synthetic fixture only.' };

try {
  process.env.OPENAI_API_KEY = 'offline-synthetic-key';
  Object.defineProperty(OpenAI.prototype, 'request', { configurable: true, writable: true, value: denyTransport });
  completionPrototype.create = stubCreate;
  const guardClient = new OpenAI({ apiKey: 'offline-synthetic-key' });
  assert.equal(guardClient.request, denyTransport);
  assert.equal(guardClient.chat.completions.create, stubCreate);

  nextResponse = '{"annotations":[]}';
  const missing = await annotate([turn], 'synthetic');
  assert.deepEqual(missing[0].tags, {
    why: ['information-sharing'], how: ['instruction'], who: 'participant-to-participant',
  });
  const signature = computeSignature(missing);
  assert.equal(signature.why['information-sharing'], 1);
  observations.push({ case: 'missing-turn', outcome: 'unmarked-default-tags', tags: missing[0].tags, signature });

  nextResponse = JSON.stringify({ annotations: [{ turn: 0, why: ['UNKNOWN_WHY'], how: ['UNKNOWN_HOW'], who: 'UNKNOWN_WHO' }] });
  const invalidTags = await annotate([turn], 'synthetic');
  assert.deepEqual(invalidTags[0].tags, { why: ['UNKNOWN_WHY'], how: ['UNKNOWN_HOW'], who: 'UNKNOWN_WHO' });
  observations.push({ case: 'unknown-taxonomy-labels', outcome: 'accepted-without-tag-validation', tags: invalidTags[0].tags });

  nextResponse = '{';
  await assert.rejects(annotate([turn], 'synthetic'), SyntaxError);
  observations.push({ case: 'malformed-json', outcome: 'error-propagated' });

  nextResponse = Object.assign(new Error('Synthetic provider refusal'), { status: 401 });
  await assert.rejects(annotate([turn], 'synthetic'), error => error.status === 401);
  observations.push({ case: 'provider-401', outcome: 'error-propagated' });
  assert.equal(stubCalls, 4);
  assert.equal(transportAttempts, 0);
} finally {
  completionPrototype.create = originalCreate;
  if (originalRequest) Object.defineProperty(OpenAI.prototype, 'request', originalRequest);
  else delete OpenAI.prototype.request;
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
}

const hash = url => createHash('sha256').update(readFileSync(url)).digest('hex');
const report = {
  captured_at: new Date().toISOString(),
  implementation_commit: git('rev-parse', 'HEAD'),
  implementation_files: {
    'src/annotate.ts': hash(new URL('../../src/annotate.ts', import.meta.url)),
    'src/signature.ts': hash(new URL('../../src/signature.ts', import.meta.url)),
  },
  probe_sha256: hash(new URL(import.meta.url)),
  environment: { node: process.version, platform: process.platform },
  scope: 'Annotation decoding/merge and signature consumption with fixed SDK responses; no live API, model quality, timeout, 429/5xx retry, selector or conformance adapter exercised.',
  fresh_model_calls: 0,
  transport_attempts: transportAttempts,
  stubbed_completion_calls: stubCalls,
  observations,
};
const outputIndex = process.argv.indexOf('--output');
if (outputIndex !== -1) {
  assert.ok(process.argv[outputIndex + 1], '--output requires a new file path');
  writeFileSync(process.argv[outputIndex + 1], JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log('Recorded four offline cases; zero transport attempts. Observed gaps are not conformance passes.');
} else console.log(JSON.stringify(report, null, 2));
