# Annotation validation

The transcript processor validates each model response before merging its batch
into the annotated transcript. A rejected batch throws, so the CLI does not
compute a signature or write a benchmark for that run.

## Accepted output

- A JSON object with an `annotations` array, or the existing bare-array form.
- Exactly one annotation for every absolute turn id in the current batch.
  Ids must be integers, unique and within that batch. Previous overlap turns
  are context only and must not be annotated again.
- `why` and `how` must each be a nonempty array of distinct canonical strings.
- `who` must be one canonical string.

The validator reads the tag lists from the **Tag Taxonomy** section of
[`prompts/whw-annotate-system.md`](../prompts/whw-annotate-system.md), the same
prompt sent to the model. It fails before the first completion request if any
dimension's tag list cannot be read. Keep the section heading, Why/How/Who
subheadings and backtick-delimited bullet format when editing that taxonomy.
There is no second production vocabulary to synchronize.

An invalid response raises an explicit error; missing turns or fields do not
receive default tags. The entire batch is checked before its results are
merged. Malformed JSON and provider errors continue to propagate. Model choice,
prompt wording and existing 429/5xx retry policy are unchanged; validation
failure does not request another completion.

## Offline verification

Run with installed dependencies:

```sh
npm test -- --test-concurrency=1
node node_modules/typescript/bin/tsc --noEmit
```

Verified locally on 2026-10-24 with Node v22.18.0: **48 tests passed**, comprising
39 annotation checks and the existing 9 scoring-scope checks; TypeScript passed.
The regression tests first reproduced failures against the pre-fix implementation.

[`test/annotate.test.mjs`](../test/annotate.test.mjs) exercises the real annotation
code and a valid output's signature calculation. It covers complete/out-of-order
output, every canonical label, bare arrays, multi-batch absolute ids, omitted
turns, duplicate/invalid ids, overlap contamination, malformed entries and fields,
unknown/duplicate tags, malformed JSON and provider status 401.

Only the SDK completion method is substituted with fixed synthetic responses.
The SDK request method is guarded to reject transport, with zero transport
attempts asserted. The tests use a process-local dummy key and restore patched
methods and key state afterward. They import neither the CLI nor its `.env`
loader. No fresh model calls, real transcripts or provider credentials are used.
These checks establish structural integrity, not whether the model chose the
right facilitation tags, nor general provider/retry behavior.

## Historical audit

The [original audit](../interop/ofl-annotator/README.md), probe and recorded result
remain unchanged. They describe commit `c892056d203fbc11af6b3d903ae6874c39fb9d8d`,
where missing turns became fabricated observations and unknown tags were accepted.
That probe asserts the old behavior and is historical evidence, not the passing
check for the repaired implementation. Use the regression tests above for the fix.
No historical benchmarks or measurements were rewritten.

Tracked in [evals #26](https://github.com/Open-Facilitation-Library/evals/issues/26).
