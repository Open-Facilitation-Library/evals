# OFL Annotation & Calibration Interface — v0.2 draft (2026-10-20)

**Status: DRAFT for partner review** (Harmonica, Crown Shy, CIP). Nothing here is stable until v1.0. Spec license: CC0. Data carried by the interface is licensed per pack, not by this spec (see [Data, consent, licensing](#data-consent-licensing)).

**What changed from v0.1 (2026-08-05).** v0.1 also specified a hosted service: six endpoints that platforms would call to push packs and pull labels and reports. v0.2 drops it. Partners have agreed to exchange data as files first, without integrating systems, and which labelling tool to share, and who hosts it, is still open. What remains is the part that matters whatever is decided there: the six objects, exchanged as files. v0.2 also adds three labelling rules (see [Labelling rules](#labelling-rules)).

## What this is

The shared vocabulary that lets any participating platform exchange the eval commons' objects — real session outputs, annotation packs, expert labels, judge verdicts, calibration reports — so that labels collected on one platform's data can calibrate an LLM judge anywhere, and a number published "per the OFL standard" is auditable from its artifacts.

This formalizes the loop the [`calibration/`](../calibration/README.md) directory already runs by hand (markdown packs, labels by PR): same loop, machine-readable form.

## Relationship to weval (CIP)

[Weval](https://weval.org) owns **eval specs + machine judging**: blueprint grammar (prompts, `should` rubric points, functions, OR-paths), multi-judge consensus, judge-vs-judge Krippendorff's α. This interface adds the three layers weval does not have — **human annotation exchange, real-session ingestion, human↔judge calibration reporting** — and reuses weval at three seams:

1. **Criteria travel in weval point form.** The human labels against the same criterion text the judge scores. One criterion, two raters — that is what makes TPR/TNR meaningful.
2. **The session canonical form extends weval `messages`** (role/content arrays) with a target designation and provenance.
3. **Krippendorff's α (ordinal)** is reused human-vs-human for inter-labeller agreement, alongside TPR/TNR (human-vs-judge validity).

## Objects

| Object | Schema | Produced by | Consumed by |
|---|---|---|---|
| Rubric | [`schemas/rubric.schema.yaml`](schemas/rubric.schema.yaml) | facilitators (authored), platform maintainer (transcribed) | pack builder, judge prompts |
| SessionOutput | [`schemas/session-output.schema.yaml`](schemas/session-output.schema.yaml) | platform | pack builder, labelling surface, judges |
| AnnotationPack | [`schemas/annotation-pack.schema.yaml`](schemas/annotation-pack.schema.yaml) | platform | the labelling surface |
| Labels | [`schemas/labels.schema.yaml`](schemas/labels.schema.yaml) | human labellers | platform, calibration report |
| JudgeVerdicts | [`schemas/judge-verdicts.schema.yaml`](schemas/judge-verdicts.schema.yaml) | platform's judge (or a weval run) | calibration report |
| CalibrationReport | [`schemas/calibration-report.schema.yaml`](schemas/calibration-report.schema.yaml) | whoever publishes a calibration claim, computed from the stored Labels and JudgeVerdicts (never self-reported) | everyone; the companion artifact for published blueprints |

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

Every arrow is a file handed over, by secure file transfer, email or pull request:

```
facilitators ──authored rubrics──▶ maintainer ──Rubric──┐
                                                        ▼
platform ──AnnotationPack──▶ labelling surface ──▶ labellers ──Labels──┐
   │                                                                   ▼
   └──JudgeVerdicts (same records, same criteria)──────────▶ CalibrationReport
                                                computed: TPR/TNR + splits + correction
                                                + α + control accuracy + per-record view
```

The labelling surface can be anything that shows a pack's records and criteria and writes `Labels`: the markdown packs in `calibration/`, a form, or a shared tool. Choosing a shared tool is outside this spec.

## Labelling rules

Human labels calibrate a judge only if each labeller judged independently. These three rules protect that.

1. **Labellers do not see judge verdicts first.** A labelling surface MUST NOT show a record's `JudgeVerdicts` to a labeller until that labeller's `Labels` for the record are stored. An `AnnotationPack` therefore never carries verdicts. Seeing a recommendation before deciding increases reliance on it (Buçinca, Malaya & Gajos, "To Trust or to Think", CSCW 2021), which would inflate TPR/TNR.
2. **Packs may include known-answer records.** A record listed in `AnnotationPack.controls` has a settled verdict. It is excluded from TPR/TNR, the corrected rate and α, and is used to report each labeller's accuracy on controls. Controls matter most for the `crowd` and `practitioner` expertise classes, and they give every labeller a reason to read each record closely.
3. **Labellers get a per-record view, after labelling.** `CalibrationReport.records` sorts each record into three groups: the labeller and the judge agreed; the labeller failed it and the judge passed it; the judge failed it and the labeller passed it. That lets a facilitator see exactly where the judge disagreed and contest a record through `criterion_feedback` or a corrected label. It is shown only after the labeller's labels are stored, per rule 1.

The one-line `reason` on each label stays as it is: having to state a reason is itself a documented way to keep people judging rather than skimming.

## Canonical session form

A `SessionOutput` is a weval-compatible `messages` array plus an explicit **target**:

- `target: final_turn` — the last assistant turn is the object under evaluation; prior messages are context (turn-in-context).
- `target: transcript` — the whole conversation is the object (session-level axes).

Both units are first-class; each pack record declares its own. Sessions from retrieval-based (knowledge-encountering) platforms may attach retrieved context per record — proposed seam, pending Crown Shy review (`docs/crown-shy-scope.md`).

**A third unit exists in the scope agreement and not yet here.** Evals may be written for an individual turn, for a whole session with one participant, **or for the whole process across every participant's sessions**. The third is where process-outcome questions live (did participants get better at self-articulation, did positions move), and it is a named target of the Commoning Standard's scope. `Rubric.applies_to.unit` accepts `cross_session` so such criteria are not lost at intake, but no `SessionOutput` shape carries it yet. Closing that gap needs the outcome workstream's own scoping first.

## Conformance

A platform conforms by producing and consuming these objects as files that validate against the schemas. The `calibration/` directory's manual flow is the reference example: a platform sends a conforming pack, and labels come back as a pull request.

v0.1 called this level L0 and also defined an L1 service level. L1 is withdrawn in v0.2 (see the note at the top).

## Data, consent, licensing

- Every `SessionOutput` carries a **scrub attestation** (what PII pass it went through) and a **consent posture** (`research_consented | anonymized_public | private_restricted`). The platform is responsible for both before anything leaves it — the interface never moves raw data out of a platform's control.
- Pack **data** licensing is declared per pack (`license` field). The spec itself is CC0; a pack of real conversations usually is not.
- Labeller identity: labels carry a labeller id + **expertise class** (`expert_facilitator | practitioner | crowd | developer`), because a calibration claim is only as strong as who labelled (see `calibration/README.md`).

## Versioning

`spec_version` field on every object, semver. v0.x may break; v1.0 freezes the schemas. Changes by PR to this directory.

## Open questions

1. **Crown Shy seam** — does the retrieved-context attachment cover knowledge-encountering sessions? (`docs/crown-shy-scope.md`)
2. **Verdict scale** — binary pass/fail per axis (current Harmonica practice) vs weval's 5-point CLASS scale. The draft uses binary with an optional `score` for finer scales; feedback welcome.
3. **The shared labelling surface** — which tool labellers use across platforms, and who hosts it. That is for the partners' technical scoping, not this spec; the schemas are needed whichever way it goes.
4. **Controls** — how many known-answer records a pack should carry, and what control accuracy, if any, should exclude a labeller's labels from a report.
5. **The `cross_session` unit** — outcome-level criteria can be authored but not yet packed (see above).
