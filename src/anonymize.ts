import type { Turn, SpeakerMap } from './types.js';
import * as log from './logger.js';

const PARTICIPANT_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const URL_PATTERN = /https?:\/\/[^\s)]+/g;

function detectFacilitators(turns: Turn[], explicit?: string[]): string[] {
  if (explicit && explicit.length > 0) return explicit;

  // Heuristic: speaker with the highest question-per-turn ratio
  const questionCounts = new Map<string, number>();
  const turnCounts = new Map<string, number>();

  for (const turn of turns) {
    const q = (turn.text.match(/\?/g) || []).length;
    questionCounts.set(turn.speaker, (questionCounts.get(turn.speaker) || 0) + q);
    turnCounts.set(turn.speaker, (turnCounts.get(turn.speaker) || 0) + 1);
  }

  let bestSpeaker = turns[0]?.speaker ?? '';
  let bestRatio = 0;

  for (const [speaker, qCount] of questionCounts) {
    const tCount = turnCounts.get(speaker) || 1;
    if (tCount < 3) continue;
    const ratio = qCount / tCount;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestSpeaker = speaker;
    }
  }

  if (bestRatio === 0 && turns.length > 0) {
    bestSpeaker = turns[0].speaker;
  }

  return [bestSpeaker];
}

function buildSpeakerMap(turns: Turn[], facilitatorNames: string[]): SpeakerMap {
  const map: SpeakerMap = {};
  const facilitatorSet = new Set(facilitatorNames);
  let facilitatorIndex = 0;
  let participantIndex = 0;

  // Assign labels in order of first appearance
  for (const turn of turns) {
    if (map[turn.speaker]) continue;

    if (facilitatorSet.has(turn.speaker)) {
      if (facilitatorNames.length === 1) {
        map[turn.speaker] = 'Facilitator';
      } else {
        facilitatorIndex++;
        map[turn.speaker] = `Facilitator ${facilitatorIndex}`;
      }
    } else {
      if (participantIndex >= PARTICIPANT_LABELS.length) {
        map[turn.speaker] = `Participant ${participantIndex + 1}`;
      } else {
        map[turn.speaker] = `Participant ${PARTICIPANT_LABELS[participantIndex]}`;
      }
      participantIndex++;
    }
  }

  return map;
}

function stripPii(text: string): string {
  return text
    .replace(EMAIL_PATTERN, '[email]')
    .replace(PHONE_PATTERN, '[phone]')
    .replace(URL_PATTERN, '[url]');
}

function replaceNames(text: string, speakerMap: SpeakerMap): string {
  let result = text;

  // Sort names by length (longest first) to avoid partial replacements
  const names = Object.keys(speakerMap).sort((a, b) => b.length - a.length);

  for (const realName of names) {
    const label = speakerMap[realName];

    // Replace full name
    const fullNamePattern = new RegExp(escapeRegex(realName), 'gi');
    result = result.replace(fullNamePattern, label);

    // Replace first name (if multi-word name)
    const parts = realName.split(/\s+/);
    if (parts.length > 1 && parts[0].length > 2) {
      const firstNamePattern = new RegExp(`\\b${escapeRegex(parts[0])}\\b`, 'gi');
      result = result.replace(firstNamePattern, label);
    }

    // Replace @mentions
    const mentionName = realName.replace(/\s+/g, '');
    if (mentionName !== realName) {
      const mentionPattern = new RegExp(`@${escapeRegex(mentionName)}`, 'gi');
      result = result.replace(mentionPattern, `@${label}`);
    }
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function anonymize(
  turns: Turn[],
  facilitatorNames?: string[],
): { turns: Turn[]; speakerMap: SpeakerMap; facilitatorLabels: string[] } {
  const detected = detectFacilitators(turns, facilitatorNames);
  const specified = facilitatorNames && facilitatorNames.length > 0;
  log.stat('Facilitators', `${detected.join(', ')} (${specified ? 'specified' : 'detected'})`);

  const speakerMap = buildSpeakerMap(turns, detected);

  for (const [real, label] of Object.entries(speakerMap)) {
    log.stat(`  ${real}`, label);
  }

  const facilitatorLabels = detected.map((name) => speakerMap[name]);

  const anonymizedTurns = turns.map((turn) => ({
    speaker: speakerMap[turn.speaker] || turn.speaker,
    text: replaceNames(stripPii(turn.text), speakerMap),
    timestamp: turn.timestamp,
  }));

  return { turns: anonymizedTurns, speakerMap, facilitatorLabels };
}
