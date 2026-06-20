# Calibration

Human-ground-truth labels that calibrate an **LLM-as-judge** to expert facilitator
taste.

The README's [weval](../README.md#weval-collective-intelligence-project) section notes that any
LLM-as-judge scoring added to OFL evals needs grounding — consensus judging, inter-rater
reliability, bias countermeasures. This directory is the human side of that loop: expert
facilitators label real facilitation turns, and those labels recalibrate the judge so it scores
the way an expert would, not the way a model guesses by default.

## Why this exists

A rubric axis is a *hypothesis about quality*. You cannot validate a hypothesis by reading its
wording — only against ground truth, which for facilitation is expert human judgment of real
turns. Today the judges that score facilitation rubrics encode a developer's (or a model's) guess
at "good." Calibration replaces that guess with expert taste, one axis at a time.

## The loop

1. **Pack** — a small set of real, anonymized facilitation turns + the rubric criterion in plain
   English (this directory).
2. **Label** — expert facilitators rate each turn (good / weak) with one line of *why*, and may
   critique the criterion wording itself.
3. **Ingest** — labels become few-shot calibration examples injected into the judge prompt.
4. **Measure** — re-run the eval and record judge↔human agreement (weval-style reliability bands).
   The gap closing over iterations is the signal that the axis tracks expert taste.

## Packs

| Pack | Axis | Turns | Status |
|------|------|-------|--------|
| [`closing/pack.md`](closing/pack.md) | Closing-turn discipline (reflect specifics + checkpoint before finalizing) | 11 | Pilot — open for labels |

## How to contribute labels

Open `closing/pack.md`, copy it, and for each close mark **Strong** or **Weak** with one line of
why. If you would draw the quality line differently than the stated criterion, say so — that
feedback is as valuable as the ratings. Send the marked copy back (or open a PR adding it under
`closing/labels/<your-name>.md`).

## Anonymization

Turns are sourced from real AI-facilitated conversations and anonymized **through this repo's own
[`src/anonymize.ts`](../src/anonymize.ts)**: each speaker is mapped to a label (`Facilitator`,
`Participant A`…) and email / phone / URL are stripped. Two policies sit on top, documented for
transparency:

- **Participant names** that leaked into conversation text are set as the speaker so
  `anonymize()` replaces them everywhere (including where the AI addresses the person by name).
- **Private third parties** named in content are redacted to `[name]` — `anonymize()` keys off
  speakers, so it structurally cannot catch a person merely *mentioned* in a turn. **Published
  authors cited for their work** (e.g. Nathan Schneider / *Governable Spaces*, Thomas Coombes /
  hope-based communications) are intentionally kept as intellectual references, consistent with the
  repo keeping named public entities in its transcripts.

Source conversations were already PII-scrubbed upstream; this is a second, repo-native pass.
