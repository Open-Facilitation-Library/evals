# Process scope — v0.1.0 adoption note

The reviewed process-scope design is adopted as the
[process-scope v0.1.0 contract](process-scope-v0.1.md) on 2026-10-25.
This page records provenance; the normative rules live in that contract.

The [reviewed proposal, version 0.1-proposal.1](https://github.com/Open-Facilitation-Library/evals/blob/e3ad7e5a42e4e106aa847b8cf4777b49570ffd4c/docs/process-scope-proposal.md)
remains available at its immutable pre-adoption revision, including the selected coverage policy,
expected-set clarification and evidence-of-non-occurrence rules. Its illustrative YAML and
stipulated acceptance cases remain design material, not executed measurements.

## Design acceptance mapping

| Design requirement | Contract evidence |
| --- | --- |
| Bound a process across sessions, tools, events and artifacts | Assessed unit and process manifest; frozen revisions and explicit relations |
| Preserve expected cohorts and distinguish unknown from empty sets | Expected-set resolution rules and corresponding design acceptance cases |
| Distinguish incomplete capture from evidenced non-occurrence | Information flow and handoffs; authoritative observation contract, due boundary and completeness evidence |
| Respect the selected quorum/withdrawal variant | Cohort, quorum and incomplete participation; completed-only exclusions remain separate from required gaps |
| Reuse v0.3 targets, contexts and immutable bindings | Bind the resolved subjects to conformance v0.3; no new subject kind or implied selector support |
| Retain scoped findings and violations when required coverage is missing | Results and aggregation boundary; no whole-process score or default answer for gaps |
| Preserve historical meaning, access boundaries and implementation limits | Compatibility and access; independent versions, controlled references and separate executable work |

These are design/documentation acceptances. The canonical document retains the 20 synthetic
acceptance cases; promoting its illustrative version to 0.1.0 establishes no executed process
check, selector support, calibration, method endorsement or participant outcome. An executable
schema, resolver, adapter and reporting enforcement remain separate work.
