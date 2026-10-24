# Instrument support for conformance v0.3

Audit date: **2026-10-24**. Scope: existing OFL code/evidence, bounded source
inspection of the named candidates, and one offline fault-injection probe.
No fresh model inference, provider request, hosted evaluation or private
participant material was used. This is the capability inventory for
[evals #24](https://github.com/Open-Facilitation-Library/evals/issues/24), not a
facilitation-quality baseline or certification.

The [v0.3 record contract](https://github.com/Open-Facilitation-Library/method-specs/blob/447a0e9c441e629775a4c6673d2c26e5e4a6b688/docs/conformance/record-contract-v0.3.md)
requires explicit target/context, bounded subjects, answer contracts, support,
versions and missing-result semantics. Native output compatibility is separate
from a verified v0.3 binding. `unknown` means not established; it does not mean
the instrument is incapable.

## Native capability and the v0.3 seam

| Instrument / pinned path | Target and answer actually covered | Native support / evidence | v0.3 binding support and limits |
| --- | --- | --- | --- |
| Weval stock CLI, historical `26f5a98804d7ba4da17f1a9d92f8ed72784bec6c` | Fully authored assistant-ending conversation | **Unsupported on that path:** recorded rejection before evaluation | No measurement. This is an input-path limitation, not a failed method criterion. |
| Weval shared pipeline at the same revision, with only the final-role guard removed | Final authored assistant turn; fixed numeric point detector, values 0/1 | **Supported for that bounded diagnostic:** saved result has early-marker 0 and final-marker control 1 | A native positive result under scoring-scope 0.1.0, not a generic v0.3 adapter or arbitrary named-rubric score. Boolean/choice conversion is not established. |
| Same patched diagnostic, whole-authored-transcript request | Marker in an earlier turn | **Unsupported for the requested whole-transcript subject:** the final turn alone is scored; the existing unsupported fixture retains null | Whole-transcript context is not a whole-transcript measurement. No process-level score follows. |
| Weval current inspected source, `e34db8bd52f4b22028fbe0824a9935ce1eed44e6` | Stock authored input and shared subject selection | **Source-confirmed limits:** CLI still requires a final user message; shared evaluator chooses generated assistant text when present, otherwise final authored assistant text | This newer source was not executed. Historical numeric observations are not relabeled as measurements of this revision. |
| Weval public API at historical `26f5a98`; hosted build unrecorded | API ingestion / hosted scoring | **Unknown execution:** historical API path was source-inspected, not called; hosted service was not tested | No API/hosted result or current hosted version is invented. Shared-pipeline source alone does not verify the deployed route. |
| System One Adapter Python `0.2.1`, commit `e1d4cc938204b22fc5a3c3aca7044072fe3f712d` | Shared JSON state; Noul, Choice and Score requests | **Source-inspected, unexecuted here:** probability/discrete modes, conversion and output validation exist | **Unknown** for all v0.3 target/form combinations. No concrete provider/model, subject resolver or binding was exercised. Noul is returned as a probability, even after discrete-mode conversion; a v0.3 boolean needs an explicit decision policy. |
| Vercel AI Gateway Decision, official documentation read 2026-10-24; no deployed model revision observed | Shared state; documented boolean probability, named choice and ordered-scale score | **Documentation only:** current Decision API, formerly Evaluation; HTTP route remains `/v1/evaluate` | **Unknown** for v0.3 target/form combinations. No API request, binding, model version, error path or calibration was exercised. A documented response shape is not evidence that selected process subjects were assessed. |
| OFL WHoW annotation/merge at `c892056d203fbc11af6b3d903ae6874c39fb9d8d` | Transcript batches of 15 with two prior turns as context; fixed taxonomy tags | **Source plus bounded execution:** the local probe below exercises decoding/merge with SDK responses fixed | **Unsupported as an arbitrary v0.3 criterion interface on this native path.** It accepts no criterion/binding/answer-form selection. Its configured `gpt-4o-mini` is an alias; no actual model version was observed here. |
| OFL scoring-scope validator at the same commit, schema `0.1.0` | Shape of transcript attribution records with numeric/null measurements | **Supported structural utility:** nine offline contract tests; it is not a measurement-producing evaluator | It neither implements v0.3 bindings nor widens its enum to configuration, artifact, trace or participant-response targets. Schema acceptance does not prove reference resolution, runtime selection or instrument support. |

Weval's recorded evidence is [the original probe](../interop/weval/README.md),
[raw result](../interop/weval/transcript-scope-probe-result.json), and
[attribution fixtures](../interop/weval/scoring-scope-fixtures.json). The
configured model identifier in that probe is bookkeeping: there were no model
requests. Its numbers measure the exact string detectors, not facilitation.

Current Weval source references:
[CLI validation](https://github.com/weval-org/app/blob/e34db8bd52f4b22028fbe0824a9935ce1eed44e6/src/cli/commands/run-config.ts#L219),
[scored subject](https://github.com/weval-org/app/blob/e34db8bd52f4b22028fbe0824a9935ce1eed44e6/src/cli/evaluators/llm-coverage-evaluator.ts#L1055).
Source confirmation is kept separate from the earlier executed diagnostic.

System One sources:
[client](https://github.com/typesafe-ai/system-one-adapter-python/blob/e1d4cc938204b22fc5a3c3aca7044072fe3f712d/src/system_one_adapter/_client.py),
[schema](https://github.com/typesafe-ai/system-one-adapter-python/blob/e1d4cc938204b22fc5a3c3aca7044072fe3f712d/src/system_one_adapter/_schema.py),
[response](https://github.com/typesafe-ai/system-one-adapter-python/blob/e1d4cc938204b22fc5a3c3aca7044072fe3f712d/src/system_one_adapter/_response.py).
Normalization and score interpolation are interpretation policies, not proof of
calibrated probabilities or interchangeable rubrics. Provider/model/options
must be pinned for any later measurement.

Vercel's [official Decision documentation](https://vercel.com/docs/ai-gateway/modalities/decision)
describes probabilities for boolean questions, chosen options with probabilities,
and interpolated scores over ordered labels. An adapter must preserve the native
values, define any boolean decision rule, and pin the rubric's scale/interpretation.
The documentation's model example is not an observed immutable model version.

## Coverage of all requested targets and answer forms

No general v0.3 binding was established for the candidate paths. The table below
records those remaining capability gaps; the per-path native support and explicit
interface exclusions above remain distinct.

| Requested subject | `yes_no` | `choice` | Named-rubric `score` | Evidence boundary |
| --- | --- | --- | --- | --- |
| Conversation | Unknown v0.3 binding | Unknown | Unknown generic binding | One historical native final-turn numeric detector is supported, as scoped above; broader windows/transcripts need their own evidence. |
| Configuration | Unknown | Unknown | Unknown | Shared-state transport does not establish effective configuration resolution or runtime enforcement. |
| Artifact with required inputs | Unknown | Unknown | Unknown | No selected artifact revision, input coverage and instrument path were jointly exercised. |
| Execution trace | Unknown | Unknown | Unknown | The offline annotator check produces scoped execution evidence, but is not a general trace evaluator or v0.3 adapter. |
| Participant response | Unknown | Unknown | Unknown | No participant-measure instrument, construct or bound measurement path was assessed. |

These are findings for the inspected set, not a claim that no possible instrument
supports these tasks. An unbuilt OFL binding is not repaired by serializing all
material into one prompt or coercing a probability into a boolean.

## Failure handling is a separate finding

The [annotator probe](../interop/ofl-annotator/README.md) executes real decoding,
merge and signature code with four fixed SDK responses and a transport guard.
Its [result](../interop/ofl-annotator/failure-path-probe-result.json) pins source
hashes, test hash, environment and observations; transport attempts were zero.

| Path | Evidence | Consequence |
| --- | --- | --- |
| OFL missing annotation for an input turn | Observed: default Why/How/Who tags are inserted and counted in the signature | Missing output is not preserved as missing. Do not present derived signatures as fully observed without this gap. |
| OFL unrecognized taxonomy labels | Observed: labels pass through merge | Output shape alone does not validate taxonomy membership. |
| OFL malformed JSON / provider 401 | Observed: errors propagate in these two stubbed cases | No fabricated measurement on those paths; timeout, retries and broader liveness remain unverified. |
| System One invalid output | Source: validation/corrective-attempt loop raises a terminal validation error; provider attempts are recorded | No local fault-path execution was performed. Do not declare fail-closed liveness from source inspection alone. |
| Vercel error / missing subjects / malformed response | Not exercised | Unknown; require a bounded adapter/error-path check before a capability claim. |
| scoring-scope 0.1.0 malformed metadata / unsupported scores | Existing offline tests reject malformed selectors and non-null values for unsupported/unknown scopes | Record validation only; it does not catch an evaluator that falsely labels its own scope supported. |

None of these observations supplies practitioner review, model calibration or
method-essential authority. No pass rate is computed. Preserve original
measurement values and distinguish a completed negative result from an inability
to evaluate.

## Conditional gap remedies

The confirmed annotation repair is tracked in
[evals #26](https://github.com/Open-Facilitation-Library/evals/issues/26).
These identify the smallest route if a capability is selected, not a recommendation
to implement every provider or target. The observed annotation-integrity gap merits
a separate repair; the other routes remain options until their use is selected.

| Gap | Bounded next work |
| --- | --- |
| OFL omitted/invalid annotations | Validate exact turn coverage and taxonomy before merge/signature computation; keep missing output explicit. Reuse the four offline fault cases. This audit changes no runtime code. |
| Native numeric detector to v0.3 | Specify one explicit criterion/rubric, native target mapping, versioned binding and result/error conversion; verify against the saved synthetic output before claiming a generic adapter. |
| System One or Vercel typed answers | Choose one exact provider/model/options path; define target/context resolution, probability/boolean and rubric mapping, and synthetic error cases. Provider execution remains a separately scoped decision. |
| Configuration/artifact/trace/participant targets | Define one criterion's required inputs and a supported bounded selector, then check that exact path. State serialization alone is insufficient. |
| Whole-process claims | Keep the [process-scope proposal](process-scope-proposal.md) and its coverage-policy decision separate. Do not invent aggregation or broaden a final-turn measurement. |

This inventory records the current evidence and gaps. It installs no evaluator,
enables no provider retry route and upgrades no historical result to a new claim.
