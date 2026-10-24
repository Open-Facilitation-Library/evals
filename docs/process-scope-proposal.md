# Process scope across sessions, events and artifacts

**Status:** non-normative design proposal, `process_scope_version: "0.1-proposal.1"`.
This defines a proposed attribution/coverage boundary, not an executable schema, resolver, runner
or instrument capability. It neither widens [scoring-scope 0.1.0](scoring-scope.md) nor changes the
transcript processor. Actual instrument support remains in
[evals #24](https://github.com/Open-Facilitation-Library/evals/issues/24).

The [conformance v0.3 record contract](https://github.com/Open-Facilitation-Library/method-specs/blob/447a0e9c441e629775a4c6673d2c26e5e4a6b688/docs/conformance/record-contract-v0.3.md)
separates portable subject requirements from concrete bindings. This proposal describes how an
adapter can identify a bounded process and account for its required evidence before making those
bindings. It also applies to a host-designed process with its own declared contract; an OFL method
profile is not required.

## The assessed unit

A process scope names a particular process instance, selected protocol/variant, actor cohort,
stages, capture boundary and required observations. It is not simply every transcript a system
happens to export. Logical stages can span several sessions, and one session can contain several
stages. Collection can use conversations, forms, boards, tools or human actions.

Each measurement uses a frozen scope revision. New evidence, corrections, late arrivals, changed
membership or different selections create a new revision and new affected bindings. Old reports
retain their original inputs and interpretation; a changed snapshot does not silently rescore them.
An in-progress process can have valid bounded stage/handoff assessments without a whole-process
assessment. A closed round is not automatically the entire multi-round process.

## Proposed process manifest

Concrete runtime identifiers belong in this manifest/adapter, not portable method requirements.
Every reference below is controlled and revision-pinned; a mutable URL alone is insufficient.

| Field | Proposed meaning |
| --- | --- |
| `process_scope_version`, `id`, `revision` | Contract version, scope identity and immutable snapshot identity. |
| `process_ref`, `contract_ref` | Particular process instance and selected method/spec/variant or custom process contract, each versioned independently. |
| `boundary` | Included logical stages/activities and start/end conditions, capture cutoff, and source-stream watermarks or equivalent capture receipts. Timestamps alone do not establish causal ordering or log completeness. |
| `scope_plan_ref` | Versioned plan identifying the expected cohort, activities, required observation units and applicable policies independently of what was observed or scored. |
| `actors` | Pseudonymous actor/role references and effective membership events. Withdrawn, unfinished or excluded actors remain accounted for with their states and reasons. |
| `sessions` | Concrete session/activity references, revisions, states, mapped logical stages and actor associations. A session is not required to be a chat. |
| `events` | Revision-pinned observations of contributions, permissions, tool actions, completion, host decisions, transitions or delivery. Identify actors and source-local sequence or evidenced causal predecessors. |
| `artifacts` | Exact input/output revisions, producing event, contributing inputs, transformation/configuration references and intended consumers. A summary's availability does not establish delivery or consumption. |
| `relations` | Explicit stage/session, actor/action, input/output and handoff links. Each relation records `basis: declared` or `observed` and its source/evidence reference. Declaration is not execution evidence. |
| `selections` | Versioned selector-contract references, requested bounds and explicit resolved subjects. No implicit latest-turn, latest-artifact or all-current-members selector. |
| `coverage` | Required units matched to observations, policy-permitted exclusions, missing/withheld/unresolved units and reasons. Counts describe coverage, not quality. |

Session, event and artifact ids must be unambiguous within the scope. Relations must resolve to
the selected revisions. Conflicting revisions or impossible causal cycles are scope-validation
errors, not evidence of a facilitator's failure. Unordered concurrent events remain unordered;
sorting wall-clock timestamps cannot manufacture a cross-session causal edge.

Required units come from the selected plan/criterion coverage, not an automatic Cartesian product
of every actor, stage and metric. An adapter records how each expected set was resolved. It must
not shrink the expected set to the rows for which scores happen to exist.

## Information flow and handoffs

For each assessed handoff, identify:

1. The producing stage/activity and exact contributing inputs, including the permitted source cohort.
2. The resulting artifact revision and transformation/effective-configuration references needed
   for the claim, such as aggregation rules or the instructions actually used.
3. The receiving activity/actors and observations establishing delivery, access or consumption,
   according to the requirement. Intended audience alone establishes none of these.
4. The permissions, actor identity and ordering boundaries relevant to the criterion.

A process map can contain source declarations and observed execution, with their bases visible.
Only the latter can establish an exercised routing/transition claim. Missing events must not be
invented from polished facilitator wording or a plausible final synthesis. An unobserved path is
a coverage gap; an observed leak or wrong-person delivery is a negative finding.

## Cohort, quorum and incomplete participation

Completeness is relative to the selected variant and claim. A variant may permit host advancement
after quorum, a deadline or an approved withdrawal. This is not a universal method requirement.
Preserve its denominator, cohort and decision policy at the boundary being assessed, including
approval evidence when that variant requires it. A later roster change does not rewrite the past.

Distinguish these cases:

- **Permitted exclusion:** an unfinished response is outside an explicitly declared completed-only
  source snapshot. Retain the actor/state, policy and exclusion reason; do not fabricate a response.
- **Required evidence missing:** the selected claim needs that actor's delivery event, contribution
  or outcome, and no authorized observation is available. Retain a gap; quorum does not erase it.
- **Observed violation:** all-submitted was the selected policy and advancement occurred with
  unfinished actors, or a handoff delivered another actor's memory. Report the scoped negative
  result when the relevant evidence and instrument support exist.

Evaluation coverage does not impose an extra application progression barrier. A host can advance
under a valid quorum policy while an evaluator still lacks evidence for a broader claim.

## Bind the resolved subjects to conformance v0.3

The manifest is not a new v0.3 subject kind. Resolve each criterion's target and required context
through the declared selector contract, then bind subjects using v0.3's existing kinds:
conversation, configuration, artifact, execution trace or participant response.

A materialized collection/projection needs its own controlled reference, immutable revision,
representation and provenance to the selected source members. Its kind must match the criterion's
subject requirement; an artifact containing links to traces does not automatically become an
execution trace. Each requirement id still has one association in the v0.3 binding. Cross-artifact
selection needs an explicitly supported collection/selector contract; this proposal supplies no
universal parser for one.

Keep resolved targets distinct from context. A synthesis can be assessed against all contributing
positions without scoring those positions as facilitator turns. Shared context across sessions
does not imply that each session or actor was assessed. The single-transcript selectors retain
their existing zero-based absolute indexes; they are not reinterpreted as process-event indexes.

Instrument support and evidence coverage are independent. A complete manifest can still be
unsupported by a latest-turn-only instrument. A capable instrument can still lack required input.
Neither supplies a whole-process measurement; retain the reason and the narrower valid findings.

## Results and aggregation boundary

**Recommended first-version default:** required coverage gaps prevent a whole-process score.
Retain all valid scoped results and observed violations prominently, alongside the unmeasured
requirements. Missing data cannot erase a known violation or become a default pass, false or zero.
This is a proposal for review, not an implemented reporting policy.

Report a collection of criterion assessments indexed by their selected stage/activity, actor/cohort,
boundary, binding and evidence class. Keep completed negative answers separate from failed or
not-run evaluations with null answers. A whole-process verdict cannot be inferred merely because
every available turn-level result passed.

No universal process score or averaging rule is supplied. If aggregation is requested, pin a
separate policy identifying the claim/layer, unit, constituent result references, expected
denominator, operation/weights, answer/rubric versions and missing-data treatment. A numeric type
alone does not justify arithmetic; named choices and booleans are not silently converted to scores.
Method fidelity, interaction preferences, runtime behavior and participant outcomes remain separate.

An exploratory partial aggregate would require a separately declared policy and explicit original
denominator/exclusions. It cannot represent the whole-process assessment requested here. This
alternative remains a review choice; the default above does not adopt it.

## Worked boundary example

The following is synthetic design material, not a captured process or executed measurement. All
references are placeholders; the notation illustrates the manifest, not a selector grammar.

```yaml
process_scope_version: '0.1-proposal.1'
id: example-round-handoff
revision: fixture-snapshot-1
process_ref: example://processes/panel-a@1
contract_ref: example://variants/host-quorum-completed-inputs@1
boundary:
  stages: [collection, reconsideration-entry]
  cutoff_ref: example://capture-receipts/panel-a@1
scope_plan_ref: example://scope-plans/round-handoff@1
actors:
  cohort_ref: example://cohorts/panel-of-ten@1
  completed: [p1, p2, p3, p4, p5, p6, p7, p8]
  unfinished: [p9, p10]
sessions:
  inventory_ref: example://sessions/collection-and-entry@1
events:
  inventory_ref: example://events/round-handoff@1
  advance_event_ref: example://events/host-advance@1
artifacts:
  inventory_ref: example://artifacts/round-handoff@1
  summary_ref: example://artifacts/summary-from-eight@1
relations:
  - basis: observed
    ref: example://relations/summary-deliveries@1
selections:
  source:
    contract_ref: example://selectors/completed-source@1
    resolved_subject_ref: example://artifacts/completed-response-bundle@1
  delivery:
    contract_ref: example://selectors/panel-deliveries@1
    resolved_subject_ref: example://traces/observed-deliveries@1
coverage:
  source:
    required: [p1, p2, p3, p4, p5, p6, p7, p8]
    observed: [p1, p2, p3, p4, p5, p6, p7, p8]
    excluded: [p9, p10]
    exclusion_policy_ref: example://policies/completed-inputs-only@1
  delivery:
    required: [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]
    observed: [p1, p2, p3, p4, p5, p6]
    missing: [p7, p8, p9, p10]
```

The completed-only source can be covered at 8/8 under this variant, while next-stage delivery is
observed for only 6/10 actors. The two unfinished responses are permitted source exclusions; the
four missing delivery observations are gaps for the all-panel delivery claim. Valid source and
advancement findings remain reportable, but there is no all-panel delivery or whole-process score.
This bounded handoff also makes no claim about later stages of the eventual process.

Under an all-submitted variant, the same observed advancement at 8/10 would instead support a
negative barrier finding. The expected contract changes; the evaluator must not silently apply
whichever policy makes the observation pass.

## Acceptance cases for the future contract

These are expected distinctions for review, not passed behavioral tests:

| Case | Required interpretation |
| --- | --- |
| One logical stage spans private interviews and a shared board | Include the declared activities and their information-flow links; no chat-only approximation. |
| Host advances at approved quorum | Assess against the chosen variant; retain unfinished actors and completed-only source membership. |
| Later withdrawal changes the denominator | New scope revision; prior boundary and required approval remain pinned. |
| A summary omits a minority position | Assess the exact artifact against its full contributing inputs; final-turn fluency is insufficient. |
| Correct source instructions but wrong-person memory delivery | Preserve the observed routing violation independently of source/wording checks. |
| Artifact exists but delivery was not observed | Availability does not satisfy a delivery requirement. |
| Four required delivery observations are missing | Keep scoped findings, named gaps and the original denominator; no whole-process score. |
| All available turn scores pass, but an earlier session is missing | Do not infer process conformance from the available subset. |
| Clock timestamps conflict across sources | Require evidenced ordering or retain uncertainty; do not infer causality by sorting. |
| A late event changes the captured evidence | New revision/bindings and an attributed supersession link; old report retains its recorded evidence and interpretation. |
| The instrument supports only the latest assistant turn | No process measurement, even with a complete manifest; retain a separately valid turn result. |
| Required material is withheld or inaccessible | Record the controlled reference and gap/reason; no permission expansion or fabricated content. |

## Compatibility and access

scoring-scope 0.1.0 remains the contract for its transcript selectors, explicit aggregation and
numeric measurements. This proposal adds no new selector or answer type to that schema. Historical
probe outputs, criterion/evaluator authority and calibration records retain their own versions.

A reference grants no permission to fetch or publish its contents. Keep actor identifiers,
participant responses, protected method material and derived projections under their existing
access/consent restrictions. Checked-in examples use synthetic data only.

Before adoption, review these manifest/coverage semantics and choose the incomplete-coverage
policy. Any executable schema, bounded selector implementation, adapter or aggregation policy is a
separate implementation step with positive/negative fixtures. No provider calls, new benchmark
runs or production changes are authorized by this design.
