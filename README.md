# OFL Evals

Evaluation frameworks for AI-assisted facilitation — measuring facilitation quality through structured comparison rather than subjective assessment.

## Approach

Instead of asking "Is this good facilitation?" (subjective), OFL evals ask comparative questions:
- "How similar is this conversation to Socratic dialogue?"
- "How close is this facilitation to restorative justice principles?"

This relative comparison produces measurable feedback signals for training and improving AI facilitators.

## The Why-How-Who Framework

Every facilitation conversation can be characterized along three dimensions:

### Why (Purpose & Outcomes)

| Outcome Type | Description | Example Methods |
|-------------|-------------|-----------------|
| Agreement Building | Help group reach consensus | Delphi, Consensus Workshop |
| Preference Elicitation | Surface individual preferences | Polling, Harmonica |
| Error Surfacing | Identify gaps in thinking | Devil's Advocate, Red Team |
| Perspective Taking | Expose to other viewpoints | Cross-pollination, Fishbowl |
| Synthesis | Aggregate into actionable output | Affinity Mapping |
| Ideation | Generate new ideas | Brainstorming, Six Hats |
| Conflict Resolution | Resolve disagreements | NVC, Mediation |

### How (Process & Techniques)

**Intervention styles:** Non-directive (logistics only) → Semi-directive (questions, summaries) → Directive (guide thinking, challenge)

**Question types:** Open, Closed, Probing, Clarifying, Challenging

**Timing:** Scheduled (predetermined) / Responsive (react to input) / Threshold-based (conditions met)

### Who (Participants & Dynamics)

**Interaction modes:** One-to-one, Small group (3-12), Large group (12+), Plenary

**Power dynamics:** Hierarchy sensitivity, anonymity support, minority voice protection

## Conversation Signatures

The key mechanism: compute "signatures" of conversations based on Why-How-Who dimensions, then compare them to reference methodologies.

1. **Label** dialogue acts with Why-How-Who tags
2. **Count** frequencies of each tag type
3. **Create** a vector representing conversation characteristics
4. **Compare** to known methodology signatures (distance = similarity measure)

## Evaluation Metrics

| Category | Metrics |
|----------|---------|
| **Process** | Intervention frequency/timing, question type distribution, speaking time balance, topic coverage |
| **Outcome** | Agreement level, idea quantity/quality, participant satisfaction |
| **Signature** | Distance to target methodology, consistency within session, appropriate adaptation |

## Repository Structure

```
why-how-who-framework.md    # Full framework specification
schemas/                    # Data schemas for evaluation results
prompts/                    # LLM prompts for automated tagging
benchmarks/                 # Reference datasets and methodology signatures
```

## Applications

- **Pattern development** — Encode and compare facilitation methods using consistent dimensions
- **AI training** — Generate labeled datasets and feedback signals for reinforcement learning
- **Quality assessment** — Automated comparison of conversations to reference methodologies

## References

- Joseph Low, Cooperative AI Fellowship research (2026)
- [Why-How-Who Framework](./why-how-who-framework.md) — Full specification
- [OFL Pattern Schema](https://github.com/Open-Facilitation-Library/skills/tree/main/patterns/schema) — Patterns include evaluation criteria
- [Discussion Quality in the LLM Era](https://open-facilitation-library.github.io/synthesis-quartz/research/evaluation-facilitation-llm-era) — Korre et al. 2025

## License

MIT
