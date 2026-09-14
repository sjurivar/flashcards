import { SCHEMA_VERSION, type Origin } from '@shared/types';

export interface LearningOutcomeRecord {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  origin: Origin;
  schemaVersion: typeof SCHEMA_VERSION;
}
