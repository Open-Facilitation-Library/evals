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

## Transcript Processor

A CLI tool that processes raw facilitation transcripts into anonymized, WHoW-annotated benchmarks.

```bash
npm install
npx tsx src/process-transcript.ts --input <file> --methodology <name> --date <YYYY-MM-DD> [--facilitator <names>] [--dry-run]
```

Pipeline: **parse** (auto-detect format) → **anonymize** (names, PII) → **annotate** (gpt-4o-mini WHoW tagging) → **signature** (tag frequency vectors) → **render** (markdown + YAML frontmatter).

See `src/` for implementation. Add your OpenAI key to `.env`.

## Repository Structure

```
why-how-who-framework.md    # Full framework specification
src/                        # Transcript processor CLI
schemas/                    # Data schemas for evaluation results
prompts/                    # LLM prompts for automated tagging
benchmarks/                 # Annotated benchmark transcripts
transcripts/                # Raw input transcripts
```

## Applications

- **Pattern development** — Encode and compare facilitation methods using consistent dimensions
- **AI training** — Generate labeled datasets and feedback signals for reinforcement learning
- **Quality assessment** — Automated comparison of conversations to reference methodologies

## Related Work

### Fora Corpus (MIT, ACL 2024)

[Fora](https://aclanthology.org/2024.acl-long.754/) is a corpus of 262 facilitated dialogues (39,911 turns) with human annotations for 7 facilitation strategies and 2 personal sharing types. It's the closest academic dataset to what OFL evals produces. Key differences:

- **Fora** annotates facilitator strategies (follow-up questions, making connections, etc.) and participant sharing — narrower but human-validated
- **WHoW** annotates purpose (why), technique (how), and interaction direction (who) — broader, captures dimensions Fora doesn't (purpose, directionality)
- **Complementary**: running WHoW annotation on Fora transcripts would validate our taxonomy against human ground truth

Fora data is available by request from [github.com/schropes/fora-corpus](https://github.com/schropes/fora-corpus).

### ConvoKit (Cornell)

[ConvoKit](https://github.com/CornellNLP/ConvoKit) is a Python toolkit for conversational analysis with a standardized corpus format and built-in analysis transformers. Used by 30+ datasets including Fora.

Relevant analysis tools that would work on our data if we export in ConvoKit format:
- **Politeness Strategies** — lexical/parse-based politeness scoring (facilitator tone measurement)
- **Linguistic Coordination** — measures whether participants mirror facilitator language (rapport signal)
- **CRAFT Forecasting** — predicts conversation derailment (evaluates whether facilitation prevents breakdown)
- **Redirection detection** — built-in tool for what our `redirect` tag captures
- **Linguistic Diversity** — quantifies speaker variation within conversations

Our pipeline handles the upstream problem ConvoKit doesn't: raw transcript → structured annotated corpus. ConvoKit handles the downstream analysis. Adding ConvoKit-format export would make all these tools available on our benchmarks.

### Other References

- Joseph Low, Cooperative AI Fellowship research (2026)
- [Why-How-Who Framework](./why-how-who-framework.md) — Full specification
- [OFL Pattern Schema](https://github.com/Open-Facilitation-Library/skills/tree/main/patterns/schema) — Patterns include evaluation criteria
- [WHoW Framework](https://aclanthology.org/2024.emnlp-main.1243/) — Chen et al. 2024, cross-domain moderation analysis
- [Discussion Quality in the LLM Era](https://open-facilitation-library.github.io/synthesis-quartz/research/evaluation-facilitation-llm-era) — Korre et al. 2025

## License

MIT
