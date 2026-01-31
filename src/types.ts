export type TranscriptFormat = 'fireflies' | 'notion' | 'plaintext';

export interface Turn {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface WhwTags {
  why: string[];
  how: string[];
  who: string;
}

export interface AnnotatedTurn extends Turn {
  tags: WhwTags;
}

export interface ConversationSignature {
  why: Record<string, number>;
  how: Record<string, number>;
  who: Record<string, number>;
}

export interface SpeakerMap {
  [realName: string]: string;
}

export interface BenchmarkMetadata {
  methodology: string;
  date: string;
  participants: number;
  turns: number;
  facilitators: string[];
  signature: ConversationSignature;
}

export interface PipelineOptions {
  input: string;
  methodology: string;
  date: string;
  format?: TranscriptFormat;
  facilitators?: string[];
  dryRun: boolean;
}
