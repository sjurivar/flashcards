import { SCHEMA_VERSION, type Rating } from '@shared/types';

export interface SessionSummary {
  kan_ikke: number;
  usikker: number;
  kan: number;
}

export interface PracticeSessionRecord {
  id: string;
  startedAt: string;
  endedAt: string | null;
  queue: string[];
  position: number;
  requeuedIds: string[];
  stepToken: string;
  answerRevealed: boolean;
  cardsShown: number;
  summary: SessionSummary | null;
  schemaVersion: typeof SCHEMA_VERSION;
}

export interface ReviewRecord {
  id: string;
  cardId: string;
  sessionId: string;
  ratedAt: string;
  rating: Rating;
  nextRepetitionAt: string;
  schemaVersion: typeof SCHEMA_VERSION;
}

export function emptySummary(): SessionSummary {
  return { kan_ikke: 0, usikker: 0, kan: 0 };
}
