# What to measure when we measure opinion quality

Harmonica's position, written 2026-08-24 in response to the OFL survey
*"Opinion forming / self-reflection definition and measurement"*. This is one
contributor's view, not an OFL consensus. It exists so the reasoning is citable
when rubric axes get authored, rather than living only in a survey spreadsheet.

Companion to [`why-how-who-framework.md`](why-how-who-framework.md), which
describes how a facilitator's moves are tagged. This describes what a good
participant outcome would even be.

## The construct belongs to the process, not the artifact

A finished opinion and a rationalised one produce text that looks identical.
The distinguishing evidence is ordering: did the reasons appear before the
commitment or after it. That is only visible in a trace, so the construct
should be defined over the trace.

This has a practical consequence for platform choice. A post-session pipeline
sees the artifact. A real-time scratchpad sees the forming. If the definition
is written over artifacts, the two look equivalent and they are not.

## Shift is a dial, not a metric

In the cross-pollination runs the adversarial variant produced 60%+ vote change
against roughly 26% for the simple variant, on the same question (see
`Open-Facilitation-Library/cross-pollination`). The facilitator sets that number.

So "the opinion moved" measures the intervention's force, and "the opinion moved
toward the middle" measures a normative preference for depolarisation. Neither
measures the participant's thinking. Both are easy to manufacture, which is
exactly what disqualifies them.

## Exposure conditions do not discriminate within a method

The same objection applies one step less obviously to "was challenged by
counter-arguments" or "was scrutinized". Every cross-pollination session
satisfies those by construction, so within our own conditions they separate
nothing.

Use the outcome version instead: **can the participant list the counterarguments
unprompted**. That tests whether the challenge was internalised rather than
merely delivered, and it fails for the sessions where the exposure did not land.

## Fluency is partly ours

When the facilitator is an LLM, part of the participant's articulation is the
model's. Any criterion that rewards a clearly-expressed answer is partly scoring
the tool rather than the person. "Well-written or expressed clearly" is the
obvious case; less obviously, so is anything graded from a single polished final
statement.

Confidence has the same shape. High confidence is not the target; confidence
that tracks actual knowledge is.

## Three terms, three different measurement problems

| Term | What it is | Measurement status |
|---|---|---|
| Self-articulation | Can put the position into words | Necessary condition. Directly observable, and the one a model can supply entirely. A **gate**, not an axis: if they cannot articulate it, do not score the rest. |
| Self-reflection | Went back over their own priors | Needs a before/after or a trace. The one our tools can instrument and the one AI facilitation genuinely changes. **The target.** |
| Preference construction | There was no stable preference; the process built one | A claim about mechanism. Shapes the design and the caveats; cannot itself be the measured target. |

If preference construction is right, then "stable under neutral re-elicitation"
is not a validity check. It measures how firmly the process anchored the
participant, which can equally indicate heavy-handed facilitation.

## The seven criteria submitted

1. Made after questioning initial assumptions and attitudes
2. Confidence closely tracks actual knowledge
3. Ability to state reasons behind the opinion
4. Ability to list counterarguments on one's own
5. Open-mindedness: opinion can be changed under new evidence or arguments
6. Explicit about trade-offs, including opportunity costs
7. Reasons offered before the conclusion, not after it *(write-in)*

Excluded on the reasoning above: high confidence, stability under
re-elicitation, both opinion-shift options, clarity of expression, and having
been challenged.

## How this connects to the rest of the eval work

These are cross-method observations about what a quality signal can be made of.
They are not a cross-method rubric. OFL evals are per-stage-per-method: the
axes live in `methods/<id>/evals/<stage>.yaml` and encode that stage's tactics.
This page constrains how those axes are written; it does not replace them.

Whatever axes result, the calibration rule is unchanged: a judge does not gate a
user-visible decision until it has been validated against human labels on the
same criterion text. [`calibration/`](calibration/README.md) runs that loop by
hand today; the machine-readable form is the
[annotation and calibration interface specification](https://github.com/Open-Facilitation-Library/evals/blob/spec/annotation-calibration-interface-v0.1/annotation-interface/README.md)
on the [`spec/annotation-calibration-interface-v0.1`](https://github.com/Open-Facilitation-Library/evals/tree/spec/annotation-calibration-interface-v0.1) branch, in partner review.
