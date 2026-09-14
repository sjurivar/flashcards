import { getDatabase } from '@shared/storage/database';
import { nowUtcIso } from '@shared/utilities/clock';
import { getExampleOfferState, setExampleOfferState } from '@shared/storage/meta';
import { listCards } from '@features/card-library';
import { listOutcomes } from '@features/learning-outcomes';
import { listReviews, listSessions } from '@features/practice-session';
import { createExportPayload, type ExportPayload } from '../domain/exportFormat';
import type { ImportMode } from '../domain/importData';

export async function buildExport(): Promise<ExportPayload> {
  const [cards, learningOutcomes, reviews, sessions, exampleOfferState] = await Promise.all([
    listCards(),
    listOutcomes(),
    listReviews(),
    listSessions(),
    getExampleOfferState(),
  ]);

  return createExportPayload(
    {
      cards,
      learningOutcomes,
      reviews,
      sessions,
      settings: { exampleOfferState },
    },
    nowUtcIso(),
  );
}

export async function applyImport(payload: ExportPayload, mode: ImportMode): Promise<void> {
  const db = getDatabase();
  await db.transaction(
    'rw',
    db.cards,
    db.learningOutcomes,
    db.reviews,
    db.sessions,
    db.meta,
    async () => {
      if (mode === 'replace') {
        await db.cards.clear();
        await db.learningOutcomes.clear();
        await db.reviews.clear();
        await db.sessions.clear();
      }

      for (const outcome of payload.learningOutcomes) {
        if (mode === 'merge' && (await db.learningOutcomes.get(outcome.id))) {
          continue;
        }
        await db.learningOutcomes.put(outcome);
      }

      for (const card of payload.cards) {
        if (mode === 'merge' && (await db.cards.get(card.id))) {
          continue;
        }
        await db.cards.put(card);
      }

      for (const session of payload.sessions) {
        if (mode === 'merge' && (await db.sessions.get(session.id))) {
          continue;
        }
        await db.sessions.put(session);
      }

      for (const review of payload.reviews) {
        if (mode === 'merge' && (await db.reviews.get(review.id))) {
          continue;
        }
        await db.reviews.put(review);
      }

      if (payload.settings?.exampleOfferState) {
        const current = await getExampleOfferState();
        if (mode === 'replace' || current === 'pending') {
          await setExampleOfferState(payload.settings.exampleOfferState);
        }
      }
    },
  );
}
