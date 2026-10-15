# Harmonica × Crown Shy — scope distinction for the OFL annotation interface (2026-08-05, draft for Stuart)

**For:** Stuart Lynn (Crown Shy)
**From:** Artem Zhiganov (Harmonica / OFL)
**Status:** draft — not yet sent

## The ask

Before the OFL interchange spec freezes v0.1, we need your read on one design seam and five questions below. The intent: your sessions and Harmonica's flow through the same annotation + calibration loop without the format privileging either app's shape. A 30-minute pass over this doc (async comments fine) is enough.

## The distinction we are encoding

The Mozilla scope covers two app kinds, and ours differ exactly along it:

- **Harmonica — encountering other opinions.** The object under evaluation is the *facilitator's conversational conduct*: turns in a multi-party opinion-surfacing process. Quality axes are conversational (question shape, diagnose-before-intervene, closing discipline).
- **Crown Shy — encountering knowledge (RAG-based).** The object includes *what the system retrieved and how faithfully the conversation grounds in it*. Quality axes presumably include retrieval fit and grounding, not only conversational conduct.

The interchange treats both as the same object family: a `SessionOutput` = an ordered `messages` array + a **target** (`final_turn` for turn-in-context judgments, `transcript` for whole-session judgments) + provenance and consent posture.

## The proposed seam for Crown Shy

An optional `retrieved_context` attachment on `SessionOutput`: the passages the system retrieved to ground its turns, each with a scrubbed source label. Labellers and judges then see what the system *had* when it spoke — without which a grounding axis is unjudgeable.

This is a proposal, not a decision. It is marked "pending Crown Shy review" in the schema.

## Five questions for you

1. **Does the messages-array shape fit your sessions at all?** Or does a Crown Shy session have structure (branches, documents-as-turns, non-conversational interactions) that role/content flattens badly?
2. **Is per-record `retrieved_context` the right granularity** — or does retrieval happen per-turn in a way that needs attachment at the message level?
3. **What would your first annotation axis be?** (Ours are conversational: closing discipline, question shape. If yours is "grounded in the retrieved source," the criterion format needs nothing extra — but you'd know better.)
4. **Consent + scrubbing:** the spec makes the platform attest its own PII pass before anything leaves it. Does Crown Shy's data situation (sources, user agreements) fit the three consent postures (`research_consented | anonymized_public | private_restricted`), or is a fourth needed?
5. **Adoption cost check:** the bridge is push-only — you'd write a client that emits packs and pulls labels/reports; no public endpoints on your side. Does that match your appetite, and is October realistic for an L0 (file-level) conformance from Crown Shy?

## Where this lives

Draft spec: `Open-Facilitation-Library/evals` → `annotation-interface/` (README + schemas + OpenAPI). Your comments can go straight onto the PR when it opens, or back through this doc.
