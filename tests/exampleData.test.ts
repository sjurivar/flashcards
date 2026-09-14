import { describe, expect, it } from 'vitest';
import { listCards } from '@features/card-library';
import { EXAMPLE_CARDS, ensureExampleData } from '@features/example-data';

describe('example data', () => {
  it('installs built-in example cards as AI drafts', async () => {
    const result = await ensureExampleData();
    expect(result.cards).toBe(EXAMPLE_CARDS.length);
    const cards = await listCards();
    expect(cards).toHaveLength(EXAMPLE_CARDS.length);
    expect(cards.every((card) => card.status === 'ai_utkast')).toBe(true);
    expect(cards.every((card) => card.origin === 'example')).toBe(true);
  });

  it('does not duplicate example cards', async () => {
    await ensureExampleData();
    const second = await ensureExampleData();
    expect(second.cards).toBe(0);
    expect((await listCards()).length).toBe(EXAMPLE_CARDS.length);
  });

  it('puts missing built-in cards back without overwriting edits', async () => {
    await ensureExampleData();
    const { getDatabase } = await import('@shared/storage/database');
    const db = getDatabase();
    const first = EXAMPLE_CARDS[0];
    await db.cards.update(first.id, { question: 'Endret av bruker', status: 'gjennomgatt' });
    await db.cards.delete(EXAMPLE_CARDS[1].id);

    const restored = await ensureExampleData();
    expect(restored.cards).toBe(1);
    const cards = await listCards();
    expect(cards).toHaveLength(EXAMPLE_CARDS.length);
    expect(cards.find((card) => card.id === first.id)?.question).toBe('Endret av bruker');
    expect(cards.find((card) => card.id === first.id)?.status).toBe('gjennomgatt');
    expect(cards.find((card) => card.id === EXAMPLE_CARDS[1].id)?.status).toBe('ai_utkast');
  });
});
