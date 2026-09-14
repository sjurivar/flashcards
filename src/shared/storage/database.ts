import Dexie, { type Table } from 'dexie';
import type { CardRecord } from '../../features/card-library/domain/card';
import type { LearningOutcomeRecord } from '../../features/learning-outcomes/domain/outcome';
import type { PracticeSessionRecord, ReviewRecord } from '../../features/practice-session/domain/session';
import { DATABASE_NAME, DATABASE_VERSION } from '@shared/types';

export interface MetaRecord {
  key: string;
  value: unknown;
}

export class FlashcardsDatabase extends Dexie {
  cards!: Table<CardRecord, string>;
  learningOutcomes!: Table<LearningOutcomeRecord, string>;
  reviews!: Table<ReviewRecord, string>;
  sessions!: Table<PracticeSessionRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor(name = DATABASE_NAME) {
    super(name);
    this.version(DATABASE_VERSION).stores({
      cards: 'id, topic, learningOutcomeId, nextRepetitionAt, isActive, origin, status, updatedAt',
      learningOutcomes: 'id, text, origin',
      reviews: 'id, cardId, sessionId, ratedAt',
      sessions: 'id, startedAt, endedAt',
      meta: 'key',
    });
  }
}

let current: FlashcardsDatabase | null = null;

export function getDatabase(name = DATABASE_NAME): FlashcardsDatabase {
  if (!current || current.name !== name) {
    current = new FlashcardsDatabase(name);
  }
  return current;
}

export async function closeDatabase(): Promise<void> {
  if (current) {
    current.close();
    current = null;
  }
}

export async function deleteDatabase(name = DATABASE_NAME): Promise<void> {
  await closeDatabase();
  await Dexie.delete(name);
}
