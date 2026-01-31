# Why-How-Who Evaluation Framework

A framework for encoding, comparing, and evaluating facilitation methodologies, developed through research at Cooperative AI (Joseph Low) in collaboration with OFL.

## Overview

Traditional facilitation evaluation focuses on outcomes: Did the group reach agreement? Were participants satisfied? But this misses crucial process dimensions that determine facilitation quality.

The Why-How-Who framework provides a structured way to:
1. **Encode** facilitation methodologies into comparable formats
2. **Measure** how close a conversation is to known facilitation styles
3. **Generate** feedback signals for training AI facilitators

## The Three Dimensions

### Why (Purpose & Outcomes)

What is the facilitation trying to achieve?

| Outcome Type | Description | Example Methods |
|--------------|-------------|-----------------|
| Agreement Building | Help group reach consensus | Delphi, Consensus Workshop |
| Preference Elicitation | Surface individual preferences | Polling, Harmonica |
| Error Surfacing | Identify gaps in thinking | Devil's Advocate, Red Team |
| Perspective Taking | Expose to other viewpoints | Cross-pollination, Fishbowl |
| Synthesis | Aggregate into actionable output | Affinity Mapping |
| Ideation | Generate new ideas | Brainstorming, Six Hats |
| Conflict Resolution | Resolve disagreements | NVC, Mediation |

### How (Process & Techniques)

What does the facilitator actually do?

**Intervention Styles:**
- **Non-directive**: Facilitator only manages logistics
- **Semi-directive**: Facilitator asks questions, summarizes
- **Directive**: Facilitator guides thinking, challenges assumptions

**Question Types:**
- **Open**: "What do you think about X?"
- **Closed**: "Do you agree with Y?"
- **Probing**: "Can you say more about that?"
- **Clarifying**: "Did you mean Z?"
- **Challenging**: "What if the opposite were true?"

**Timing:**
- **Scheduled**: Interventions at predetermined points
- **Responsive**: React to participant inputs
- **Threshold-based**: Intervene when certain conditions met

### Who (Participants & Dynamics)

Who is involved and how do they interact?

**Interaction Modes:**
- One-to-one (interviewer and participant)
- Small group (3-12 people)
- Large group (12+ people)
- Plenary (whole assembly)

**Power Dynamics:**
- Hierarchy sensitivity
- Anonymity support
- Minority voice protection

## Conversation Signatures

A key insight from this framework: we can compute "signatures" of conversations based on Why-How-Who dimensions, then compare them.

### Computing a Signature

1. **Label dialogue acts** with Why-How-Who tags
2. **Count frequencies** of each tag type
3. **Create vector** representing conversation characteristics

### Comparing Conversations

Instead of asking "Is this good facilitation?" (subjective), ask:
- "How similar is this to restorative justice facilitation?"
- "How similar is this to Socratic dialogue?"

This relative comparison is more tractable and produces measurable feedback signals.

## Applications

### For Pattern Development
- Encode patterns using consistent dimensions
- Compare patterns across methodologies
- Identify gaps in pattern library

### For AI Training
- Generate labeled datasets from conversations
- Create feedback signals for reinforcement learning
- Measure facilitator agent performance

### For Evaluation
- Process-based metrics (not just outcomes)
- Comparison to reference methodologies
- Automated quality assessment

## Evaluation Metrics

### Process Metrics
- Intervention frequency and timing
- Question type distribution
- Speaking time balance
- Topic coverage

### Outcome Metrics
- Participant satisfaction
- Agreement level achieved
- Idea quantity/quality
- Action item completion

### Signature Metrics
- Distance to target methodology
- Consistency within session
- Appropriate adaptation to context

## Implementation

### Manual Evaluation
1. Review conversation transcript
2. Tag each facilitator turn with Why-How-Who labels
3. Compute signature statistics
4. Compare to reference patterns

### Automated Evaluation
1. Use LLM to tag dialogue acts
2. Compute embeddings for semantic analysis
3. Compare to known methodology signatures
4. Generate evaluation report

## References

- Joseph Low, Cooperative AI Fellowship research (2026)
- OFL Substack publications
- Conversation Networks paper (referenced in AI Facilitation Sync meetings)

## Related Resources

- [Pattern Schema](https://github.com/Open-Facilitation-Library/skills/tree/main/patterns/schema)
- [Cross-Pollination Pattern](https://github.com/Open-Facilitation-Library/cross-pollination)
- [Evaluation Prompts](./prompts/)
