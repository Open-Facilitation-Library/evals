# OFL annotation failure-path probe

Recorded 2026-10-24 against OFL evals commit
`c892056d203fbc11af6b3d903ae6874c39fb9d8d`. This executes the real annotation
decoder/merge and signature code with fixed SDK responses. It imports neither
the transcript-processing CLI nor its environment-file loader.

## Observations

| Fixed SDK response | Actual application result |
| --- | --- |
| Empty annotation list for one input turn | The turn receives unmarked default tags; the signature counts those tags as observations. |
| Unknown Why/How/Who labels | Labels are accepted without taxonomy validation. |
| Malformed JSON | A parsing error propagates. |
| Provider error with status 401 | The error propagates without a fabricated annotation result. |

The first two rows are integrity gaps, not successful evaluations. The last two
establish only those exercised error paths; they do not establish timeout,
429/5xx retry, partial-batch, or general fail-closed behavior. No claim about
model quality, calibration, method fidelity or participant outcomes follows.

## Evidence and boundaries

- [Probe](failure-path-probe.mjs) and [recorded result](failure-path-probe-result.json).
- Result metadata pins implementation commit/file hashes, probe hash and Node/platform.
- Four SDK completion calls were replaced with synthetic responses. The SDK
  request method was guarded to throw before transport; zero transport attempts
  occurred. No model, real provider credential, real transcript, live environment or new dependency
  was used. A dummy key was confined to the owned probe process.
- The annotation and signature implementations were not changed. The probe
  restores SDK methods and its process-local key setting in `finally`.

Run with the repository's existing dependencies:

```sh
node --import tsx interop/ofl-annotator/failure-path-probe.mjs
```

An optional `--output <new-file>` writes JSON without overwriting an existing
artifact. Normal annotation progress messages remain visible. A nonzero exit
means the expected bounded observations/guard did not hold; do not treat that
as a completed capability result.

The smallest next repair is explicit missing-turn/tag validation before merging
annotations and computing signatures, with offline positive/negative cases.
It is tracked in [evals #26](https://github.com/Open-Facilitation-Library/evals/issues/26).
That repair is separate from this recorded audit and does not require prompt
tuning or a live model run.
