import { SCHEMA_VERSION, type CardStatus, type Origin, type Rating } from '@shared/types';

export interface CardRecord {
  id: string;
  question: string;
  aiAnswer: string;
  userAnswer: string | null;
  example: string | null;
  source: string | null;
  learningOutcomeId: string;
  topic: string;
  status: CardStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  nextRepetitionAt: string | null;
  lastRating: Rating | null;
  origin: Origin;
  schemaVersion: typeof SCHEMA_VERSION;
}

export interface CardDraft {
  question: string;
  aiAnswer: string;
  userAnswer: string;
  example: string;
  source: string;
  learningOutcomeText: string;
  topic: string;
  status: CardStatus;
  isActive: boolean;
}

export function emptyCardDraft(): CardDraft {
  return {
    question: '',
    aiAnswer: '',
    userAnswer: '',
    example: '',
    source: '',
    learningOutcomeText: '',
    topic: '',
    status: 'ai_utkast',
    isActive: true,
  };
}
