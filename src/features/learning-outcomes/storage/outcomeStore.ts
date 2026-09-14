import { SCHEMA_VERSION, type Origin } from '@shared/types';
import { getDatabase } from '@shared/storage/database';
import { nowUtcIso } from '@shared/utilities/clock';
import { createId } from '@shared/utilities/id';
import type { LearningOutcomeRecord } from '../domain/outcome';

export async function listOutcomes(): Promise<LearningOutcomeRecord[]> {
  const rows = await getDatabase().learningOutcomes.toArray();
  return rows.sort((a, b) => a.text.localeCompare(b.text, 'nb'));
}

export async function getOutcome(id: string): Promise<LearningOutcomeRecord | undefined> {
  return getDatabase().learningOutcomes.get(id);
}

export async function findOutcomeByText(text: string): Promise<LearningOutcomeRecord | undefined> {
  const needle = text.trim();
  return (await listOutcomes()).find((row) => row.text === needle);
}

export async function putOutcome(record: LearningOutcomeRecord): Promise<void> {
  await getDatabase().learningOutcomes.put(record);
}

export async function ensureOutcome(text: string, origin: Origin = 'user'): Promise<LearningOutcomeRecord> {
  const existing = await findOutcomeByText(text);
  if (existing) {
    return existing;
  }

  const now = nowUtcIso();
  const record: LearningOutcomeRecord = {
    id: createId(),
    text: text.trim(),
    createdAt: now,
    updatedAt: now,
    origin,
    schemaVersion: SCHEMA_VERSION,
  };
  await putOutcome(record);
  return record;
}

export async function replaceAllOutcomes(records: LearningOutcomeRecord[]): Promise<void> {
  const db = getDatabase();
  await db.transaction('rw', db.learningOutcomes, async () => {
    await db.learningOutcomes.clear();
    if (records.length > 0) {
      await db.learningOutcomes.bulkPut(records);
    }
  });
}
