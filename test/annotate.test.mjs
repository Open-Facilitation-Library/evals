import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import OpenAI from 'openai';
import { annotate } from '../src/annotate.ts';
import { computeSignature } from '../src/signature.ts';

const completionPrototype = OpenAI.Chat.Completions.prototype;
const originalCreate = completionPrototype.create;
const originalRequest = Object.getOwnPropertyDescriptor(OpenAI.prototype, 'request');
const originalKey = process.env.OPENAI_API_KEY;
let responses;
let calls;
let transportAttempts = 0;
const denyTransport = () => { transportAttempts++; throw new Error('Offline tests forbid transport'); };
const stubCreate = async () => {
  calls++;
  assert.ok(responses.length, 'Unexpected extra completion request');
  const response = responses.shift();
  if (response instanceof Error) throw response;
  return { id: 'synthetic', object: 'chat.completion', created: 0, model: 'synthetic',
    choices: [{ index: 0, finish_reason: 'stop', logprobs: null,
      message: { role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response), refusal: null } }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
};
before(() => {
  process.env.OPENAI_API_KEY = 'offline-synthetic-key';
  Object.defineProperty(OpenAI.prototype, 'request', { configurable: true, writable: true, value: denyTransport });
  completionPrototype.create = stubCreate;
  const client = new OpenAI({ apiKey: 'offline-synthetic-key' });
  assert.equal(client.request, denyTransport);
  assert.equal(client.chat.completions.create, stubCreate);
});
beforeEach(() => { responses = []; calls = 0; });
afterEach(() => { assert.equal(transportAttempts, 0); });
after(() => {
  completionPrototype.create = originalCreate;
  if (originalRequest) Object.defineProperty(OpenAI.prototype, 'request', originalRequest);
  else delete OpenAI.prototype.request;
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
});

const turns = count => Array.from({ length: count }, (_, i) => ({ speaker: 'Facilitator', text: `Synthetic turn ${i}.` }));
const valid = (turn, extra = {}) => ({ turn, why: ['information-sharing'], how: ['instruction'], who: 'facilitator-to-group', ...extra });

test('valid complete annotations retain their own turn association even when returned out of order', async () => {
  responses = [{ annotations: [valid(1, { why: ['ideation'], how: ['open-question'] }), valid(0)] }];
  const result = await annotate(turns(2), 'synthetic');
  assert.deepEqual(result.map(t => t.tags), [
    { why: ['information-sharing'], how: ['instruction'], who: 'facilitator-to-group' },
    { why: ['ideation'], how: ['open-question'], who: 'facilitator-to-group' },
  ]);
  assert.deepEqual(computeSignature(result).why, { 'information-sharing': 0.5, ideation: 0.5 });
});

test('valid bare annotation arrays keep their existing supported input shape', async () => {
  responses = [[valid(0)]];
  assert.deepEqual((await annotate(turns(1), 'synthetic'))[0].tags,
    { why: ['information-sharing'], how: ['instruction'], who: 'facilitator-to-group' });
});

test('all canonical taxonomy labels are accepted without inventing defaults', async () => {
  const why = ['agreement-building', 'ideation', 'conflict-resolution', 'information-sharing', 'relationship-building',
    'perspective-taking', 'synthesis', 'error-surfacing', 'preference-elicitation'];
  const how = ['open-question', 'closed-question', 'probing-question', 'clarifying-question', 'paraphrase', 'summary',
    'redirect', 'encouragement', 'challenge', 'time-management', 'instruction'];
  const who = ['facilitator-to-group', 'facilitator-to-individual', 'participant-to-facilitator', 'participant-to-participant'];
  responses = [{ annotations: who.map((direction, i) => valid(i, { why, how, who: direction })) }];
  const result = await annotate(turns(4), 'synthetic');
  assert.deepEqual(result.map(t => t.tags.who), who);
  for (const turn of result) { assert.deepEqual(turn.tags.why, why); assert.deepEqual(turn.tags.how, how); }
});

test('omitted turns reject the batch instead of becoming default observations', async () => {
  responses = [{ annotations: [] }];
  await assert.rejects(annotate(turns(1), 'synthetic'), /missing turns/i);
});

test('an incomplete first batch stops before requesting the next batch', async () => {
  responses = [{ annotations: Array.from({ length: 14 }, (_, i) => valid(i)) }];
  await assert.rejects(annotate(turns(16), 'synthetic'), /missing turns/i);
  assert.equal(calls, 1);
});

test('multi-batch output uses absolute ids and preserves all input turns', async () => {
  responses = [{ annotations: Array.from({ length: 15 }, (_, i) => valid(i)) },
    { annotations: [valid(15, { why: ['synthesis'], how: ['summary'] })] }];
  const result = await annotate(turns(16), 'synthetic');
  assert.equal(result.length, 16);
  assert.deepEqual(result[14].tags, { why: ['information-sharing'], how: ['instruction'], who: 'facilitator-to-group' });
  assert.deepEqual(result[15].tags, { why: ['synthesis'], how: ['summary'], who: 'facilitator-to-group' });
});

test('annotations for overlap context cannot overwrite an earlier batch', async () => {
  responses = [{ annotations: Array.from({ length: 15 }, (_, i) => valid(i)) },
    { annotations: [valid(14), valid(15)] }];
  await assert.rejects(annotate(turns(16), 'synthetic'), /outside batch/i);
});

for (const [name, annotations] of [
  ['null entry', [null]],
  ['array entry', [[]]],
  ['primitive entry', [42]],
  ['missing id', [{ why: ['information-sharing'], how: ['instruction'], who: 'facilitator-to-group' }]],
  ['duplicate ids', [valid(0), valid(0)]],
  ['negative id', [valid(-1)]],
  ['out-of-range id', [valid(1)]],
  ['fractional id', [valid(0.5)]],
  ['string id', [valid('0')]],
  ['missing why', [{ turn: 0, how: ['instruction'], who: 'facilitator-to-group' }]],
  ['empty why', [valid(0, { why: [] })]],
  ['non-array why', [valid(0, { why: 'information-sharing' })]],
  ['non-string why label', [valid(0, { why: [null] })]],
  ['unknown why', [valid(0, { why: ['UNKNOWN_WHY'] })]],
  ['duplicate why', [valid(0, { why: ['information-sharing', 'information-sharing'] })]],
  ['missing how', [{ turn: 0, why: ['information-sharing'], who: 'facilitator-to-group' }]],
  ['empty how', [valid(0, { how: [] })]],
  ['non-array how', [valid(0, { how: 'instruction' })]],
  ['non-string how label', [valid(0, { how: [42] })]],
  ['unknown how', [valid(0, { how: ['UNKNOWN_HOW'] })]],
  ['duplicate how', [valid(0, { how: ['instruction', 'instruction'] })]],
  ['missing who', [{ turn: 0, why: ['information-sharing'], how: ['instruction'] }]],
  ['empty who', [valid(0, { who: '' })]],
  ['unknown who', [valid(0, { who: 'UNKNOWN_WHO' })]],
  ['array who', [valid(0, { who: ['facilitator-to-group'] })]],
]) test(`rejects ${name} instead of accepting malformed annotations`, async () => {
  responses = [{ annotations }];
  await assert.rejects(annotate(turns(1), 'synthetic'), /Invalid annotation/);
  assert.equal(calls, 1, 'Invalid output must not trigger another model call');
});

for (const response of [null, 42, {}, { annotations: null }, { annotations: {} }]) {
  test(`rejects a non-array response root: ${JSON.stringify(response)}`, async () => {
    responses = [response];
    await assert.rejects(annotate(turns(1), 'synthetic'), /LLM response is not an array/);
    assert.equal(calls, 1);
  });
}

test('malformed JSON still propagates without replacement annotations', async () => {
  responses = ['{'];
  await assert.rejects(annotate(turns(1), 'synthetic'), SyntaxError);
});

test('provider 401 still propagates without a fabricated successful batch', async () => {
  responses = [Object.assign(new Error('Synthetic provider failure'), { status: 401 })];
  await assert.rejects(annotate(turns(1), 'synthetic'), error => error.status === 401);
});
