# OFL Annotation & Calibration Interface — v0.1 draft (2026-08-05)

**Status: DRAFT for partner review** (Harmonica, Crown Shy, CIP). Nothing here is stable until v0.1 is tagged. Spec license: CC0. Data carried by the interface is licensed per pack, not by this spec (see [Data, consent, licensing](#data-consent-licensing)).

## What this is

The shared vocabulary that lets any participating platform exchange the eval commons' objects — real session outputs, annotation packs, expert labels, judge verdicts, calibration reports — so that labels collected on one platform's data can calibrate an LLM judge anywhere, and a number published "per the OFL standard" is auditable from its artifacts.

This formalizes the loop the [`calibration/`](../calibration/README.md) directory already runs by hand (markdown packs, labels by PR): same loop, machine-readable form. The manual flow remains valid as the offline profile of this interface.

## Relationship to weval (CIP)

[Weval](https://weval.org) owns **eval specs + machine judging**: blueprint grammar (prompts, `should` rubric points, functions, OR-paths), multi-judge consensus, judge-vs-judge Krippendorff's α. This interface adds the three layers weval does not have — **human annotation exchange, real-session ingestion, human↔judge calibration reporting** — and reuses weval at three seams:

1. **Criteria travel in weval point form.** The human labels against the same criterion text the judge scores. One criterion, two raters — that is what makes TPR/TNR meaningful.
2. **The session canonical form extends weval `messages`** (role/content arrays) with a target designation and provenance.
3. **Krippendorff's α (ordinal)** is reused human-vs-human for inter-labeller agreement, alongside TPR/TNR (human-vs-judge validity).

Full boundary analysis: `docs/cip-weval-alignment.md`.

## Objects

| Object | Schema | Produced by | Consumed by |
|---|---|---|---|
| Rubric | [`schemas/rubric.schema.yaml`](schemas/rubric.schema.yaml) | facilitators (authored), platform maintainer (transcribed) | pack builder, judge prompts |
| SessionOutput | [`schemas/session-output.schema.yaml`](schemas/session-output.schema.yaml) | platform | pack builder, annotation UI, judges |
| AnnotationPack | [`schemas/annotation-pack.schema.yaml`](schemas/annotation-pack.schema.yaml) | platform | OFL annotation service + UI |
| Labels | [`schemas/labels.schema.yaml`](schemas/labels.schema.yaml) | human labellers (via the shared UI, or as files) | platform, calibration report |
| JudgeVerdicts | [`schemas/judge-verdicts.schema.yaml`](schemas/judge-verdicts.schema.yaml) | platform's judge (or a weval run) | calibration report |
| CalibrationReport | [`schemas/calibration-report.schema.yaml`](schemas/calibration-report.schema.yaml) | OFL service (computed from stored artifacts, never self-reported) | everyone; the companion artifact for published blueprints |

## Where criteria come from — the intake stage

**Facilitators do not author machine-readable anything.** They write criteria in whatever form suits them: prose, a worksheet, a marked-up example, a recorded discussion. A platform maintainer transcribes that into a `Rubric`, and **the author confirms the transcription says what they meant** before it is used or published as facilitator-authored.

This is a settled division of labour, not a convenience:

> Facilitators create the evals; developers build the LLM judges. Evals are not technical — they encode what practitioners think the failure modes are. (OFL scoping call, 2026-08-04, provisional consent)

The interface therefore starts one step earlier than an annotation format would suggest:

```
facilitator's own form  ──transcribe──▶  Rubric  ──criterion text──▶  AnnotationPack.axes
   (prose, worksheet,      (maintainer,                                (what humans label
    session, examples)      author confirms)                            and judges score)
```

`Rubric.provenance.confirmed` is the gate. An unconfirmed rubric may be used for internal iteration, but a calibration claim resting on one is a claim about the *transcriber's* judgment, not the facilitator's, and must not be presented otherwise.

## The loop

```
facilitators ──authored rubrics──▶ maintainer ──Rubric──┐
                                                        ▼
platform ──POST pack──▶ OFL annotation service ──magic link──▶ shared labelling UI
   │                          ▲       │                              │
   │                          │       └──────GET labels──────────────┘
   ├──POST judge verdicts─────┘
   └──GET calibration report ◀── computed: TPR/TNR + splits + correction + α + provenance
```

## Canonical session form

A `SessionOutput` is a weval-compatible `messages` array plus an explicit **target**:

- `target: final_turn` — the last assistant turn is the object under evaluation; prior messages are context (turn-in-context).
- `target: transcript` — the whole conversation is the object (session-level axes).

Both units are first-class; each pack record declares its own. Sessions from retrieval-based (knowledge-encountering) platforms may attach retrieved context per record — proposed seam, pending Crown Shy review (`docs/crown-shy-scope.md`).

**A third unit exists in the scope agreement and not in v0.1.** Evals may be written for an individual turn, for a whole session with one participant, **or for the whole process across every participant's sessions**. The third is where process-outcome questions live (did participants get better at self-reflection, did positions move), and it is a named target of the Commoning Standard's scope. `Rubric.applies_to.unit` accepts `cross_session` so such criteria are not lost at intake, but no `SessionOutput` shape carries it yet. Closing that gap needs the outcome workstream's own scoping first.

## Conformance levels

| Level | Means | Example |
|---|---|---|
| **L0 — artifact** | Produces/consumes the schemas as files. No service required. The `calibration/` directory's manual flow is L0 | a platform emails a conforming pack; labels come back as a PR |
| **L1 — bridge** | Speaks the service API (`openapi.yaml`): push packs + verdicts, pull labels + reports | Harmonica reference bridge |
| L2 — live *(future)* | Streaming/webhook profile | not specified in v0.1 |

## API surface

Six endpoints, defined in [`openapi.yaml`](openapi.yaml): `POST /v0/packs` · `GET /v0/packs/{id}` · `POST /v0/packs/{id}/labels` · `GET /v0/packs/{id}/labels` · `POST /v0/packs/{id}/verdicts` · `GET /v0/packs/{id}/report`. Auth: per-platform API key; labellers enter via per-pack magic link. Hosting of the reference service is an open governance question (deliberately outside this spec).

## Data, consent, licensing

- Every `SessionOutput` carries a **scrub attestation** (what PII pass it went through) and a **consent posture** (`research_consented | anonymized_public | private_restricted`). The platform is responsible for both before anything leaves it — the interface never moves raw data out of a platform's control.
- Pack **data** licensing is declared per pack (`license` field). The spec itself is CC0; a pack of real conversations usually is not.
- Labeller identity: labels carry a labeller id + **expertise class** (`expert_facilitator | practitioner | crowd | developer`), because a calibration claim is only as strong as who labelled (see `calibration/README.md`).

## Versioning

`spec_version` field on every object, semver. v0.x may break; v1.0 freezes the schemas. Changes by PR to this directory.

## Open questions for v0.1 review

1. **Crown Shy seam** — does the retrieved-context attachment cover knowledge-encountering sessions? (`docs/crown-shy-scope.md`, Stuart)
2. **Verdict scale** — binary pass/fail per axis (current Harmonica practice) vs weval's 5-point CLASS scale. v0.1 uses binary with an optional `score` for finer scales; feedback welcome.
3. **Does anyone already run the annotation service?** The design assumes OFL hosts one. CIP may already have labelling infrastructure; that question is outstanding (`docs/cip-weval-alignment.md`) and should be answered before anyone builds the service. The schemas are needed either way.
4. **Hosting/operations** of the reference service, if it is built here — who runs it and who pays. Governance, not spec; tracked separately.
5. **The `cross_session` unit** — outcome-level criteria can be authored but not yet packed (see above).
