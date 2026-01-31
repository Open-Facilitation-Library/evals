import type { AnnotatedTurn, ConversationSignature } from './types.js';

export function computeSignature(
  turns: AnnotatedTurn[],
  facilitatorLabels: string[] = ['Facilitator'],
): ConversationSignature {
  const whyCounts: Record<string, number> = {};
  const howCounts: Record<string, number> = {};
  const whoCounts: Record<string, number> = {};

  // Count all tags across facilitator turns
  const facilitatorSet = new Set(facilitatorLabels);
  const facilitatorTurns = turns.filter((t) => facilitatorSet.has(t.speaker));
  const allTurns = turns;

  // Why and How: count from facilitator turns only (measures facilitator style)
  for (const turn of facilitatorTurns) {
    for (const tag of turn.tags.why) {
      whyCounts[tag] = (whyCounts[tag] || 0) + 1;
    }
    for (const tag of turn.tags.how) {
      howCounts[tag] = (howCounts[tag] || 0) + 1;
    }
  }

  // Who: count from all turns (measures interaction patterns)
  for (const turn of allTurns) {
    whoCounts[turn.tags.who] = (whoCounts[turn.tags.who] || 0) + 1;
  }

  return {
    why: normalize(whyCounts),
    how: normalize(howCounts),
    who: normalize(whoCounts),
  };
}

function normalize(counts: Record<string, number>): Record<string, number> {
  const total = Object.values(counts).reduce((sum, v) => sum + v, 0);
  if (total === 0) return counts;

  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(counts)) {
    normalized[key] = Math.round((value / total) * 1000) / 1000;
  }
  return normalized;
}
