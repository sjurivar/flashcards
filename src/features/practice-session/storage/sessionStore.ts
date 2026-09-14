import { SCHEMA_VERSION, isRating, type Rating } from '@shared/types';
import { getDatabase } from '@shared/storage/database';
import { nowUtcIso } from '@shared/utilities/clock';
import { createId, createToken } from '@shared/utilities/id';
import { listDueCards, updateCardAfterRating } from '@features/card-library';
import {
  applyRating,
  currentCardId,
  isQueueComplete,
  queueProgress,
  startQueue,
} from '../domain/sessionQueue';
import { nextRepetitionAt } from '../domain/repetitionPolicy';
import { emptySummary, type PracticeSessionRecord, type ReviewRecord } from '../domain/session';

const ACTIVE_SESSION_KEY = 'activeSessionId';

export async function getSession(id: string): Promise<PracticeSessionRecord | undefined> {
  return getDatabase().sessions.get(id);
}

export async function listSessions(): Promise<PracticeSessionRecord[]> {
  return getDatabase().sessions.toArray();
}

export async function listReviews(): Promise<ReviewRecord[]> {
  return getDatabase().reviews.toArray();
}

export async function putSession(record: PracticeSessionRecord): Promise<void> {
  await getDatabase().sessions.put(record);
}

export async function putReview(record: ReviewRecord): Promise<void> {
  await getDatabase().reviews.put(record);
}

export async function getActiveSessionId(): Promise<string | null> {
  const row = await getDatabase().meta.get(ACTIVE_SESSION_KEY);
  return typeof row?.value === 'string' ? row.value : null;
}

export async function setActiveSessionId(id: string | null): Promise<void> {
  const db = getDatabase();
  if (id === null) {
    await db.meta.delete(ACTIVE_SESSION_KEY);
    return;
  }
  await db.meta.put({ key: ACTIVE_SESSION_KEY, value: id });
}

export async function getActiveSession(): Promise<PracticeSessionRecord | undefined> {
  const id = await getActiveSessionId();
  return id ? getSession(id) : undefined;
}

export async function startSession(): Promise<PracticeSessionRecord> {
  const due = await listDueCards();
  if (due.length === 0) {
    throw new Error('Ingen kort er klare for øving.');
  }

  const queue = startQueue(due.map((card) => card.id));
  const session: PracticeSessionRecord = {
    id: createId(),
    startedAt: nowUtcIso(),
    endedAt: null,
    queue: queue.cardIds,
    position: queue.position,
    requeuedIds: queue.requeuedIds,
    stepToken: createToken(),
    answerRevealed: false,
    cardsShown: 0,
    summary: emptySummary(),
    schemaVersion: SCHEMA_VERSION,
  };
  await putSession(session);
  await setActiveSessionId(session.id);
  return session;
}

export async function revealAnswer(stepToken: string): Promise<PracticeSessionRecord> {
  const session = await requireOpenSession();
  if (session.stepToken !== stepToken || session.answerRevealed) {
    return session;
  }
  const updated = { ...session, answerRevealed: true };
  await putSession(updated);
  return updated;
}

export async function rateCard(
  stepToken: string,
  cardId: string,
  rating: string,
): Promise<PracticeSessionRecord> {
  const session = await requireOpenSession();
  if (session.stepToken !== stepToken || !isRating(rating) || currentCardId(asQueue(session)) !== cardId) {
    return session;
  }

  const now = new Date();
  const nextAt = nextRepetitionAt(rating, now);
  const nextQueue = applyRating(asQueue(session), cardId, rating);
  const summary = { ...(session.summary ?? emptySummary()) };
  summary[rating] += 1;
  const ended = isQueueComplete(nextQueue);

  const review: ReviewRecord = {
    id: createId(),
    cardId,
    sessionId: session.id,
    ratedAt: nowUtcIso(now),
    rating,
    nextRepetitionAt: nextAt,
    schemaVersion: SCHEMA_VERSION,
  };

  const updated: PracticeSessionRecord = {
    ...session,
    queue: nextQueue.cardIds,
    position: nextQueue.position,
    requeuedIds: nextQueue.requeuedIds,
    stepToken: createToken(),
    answerRevealed: false,
    cardsShown: session.cardsShown + 1,
    summary,
    endedAt: ended ? nowUtcIso(now) : null,
  };

  const db = getDatabase();
  await db.transaction('rw', db.reviews, db.sessions, db.cards, db.meta, async () => {
    await db.reviews.add(review);
    await updateCardAfterRating(cardId, rating, nextAt);
    await putSession(updated);
    await setActiveSessionId(ended ? null : session.id);
  });

  return updated;
}

export async function endSession(): Promise<PracticeSessionRecord> {
  const session = await requireSession();
  if (session.endedAt) {
    await setActiveSessionId(null);
    return session;
  }
  const updated = { ...session, endedAt: nowUtcIso() };
  await putSession(updated);
  await setActiveSessionId(null);
  return updated;
}

export function sessionProgress(session: PracticeSessionRecord): { current: number; total: number } {
  return queueProgress(asQueue(session));
}

export function isSessionOpen(session: PracticeSessionRecord): boolean {
  return session.endedAt === null && !isQueueComplete(asQueue(session));
}

export function sessionCurrentCardId(session: PracticeSessionRecord): string | null {
  return currentCardId(asQueue(session));
}

function asQueue(session: PracticeSessionRecord) {
  return {
    cardIds: session.queue,
    position: session.position,
    requeuedIds: session.requeuedIds,
  };
}

async function requireSession(): Promise<PracticeSessionRecord> {
  const session = await getActiveSession();
  if (!session) {
    throw new Error('Ingen aktiv økt.');
  }
  return session;
}

async function requireOpenSession(): Promise<PracticeSessionRecord> {
  const session = await requireSession();
  if (!isSessionOpen(session)) {
    throw new Error('Økten er avsluttet.');
  }
  return session;
}

export async function replaceAllPracticeData(
  sessions: PracticeSessionRecord[],
  reviews: ReviewRecord[],
): Promise<void> {
  const db = getDatabase();
  await db.transaction('rw', db.sessions, db.reviews, db.meta, async () => {
    await db.sessions.clear();
    await db.reviews.clear();
    await db.meta.delete(ACTIVE_SESSION_KEY);
    if (sessions.length > 0) {
      await db.sessions.bulkPut(sessions);
    }
    if (reviews.length > 0) {
      await db.reviews.bulkPut(reviews);
    }
  });
}
