import { readFileSync } from 'node:fs';
import type { Turn, TranscriptFormat } from './types.js';
import * as log from './logger.js';

// Fireflies format: "Speaker Name HH:MM:SS"
const FIREFLIES_PATTERN = /^(.+?)\s+(\d{1,2}:\d{2}:\d{2})\s*$/;

// Notion format: **Speaker Name** or __Speaker Name__
const NOTION_PATTERN = /^\*\*(.+?)\*\*|^__(.+?)__/;

// Plaintext formats: "Speaker: text" or "[Speaker] text"
const PLAINTEXT_COLON_PATTERN = /^([A-Za-z][A-Za-z\s.'-]{0,40}):\s+(.+)/;
const PLAINTEXT_BRACKET_PATTERN = /^\[([A-Za-z][A-Za-z\s.'-]{0,40})\]\s+(.+)/;

export function detectFormat(content: string): TranscriptFormat {
  const lines = content.split('\n').slice(0, 50);

  let firefliesHits = 0;
  let notionHits = 0;
  let plaintextHits = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (FIREFLIES_PATTERN.test(trimmed)) firefliesHits++;
    if (NOTION_PATTERN.test(trimmed)) notionHits++;
    if (PLAINTEXT_COLON_PATTERN.test(trimmed) || PLAINTEXT_BRACKET_PATTERN.test(trimmed)) {
      plaintextHits++;
    }
  }

  if (firefliesHits >= 3) return 'fireflies';
  if (notionHits >= 3) return 'notion';
  return 'plaintext';
}

function parseFireflies(content: string): Turn[] {
  const turns: Turn[] = [];
  const lines = content.split('\n');

  let currentSpeaker: string | null = null;
  let currentTimestamp: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(FIREFLIES_PATTERN);

    if (match) {
      // Flush previous turn
      if (currentSpeaker && currentLines.length > 0) {
        turns.push({
          speaker: currentSpeaker,
          text: currentLines.join(' ').trim(),
          timestamp: currentTimestamp ?? undefined,
        });
      }
      currentSpeaker = match[1].trim();
      currentTimestamp = match[2];
      currentLines = [];
    } else if (trimmed && currentSpeaker) {
      currentLines.push(trimmed);
    }
  }

  // Flush last turn
  if (currentSpeaker && currentLines.length > 0) {
    turns.push({
      speaker: currentSpeaker,
      text: currentLines.join(' ').trim(),
      timestamp: currentTimestamp ?? undefined,
    });
  }

  return turns;
}

function parseNotion(content: string): Turn[] {
  const turns: Turn[] = [];
  const lines = content.split('\n');

  let currentSpeaker: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(NOTION_PATTERN);

    if (match) {
      // Flush previous turn
      if (currentSpeaker && currentLines.length > 0) {
        turns.push({
          speaker: currentSpeaker,
          text: currentLines.join(' ').trim(),
        });
      }
      currentSpeaker = (match[1] || match[2]).trim();
      // Check if there's text on the same line after the speaker name
      const afterBold = trimmed.replace(NOTION_PATTERN, '').trim();
      currentLines = afterBold ? [afterBold] : [];
    } else if (trimmed && currentSpeaker) {
      currentLines.push(trimmed);
    }
  }

  // Flush last turn
  if (currentSpeaker && currentLines.length > 0) {
    turns.push({
      speaker: currentSpeaker,
      text: currentLines.join(' ').trim(),
    });
  }

  return turns;
}

function parsePlaintext(content: string): Turn[] {
  const turns: Turn[] = [];
  const lines = content.split('\n');

  let currentSpeaker: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    const colonMatch = trimmed.match(PLAINTEXT_COLON_PATTERN);
    const bracketMatch = trimmed.match(PLAINTEXT_BRACKET_PATTERN);
    const match = colonMatch || bracketMatch;

    if (match) {
      // Flush previous turn
      if (currentSpeaker && currentLines.length > 0) {
        turns.push({
          speaker: currentSpeaker,
          text: currentLines.join(' ').trim(),
        });
      }
      currentSpeaker = match[1].trim();
      currentLines = match[2] ? [match[2].trim()] : [];
    } else if (trimmed && currentSpeaker) {
      currentLines.push(trimmed);
    }
  }

  // Flush last turn
  if (currentSpeaker && currentLines.length > 0) {
    turns.push({
      speaker: currentSpeaker,
      text: currentLines.join(' ').trim(),
    });
  }

  return turns;
}

const parsers: Record<TranscriptFormat, (content: string) => Turn[]> = {
  fireflies: parseFireflies,
  notion: parseNotion,
  plaintext: parsePlaintext,
};

export function parseTranscript(filePath: string, format?: TranscriptFormat): Turn[] {
  const content = readFileSync(filePath, 'utf-8');

  const detected = format ?? detectFormat(content);
  log.stat('Format', format ? `${detected} (specified)` : `${detected} (auto-detected)`);

  const turns = parsers[detected](content);

  if (turns.length === 0) {
    log.warn('No turns parsed — check transcript format');
  }

  const speakers = new Set(turns.map((t) => t.speaker));
  log.stat('Turns parsed', turns.length);
  log.stat('Unique speakers', speakers.size);

  return turns;
}
