import { getDatabase } from '@shared/storage/database';
import { setExampleOfferState } from '@shared/storage/meta';
import { EXAMPLE_CARDS, EXAMPLE_OUTCOMES } from '../domain/catalog';

export async function ensureExampleData(): Promise<{ cards: number; outcomes: number }> {
  const db = getDatabase();
  let cards = 0;
  let outcomes = 0;

  await db.transaction('rw', db.cards, db.learningOutcomes, db.meta, async () => {
    for (const outcome of EXAMPLE_OUTCOMES) {
      const existing = await db.learningOutcomes.get(outcome.id);
      if (!existing) {
        await db.learningOutcomes.add(outcome);
        outcomes += 1;
      }
    }

    for (const card of EXAMPLE_CARDS) {
      const existing = await db.cards.get(card.id);
      if (!existing) {
        await db.cards.add({ ...card, status: 'ai_utkast', origin: 'example' });
        cards += 1;
      }
    }

    await setExampleOfferState('accepted');
  });

  return { cards, outcomes };
}
