# Harmonica × Crown Shy — the scope seam in the annotation interface

**Status:** open questions for Crown Shy, as of v0.2 (2026-10-20). Comments on the pull request are the easiest route.

## The distinction we are encoding

The Mozilla scope covers two app kinds, and ours differ exactly along it:

- **Harmonica — encountering other opinions.** The object under evaluation is the *facilitator's conversational conduct*: turns in a multi-party opinion-surfacing process. Quality axes are conversational (question shape, diagnose-before-intervene, closing discipline).
- **Crown Shy — encountering knowledge (RAG-based).** The object includes *what the system retrieved and how faithfully the conversation grounds in it*. Quality axes presumably include retrieval fit and grounding, not only conversational conduct.

The interface treats both as the same object family: a `SessionOutput` = an ordered `messages` array + a **target** (`final_turn` for turn-in-context judgments, `transcript` for whole-session judgments) + provenance and consent posture.

## The proposed seam for Crown Shy

An optional `retrieved_context` attachment on `SessionOutput`: the passages the system retrieved to ground its turns, each with a scrubbed source label. Labellers and judges then see what the system *had* when it spoke — without which a grounding axis is unjudgeable.

This is a proposal, not a decision. It is marked "pending Crown Shy review" in the schema.

## Questions for Crown Shy

1. **Does the messages-array shape fit your sessions at all?** Or does a Crown Shy session have structure (branches, documents-as-turns, non-conversational interactions) that role/content flattens badly?
2. **Is per-record `retrieved_context` the right granularity** — or does retrieval happen per-turn in a way that needs attachment at the message level?
3. **What would your first annotation axis be?** (Ours are conversational: closing discipline, question shape. If yours is "grounded in the retrieved source," the criterion format needs nothing extra — but you'd know better.)
4. **Consent + scrubbing:** the spec makes the platform attest its own PII pass before anything leaves it. Does Crown Shy's data situation (sources, user agreements) fit the three consent postures (`research_consented | anonymized_public | private_restricted`), or is a fourth needed?
5. **Adoption cost:** conformance means producing and reading these objects as files, with no endpoints on either side. Is a first conforming pack from Crown Shy realistic, and what would make it cheaper?
