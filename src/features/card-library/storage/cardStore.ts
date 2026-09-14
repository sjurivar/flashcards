import { SCHEMA_VERSION, type CardStatus, type Origin, type Rating } from '@shared/types';
import { getDatabase } from '@shared/storage/database';
import { isDueAt, nowUtcIso } from '@shared/utilities/clock';
import { createId } from '@shared/utilities/id';
import { ensureOutcome } from '@features/learning-outcomes';
import type { CardDraft, CardRecord } from '../domain/card';
import { hasOwnFormulation } from '../domain/answerResolver';
import { resolveCardStatus } from '../domain/resolveStatus';
import { optionalText, validateCardDraft } from '../domain/validateCard';

export async function listCards(): Promise<CardRecord[]> {
  const rows = await getDatabase().cards.toArray();
  return rows.sort((a, b) => a.topic.localeCompare(b.topic, 'nb') || a.question.localeCompare(b.question, 'nb'));
}

export async function getCard(id: string): Promise<CardRecord | undefined> {
  return getDatabase().cards.get(id);
}

export async function putCard(record: CardRecord): Promise<void> {
  await getDatabase().cards.put(record);
}

export async function listDueCards(now = new Date()): Promise<CardRecord[]> {
  return (await listCards()).filter((card) => card.isActive && isDueAt(card.nextRepetitionAt, now));
}

export async function listActiveCards(): Promise<CardRecord[]> {
  return (await listCards()).filter((card) => card.isActive);
}

export async function countDueCards(now = new Date()): Promise<number> {
  return (await listDueCards(now)).length;
}

export function ratingBreakdown(cards: CardRecord[]): Record<Rating | 'none', number> {
  return cards.reduce<Record<Rating | 'none', number>>(
    (totals, card) => {
      if (!card.isActive) {
        return totals;
      }
      if (card.lastRating === null) {
        totals.none += 1;
      } else {
        totals[card.lastRating] += 1;
      }
      return totals;
    },
    { kan_ikke: 0, usikker: 0, kan: 0, none: 0 },
  );
}

export async function saveCardDraft(
  draft: CardDraft,
  existing: CardRecord | null,
  origin: Origin = 'user',
): Promise<{ ok: true; card: CardRecord } | { ok: false; errors: ReturnType<typeof validateCardDraft> }> {
  const errors = validateCardDraft(draft);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const outcome = await ensureOutcome(draft.learningOutcomeText, origin);
  const now = nowUtcIso();
  const card: CardRecord = {
    id: existing?.id ?? createId(),
    question: draft.question.trim(),
    aiAnswer: draft.aiAnswer.trim(),
    userAnswer: optionalText(draft.userAnswer),
    example: optionalText(draft.example),
    source: optionalText(draft.source),
    learningOutcomeId: outcome.id,
    topic: draft.topic.trim(),
    status: resolveCardStatus(draft.userAnswer, draft.status),
    isActive: draft.isActive,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    nextRepetitionAt: existing?.nextRepetitionAt ?? now,
    lastRating: existing?.lastRating ?? null,
    origin: existing?.origin ?? origin,
    schemaVersion: SCHEMA_VERSION,
  };
  await putCard(card);
  return { ok: true, card };
}

export async function markCardReviewed(id: string): Promise<CardRecord> {
  const card = await getCard(id);
  if (!card) {
    throw new Error('Kortet finnes ikke.');
  }
  if (hasOwnFormulation(card.userAnswer)) {
    return card;
  }
  const updated = { ...card, status: 'gjennomgatt' as const, updatedAt: nowUtcIso() };
  await putCard(updated);
  return updated;
}

export async function setCardStatus(id: string, status: CardStatus): Promise<CardRecord> {
  const card = await getCard(id);
  if (!card) {
    throw new Error('Kortet finnes ikke.');
  }
  const next = resolveCardStatus(card.userAnswer, status);
  const updated = { ...card, status: next, updatedAt: nowUtcIso() };
  await putCard(updated);
  return updated;
}

export async function setCardActive(id: string, isActive: boolean): Promise<void> {
  const card = await getCard(id);
  if (!card) {
    throw new Error('Kortet finnes ikke.');
  }
  await putCard({ ...card, isActive, updatedAt: nowUtcIso() });
}

export async function updateCardAfterRating(
  id: string,
  rating: Rating,
  nextRepetitionAt: string,
): Promise<void> {
  const card = await getCard(id);
  if (!card) {
    throw new Error('Kortet finnes ikke.');
  }
  await putCard({
    ...card,
    lastRating: rating,
    nextRepetitionAt,
    updatedAt: nowUtcIso(),
  });
}

export async function replaceAllCards(records: CardRecord[]): Promise<void> {
  const db = getDatabase();
  await db.transaction('rw', db.cards, async () => {
    await db.cards.clear();
    if (records.length > 0) {
      await db.cards.bulkPut(records);
    }
  });
}
