# Scored target and transcript context

The [scoring-scope schema](../schemas/scoring-scope.schema.json), version
`0.1.0`, records the subject of one measurement separately from the transcript
provided as context. It is a small attribution contract for results exchange,
not an EEE adapter, runner, rubric, or change to the transcript processor.

The [recorded weval probe](../interop/weval/README.md) demonstrates the need:
the shared pipeline scores the final authored assistant turn while retaining
the conversation as context. Seeing a whole transcript does not establish that
the whole transcript was scored. That evidence is limited to the tested revision
and the CLI-guard-patched diagnostic path; the public API and hosted service were
not run.

## Selectors

`context.transcript_ref` identifies an ordered array of turns. A reference is
an artifact path or controlled-access identifier, optionally followed by a JSON
Pointer fragment identifying the array. Repository-relative paths resolve from
the repository root. `context.selector` names the turns supplied as context;
`target` names the subject requested for the measurement. Neither defaults to
the other.

All turn indexes are **zero-based, absolute positions in the referenced array**,
including user/participant turns. They are not positions relative to the context
window or a list filtered to assistant turns. Resolve labels such as “final
assistant turn” to an explicit index in that particular transcript.

| Target kind | Required fields | Meaning |
|---|---|---|
| `turn` | `turn_index` | One complete turn |
| `window` | `start_turn`, `turn_count` | Consecutive turns starting at `start_turn` |
| `extracted_answer` | `turn_index`, `start_char`, `char_count` | An exact substring of one turn's text |
| `whole_transcript` | None | Every turn in the referenced array |

Context accepts `turn`, `window`, or `whole_transcript`. Extracted-answer offsets
count Unicode code points in the original text, without trimming or normalizing;
`char_count: 0` identifies an empty answer. Rewritten answers, multiple disjoint
spans, generated-only turn sets, and other selectors are not represented in this
version. Do not approximate them with a different supported selector.

The schema checks shape, required fields, and nonnegative indexes. Consumers
must also resolve authorized references and check turn/text bounds; structural
validation alone does not establish that a referenced artifact exists or that
a runtime used the declared target. Preserve the native evaluator's input
representation and provenance separately; these selectors do not define a new
transcript serialization or demonstrate replay.

## Support, missing measurements, and aggregation

`support.status` describes the evaluator path's support for the **declared
target and aggregation**, using the linked evidence:

- `supported`: the declared scope is supported on that path. `reason` is `null`.
- `unsupported`: that path cannot evaluate this scope. Give a nonempty reason.
- `unknown`: support has not been established. Give a nonempty reason.

For `unsupported` or `unknown`, `measurement.value` must be `null`, with a
nonempty `measurement.missing_reason`. Never relabel a final-turn score as a
whole-transcript score. A supported scope can also have a missing result, such
as an unavailable archival measurement; it retains `null` and its reason.
A numeric result has a null missing reason. The schema does not coerce data,
insert defaults, or prescribe a metric's range or direction.

Aggregation is always explicit:

- `unit: target`, `operation: none`, `missing_policy: propagate` means one
  subject was selected and scored once. A whole transcript scored once is not
  a mean of turn-level scores. This field concerns aggregation over the selected
  turns, not a native metric's aggregation over rubric points or judges.
- `unit: turn` with `operation: mean`, `sum`, `min`, or `max` means separate
  turn measurements were combined for a `window` or `whole_transcript` target.
  `missing_policy: propagate` leaves the aggregate missing if any constituent
  is missing; `exclude` excludes null constituents. With no measured constituents,
  the result remains `null`, including for `sum`. Counts, denominators, weights,
  and metric semantics remain in the enclosing/native results record; this
  contract neither computes nor verifies an aggregate.

For an unsupported or unknown scope, these fields describe the requested
operation, not an operation that ran. Unrecognized selectors or aggregation
operations fail schema validation; do not silently fall back to a final turn.

## Recorded fixtures and offline checks

[`scoring-scope-fixtures.json`](../interop/weval/scoring-scope-fixtures.json)
contains two records pointing to the same four-turn synthetic conversation:

| Record | Context | Target | Support | Measurement |
|---|---|---|---|---|
| `final_turn` | Whole transcript | Turn `3` | Supported by the measured diagnostic path | Recorded `0` for the early-only marker |
| `whole_transcript` | Whole transcript | Whole transcript | Unsupported by that path | `null`; no such measurement exists |

The marker occurs in turn `1`, outside the final-turn target. The unsupported
fixture declares the whole-transcript selector without inventing a measurement.
It is not evidence of successful whole-transcript evaluation. Both records link
to the [source evidence](../interop/weval/README.md); the supported record also
points to its exact native result. The original probe artifacts are unchanged.

```sh
npm ci --ignore-scripts
npm test
```

The tests validate the contract, reject malformed scopes and misattributed
scores, and check the fixtures against recorded evidence. CI runs the same
offline tests. There are no model calls, participant transcripts, or new weval
runs involved.

## Interpretation and access boundaries

Target attribution does not establish rubric validity, practitioner calibration,
method fidelity, or participant benefit. Preserve calibration references and
method/profile/runtime/outcome claims separately in the enclosing report. These
fixtures describe runtime scoring scope only; no LLM judge was used.

A reference does not grant permission to fetch, publish, or embed its contents.
Keep participant data and held source material under their existing consent,
rights, and access restrictions. The checked-in fixtures use only the already
public synthetic probe. Exporting metadata does not authorize public export of
the underlying transcript or method material.
