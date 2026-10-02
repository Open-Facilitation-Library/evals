# Evaluation reporting: EEE and Evaluation Cards

Research note, 2026-10-02. Proposals, not an implemented interchange contract or a platform choice.

Sources: [Every Eval Ever](https://arxiv.org/abs/2606.14516v1), §3–4 and instance schema; [Evaluation Cards](https://arxiv.org/abs/2606.09809v2), §3–4 and Appendices D, H, J. Both are EvalEval Coalition work. The paper's deployed Cards mechanisms and Appendix J's lifecycle recommendations are not the same thing.

## Exchange and interpretation are separate seams

EEE supplies a portable results document and optional instance-level sidecar. Cards composes run results, benchmark descriptions and model metadata into an interpretable report. Neither defines facilitation quality, replaces practitioner calibration, or requires changing the runner.

OFL's annotated benchmark schema describes conversations, not results exchange. A new exchange boundary should preserve method/profile/runtime/outcome separation, calibration reference, evidence classes, target scope, consent and rights restrictions.

## Separately scoped mechanisms

| ID | Mechanism and verification target |
|---|---|
| EEE-01 | Adapter over native results; pin external schema, document loss, preserve native references; test recorded fixtures without generation. |
| EEE-03 | Typed metric units, direction, range, normalization, parameters and denominator; raw means, pass rates and corrected estimates remain distinct. |
| EEE-04 | Aggregate JSON linked to sample JSONL by IDs, checksum and row count; access-controlled sidecars remain possible. |
| EEE-05 | Exact scored turn/window/answer distinct from transcript context; test against the existing `interop/weval/` probe. |
| EEE-07 | Missing metadata remains unknown; partial archival records may be stored but excluded from comparisons. |
| EEE-08 | Validate schema, enums, references, row counts, checksums, nulls and aggregate/sample linkage. |
| EEE-09 | Retain conflicting runs and correction/retraction/dispute/supersession links; no silent replacement. |
| EEE-11 | Bounded difficulty/discrimination study over aligned cases, simpler diagnostics before IRT; no universal facilitation latent score. |
| CARD-01 | Compose method/profile definitions, results and calibration evidence instead of another manual form. |
| CARD-03 | Conservative alias resolution, false-merge tests and an unresolved-review path; pin rule versions. |
| CARD-04 | Reproducibility gap inventory beside each result, including effective context and target scope; metadata presence is not demonstrated replay. |
| CARD-06 | Distinguish self-report, independent evaluation and collaboration; organizations are not runs. Existing issue: [evals#4](https://github.com/Open-Facilitation-Library/evals/issues/4). |
| CARD-07 | Configuration divergence separate from score disagreement across reporters; include missingness, overlap and uncertainty. |
| CARD-08 | Technical and plain-language views from one evidence record; simplify language, not caveats. |
| CARD-10 | Dated reporting-gap inventory across methods, languages, populations and evidence classes; private/held is not absent. |

The [method-specs reporting note](https://github.com/Open-Facilitation-Library/method-specs/blob/main/docs/conformance/evaluation-reporting-notes.md) covers CARD-02 hierarchy, CARD-05 documentation coverage, CARD-09 field-level source evidence, CARD-11 interpretation-policy versions and LIFE-11 lifecycle ownership. It is a research companion, not an amendment to v0.1.

## Safety and interpretation boundaries

- Preserve unavailable scores as `null` with failure evidence, never the described converter's missing-numeric fallback of `0.0`/`false`. Null exclusions and denominator changes must be visible.
- A transcript supplied as context does not prove every turn was scored; the existing weval experiment is evidence for target attribution, not a new probe to repeat.
- Cards reports benchmark resolver accuracy of 77.4% on its sampled in-domain data. This is not a safe general-purpose identity merge policy.
- The paper's 5%-of-range divergence threshold is an integrity warning, not a statistically justified regression gate.
- Documentation coverage, independence and replay metadata do not certify validity, human benefit or safety.
- Public reporting does not authorize public participant transcripts or held method material.

## Lifecycle recommendations, not hosted-tool features

Appendix J additionally recommends decision-linked briefs, construct/outcome justification, prospective protocols, pilots, power and uncertainty, holdout/exposure policies, human-rater safeguards, failure/adaptation accounting, controlled replication, lifecycle ownership and disclosure of omitted variants. Reuse existing work on these where it matches the mechanism; do not bundle them into a second harness.

## Issue cross-references

| Technique | Repository issue |
|---|---|
| EEE-01 Adapter | #10 |
| EEE-03 Metric semantics | #11 |
| EEE-04 Aggregate/sample sidecar | #9 |
| EEE-05 Scored target | #12 |
| EEE-07 Unknown metadata | #14 |
| EEE-08 Boundary validation | #13 |
| EEE-09 Result correction history | #16 |
| EEE-11 Difficulty/saturation study | #17 |
| CARD-01 Evidence composition | #15 |
| CARD-03 Identifier resolution | #18 |
| CARD-04 Reproducibility gaps | #19 |
| CARD-06 Evaluator independence | #4 (existing issue enriched) |
| CARD-07 Setup/reporter divergence | #21 |
| CARD-08 Reader modes | #20 |
| CARD-10 Reporting-gap inventory | #22 |

All new issues remain open research/implementation follow-up; no contract or tool is implemented by this note. Companion method-specs issues: #37 hierarchy, #38 documentation coverage, #39 field-source evidence, #40 interpretation versions, #41 lifecycle owners. Those numbers refer to `Open-Facilitation-Library/method-specs`, not this repository.
