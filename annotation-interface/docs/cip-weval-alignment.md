# OFL × Weval — where the two projects meet, and one question we need answered (2026-08-05, draft for CIP)

**For:** Faisal Lalani, Zarinah Agnew (Collective Intelligence Project), via Elianna DeSota (Metagov)
**From:** Artem Zhiganov (Harmonica / Open Facilitation Library)
**Status:** draft — not yet sent

## The ask

**One question, answerable in a sentence: does Weval already have infrastructure for collecting and managing human expert labels, or does that layer not exist on your side?**

We are designing an annotation and calibration interface for the Open Facilitation Library, and the answer determines whether we build it or plug into yours. We would rather find out before we build. A 30-minute call would cover it, or a reply to this note if that is easier.

If the answer is "we have it," the rest of this document is a proposal to use it. If the answer is "we don't," it is a proposal for how the two projects compose without overlapping.

## Why we are asking you specifically

We adopted your blueprint grammar for the eval-spec half of our work (HAR-1068), and in mapping our own scope against Weval's we found the boundary unusually clean:

| Layer | Weval | OFL would add |
|---|---|---|
| Eval spec format (blueprints, rubric points, functions, OR-paths) | yes — we adopt as-is | — |
| Machine judging (multi-judge consensus, pointwise, low-temperature) | yes | — |
| Judge-vs-judge reliability (Krippendorff's α, judge fingerprints) | yes | — |
| Human annotation exchange (packs, labels, a labelling surface) | **the open question** | yes, if not |
| Real production-session ingestion (+ PII and consent posture) | not that we can see | yes |
| Judge-vs-**human** validity (TPR/TNR against expert ground truth, split discipline, bias-corrected published rates, labeller provenance) | not that we can see | yes |

The last row is the one we care most about, and your own writing is why. Weval's methodology cites CIP's *"LLM Judges Are Unreliable"* and answers it with reliability mechanisms: consensus across judges, pointwise rather than pairwise scoring, agreement statistics between judges. Those establish that judges agree with **each other**. What we are trying to establish is that they agree with **expert facilitators** — validity on top of reliability. As far as we can tell from the public docs, nothing in the Weval stack measures that, and no blueprint in `weval-org/configs` carries a claim about it.

We may simply be reading the docs and missing an internal tool. Hence the question.

## What we would reuse either way

- **Criteria travel in weval point form.** In our design, the criterion text a human labels against is the same text a judge scores, and the same text a blueprint `should` point carries. One criterion, two raters, which is what makes an agreement statistic meaningful.
- **The session canonical form extends weval `messages`**, so real facilitation transcripts move into blueprint-shaped tooling without translation.
- **Krippendorff's α (ordinal)** — the statistic you apply judge-vs-judge, applied human-vs-human between labellers, reported in the same bands.

## The proposal, if the layer does not exist on your side

1. **OFL → Weval:** facilitation evals published as CC0 blueprints in your grammar, multi-turn and `assistant: null` regenerative cases included, co-maintained if that is useful to you.
2. **Weval ← OFL:** a *calibration report* artifact that can accompany a blueprint — who labelled it and at what expertise level, TPR/TNR against those labels, corrected pass rates. It answers "does this rubric's judge actually track expert judgment," which is a question your own critique raised and which no configs entry currently answers.

## What we would want to learn from you

Your expert-to-rubric process — consultation, public dialogues, rubric generation. You have well over a year of practice there and we would rather not re-derive it badly. This is a genuine ask, independent of whether the infrastructure question goes our way.

## Materials

- Draft interchange spec: `Open-Facilitation-Library/evals` → `annotation-interface/` (schemas + OpenAPI, v0.1 draft, CC0)
- The manual pilot already running: `calibration/` in the same repo — expert facilitators labelling real anonymized closing turns

---

### Note for Artem before sending (delete this section)

This was rewritten on 2026-08-05 after the OFL scoping call. The earlier draft opened by proposing a working session to align two workstreams, which assumed a partnership that is not currently in evidence: CIP has not replied in roughly 2.5 weeks despite a second nudge, and Flynn Devine (ex-CIP, now Demos UK) told you their direction with Weval is "very, very different" from what OFL wants.

Two things follow. First, a note that presumes alignment is easy to ignore; a single concrete question is harder to ignore and is cheap for them to answer. Second, we genuinely need the answer — the HAR-1413 shaping selected a design where OFL hosts the annotation service, and Elianna's remark that CIP "had a pretty robust infrastructure for doing this labeling and work" means that choice was made without knowing what already exists. Building V3 before this is answered risks duplicating their work.

If they do not reply within a week or two, that is itself an answer for planning purposes, and the service question can be settled on the assumption that no shared infrastructure is coming.
