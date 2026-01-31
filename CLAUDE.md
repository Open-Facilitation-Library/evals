# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Transcript processing CLI for the Open Facilitation Library. Takes raw facilitation transcripts, anonymizes them, annotates dialogue acts with the Why-How-Who framework (via LLM), computes conversation signatures, and renders annotated benchmarks.

## Commands

```bash
npm install                    # Install dependencies
npx tsx src/process-transcript.ts --help   # Show usage

# Full run
npx tsx src/process-transcript.ts --input <file> --methodology <name> --date <YYYY-MM-DD> [--facilitator <names>] [--dry-run]

# Example
npx tsx src/process-transcript.ts --input transcripts/enable-df-session-attributed.txt --methodology "dynamic-facilitation" --date 2026-01-29 --facilitator "Ben,Eva"
```

Requires `OPENAI_API_KEY` in `.env` (auto-loaded at startup). Dry-run skips LLM calls.

There is also a `/process-transcript` slash command in the root project that wraps this CLI interactively.

## Pipeline Architecture

```
process-transcript.ts (orchestrator)
  → parse.ts         Auto-detect format (Fireflies/Notion/plaintext), extract Turn[]
  → anonymize.ts     Speaker→label mapping, facilitator detection, PII stripping
  → annotate.ts      Batch turns (15/batch, 2-turn overlap) to gpt-4o-mini for WHoW tagging
  → signature.ts     Count tag frequencies on facilitator turns, normalize to 0–1
  → render.ts        Output markdown + YAML frontmatter to benchmarks/
```

Each stage is a standalone module with a single exported function. `types.ts` defines all shared interfaces. `logger.ts` provides colored terminal output.

## Why-How-Who Tag Taxonomy

Defined in `prompts/whw-annotate-system.md` — this is the source of truth for all tags:

- **Why** (9 tags): agreement-building, ideation, conflict-resolution, information-sharing, relationship-building, perspective-taking, synthesis, error-surfacing, preference-elicitation
- **How** (11 tags): open-question, closed-question, probing-question, clarifying-question, paraphrase, summary, redirect, encouragement, challenge, time-management, instruction
- **Who** (4 tags): facilitator-to-group, facilitator-to-individual, participant-to-facilitator, participant-to-participant

Each turn gets ONE `who`, ONE+ `why`, ONE+ `how`.

## Key Design Decisions

- **Signature computation** uses facilitator turns only for Why/How (measures facilitator style), all turns for Who (measures interaction patterns)
- **Facilitator detection heuristic**: highest question-per-turn ratio, override with `--facilitator`
- **Multiple facilitators supported**: comma-separated names, labeled Facilitator 1, Facilitator 2, etc.
- **Batch annotation**: 15 turns per LLM call with 2-turn overlap for context continuity. Retry with exponential backoff on 429/5xx.
- **`.env` loading**: hand-rolled in `process-transcript.ts` (no dotenv dependency)

## Adding a New Transcript Format

1. Add a regex pattern constant in `parse.ts`
2. Add hit counting in `detectFormat()`
3. Write a `parseNewFormat()` function returning `Turn[]`
4. Add to the `parsers` record

## Related Projects

- **Fora Corpus** (MIT, ACL 2024) — 262 facilitated dialogues with human annotations. Complementary scheme: they annotate facilitator strategies + participant sharing; we annotate purpose, technique, and interaction direction. Access: github.com/schropes/fora-corpus
- **ConvoKit** (Cornell) — Python toolkit for conversational analysis with standardized corpus format (`utterances.jsonl` + `speakers.json`). Our pipeline handles the upstream problem ConvoKit doesn't (raw transcript → structured annotated corpus); ConvoKit handles downstream analysis. Relevant built-in transformers: Politeness Strategies (facilitator tone), Linguistic Coordination (rapport signals), CRAFT Forecasting (derailment prediction), Redirection detection (overlaps with our `redirect` tag), Linguistic Diversity (speaker variation). Future export target for interoperability.
- **OFL synthesis-quartz** — Documentation site where evals framework is published
