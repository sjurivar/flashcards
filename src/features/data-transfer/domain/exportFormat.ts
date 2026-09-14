import { EXPORT_FORMAT_VERSION, SCHEMA_VERSION } from '@shared/types';
import type { CardRecord } from '@features/card-library';
import type { LearningOutcomeRecord } from '@features/learning-outcomes';
import type { PracticeSessionRecord, ReviewRecord } from '@features/practice-session';
import type { ExampleOfferState } from '@shared/storage/meta';

export interface ExportSettings {
  exampleOfferState: ExampleOfferState;
}

export interface ExportPayload {
  formatVersion: number;
  schemaVersion: number;
  exportedAt: string;
  cards: CardRecord[];
  learningOutcomes: LearningOutcomeRecord[];
  reviews: ReviewRecord[];
  sessions: PracticeSessionRecord[];
  settings: ExportSettings;
}

export function createExportPayload(
  data: Omit<ExportPayload, 'formatVersion' | 'schemaVersion' | 'exportedAt'>,
  exportedAt: string,
): ExportPayload {
  return {
    formatVersion: EXPORT_FORMAT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    exportedAt,
    ...data,
  };
}
