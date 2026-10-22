import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import Ajv from 'ajv';

const root = new URL('../', import.meta.url);
const readJson = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
let validate;

function recordedReference(ref) {
  const [path, pointer] = ref.split('#');
  assert.equal(path, 'interop/weval/transcript-scope-probe-result.json');
  assert.ok(pointer?.startsWith('/'));
  return pointer.slice(1).split('/').reduce(
    (value, key) => value[key.replace(/~1/g, '/').replace(/~0/g, '~')],
    readJson(path),
  );
}

function validator() {
  const path = 'schemas/scoring-scope.schema.json';
  assert.ok(existsSync(new URL(path, root)), 'The scoring-scope contract is missing');
  validate ??= new Ajv({ allErrors: true, strict: true }).compile(readJson(path));
  return validate;
}

function finalTurn() {
  return {
    scope_version: '0.1.0',
    context: {
      transcript_ref: 'interop/weval/transcript-scope-probe-result.json#/config/prompts/0/messages',
      selector: { kind: 'whole_transcript' },
    },
    target: { kind: 'turn', turn_index: 3 },
    aggregation: { unit: 'target', operation: 'none', missing_policy: 'propagate' },
    support: { status: 'supported', reason: null },
    measurement: { value: 0, missing_reason: null },
    source_evidence: ['interop/weval/README.md'],
  };
}

test('accepts an explicitly selected final turn with full transcript context', () => {
  const check = validator();
  assert.equal(check(finalTurn()), true, JSON.stringify(check.errors));
});

test('accepts a window, an extracted answer, and a whole transcript as distinct targets', () => {
  const check = validator();
  for (const target of [
    { kind: 'window', start_turn: 1, turn_count: 3 },
    { kind: 'extracted_answer', turn_index: 3, start_char: 0, char_count: 30 },
    { kind: 'whole_transcript' },
  ]) {
    assert.equal(check({ ...finalTurn(), target }), true, JSON.stringify(check.errors));
  }
});

test('rejects missing, ambiguous, or malformed selectors', () => {
  const check = validator();
  for (const target of [
    null,
    { kind: 'final_turn' },
    { kind: 'turn' },
    { kind: 'turn', turn_index: -1 },
    { kind: 'turn', turn_index: 1.5 },
    { kind: 'whole_transcript', turn_index: 3 },
    { kind: 'window', start_turn: 1, turn_count: 0 },
    { kind: 'extracted_answer', turn_index: 3, start_char: -1, char_count: 1 },
  ]) {
    assert.equal(check({ ...finalTurn(), target }), false, JSON.stringify(target));
  }
  const missing = finalTurn();
  delete missing.target;
  assert.equal(check(missing), false);
});

test('requires context independently of the scored target', () => {
  const check = validator();
  const missing = finalTurn();
  delete missing.context;
  assert.equal(check(missing), false);
  assert.equal(check({ ...finalTurn(), context: { selector: { kind: 'whole_transcript' } } }), false);
  assert.equal(check({
    ...finalTurn(),
    context: { ...finalTurn().context, selector: { kind: 'window', start_turn: 0, turn_count: 2 } },
  }), true);
});

test('requires unsupported and unknown targets to retain a null score and an explanation', () => {
  const check = validator();
  for (const status of ['unsupported', 'unknown']) {
    const record = {
      ...finalTurn(),
      target: { kind: 'whole_transcript' },
      support: { status, reason: 'This path has no whole-transcript scoring evidence.' },
      measurement: { value: null, missing_reason: 'No measurement for the requested target.' },
    };
    assert.equal(check(record), true, JSON.stringify(check.errors));
    for (const value of [0, 0.5, 1]) {
      assert.equal(check({ ...record, measurement: { value, missing_reason: null } }), false);
    }
    assert.equal(check({ ...record, support: { status, reason: '' } }), false);
  }
});

test('preserves a missing measurement on a supported target without converting it to zero', () => {
  const check = validator();
  const record = {
    ...finalTurn(),
    measurement: { value: null, missing_reason: 'Recorded result is unavailable.' },
  };
  assert.equal(check(record), true, JSON.stringify(check.errors));
  assert.equal(record.measurement.value, null);
  assert.equal(check({ ...record, measurement: { value: null, missing_reason: null } }), false);
  assert.equal(check({ ...record, measurement: { value: 0, missing_reason: 'Unavailable.' } }), false);
});

test('distinguishes scoring one selected subject from aggregating turn measurements', () => {
  const check = validator();
  const aggregated = {
    ...finalTurn(),
    target: { kind: 'window', start_turn: 0, turn_count: 4 },
    aggregation: { unit: 'turn', operation: 'mean', missing_policy: 'exclude' },
  };
  assert.equal(check(aggregated), true, JSON.stringify(check.errors));
  assert.equal(check({ ...aggregated, target: { kind: 'turn', turn_index: 3 } }), false);
  assert.equal(check({ ...aggregated, aggregation: { ...aggregated.aggregation, unit: 'target' } }), false);
  assert.equal(check({ ...finalTurn(), aggregation: { unit: 'turn', operation: 'none', missing_policy: 'propagate' } }), false);
  const missing = finalTurn();
  delete missing.aggregation;
  assert.equal(check(missing), false);
});

test('requires evidence attribution and rejects selector typos', () => {
  const check = validator();
  assert.equal(check({ ...finalTurn(), source_evidence: [] }), false);
  assert.equal(check({ ...finalTurn(), target: { kind: 'turn', turn_index: 3, turn_indx: 1 } }), false);
});

test('the final-turn and whole-transcript fixtures refer to the same synthetic context', () => {
  const check = validator();
  const fixtures = readJson('interop/weval/scoring-scope-fixtures.json');
  const final = fixtures.final_turn;
  const whole = fixtures.whole_transcript;
  assert.equal(check(final), true, JSON.stringify(check.errors));
  assert.equal(check(whole), true, JSON.stringify(check.errors));
  assert.deepEqual(final.context, whole.context);
  assert.deepEqual(final.target, { kind: 'turn', turn_index: 3 });
  assert.deepEqual(whole.target, { kind: 'whole_transcript' });
  assert.equal(whole.support.status, 'unsupported');
  assert.equal(whole.measurement.value, null);
  assert.ok(final.source_evidence.includes('interop/weval/README.md'));
  assert.ok(whole.source_evidence.includes('interop/weval/README.md'));

  const turns = recordedReference(final.context.transcript_ref);
  const selected = turns[final.target.turn_index].content;
  assert.equal(selected, "That's worth exploring further.");
  assert.equal(selected.includes('XYZZY_MARKER'), false);
  assert.equal(turns.some((turn) => turn.content.includes('XYZZY_MARKER')), true);
  assert.equal(final.measurement.value, recordedReference(final.source_result_ref));
});
