import Dexie, { type Table } from 'dexie';
import { DATABASE_NAME } from '@shared/types';
import { afterEach, describe, expect, it } from 'vitest';

const NAME = 'flashcards-upgrade-test';

afterEach(async () => {
  await Dexie.delete(NAME);
});

describe('database upgrade', () => {
  it('uses an app-specific IndexedDB name', () => {
    expect(DATABASE_NAME).toBe('sjurivar-flashcards');
  });

  it('keeps existing cards when the schema gains an index', async () => {
    class VersionOne extends Dexie {
      cards!: Table<{ id: string; question: string }>;
      constructor() {
        super(NAME);
        this.version(1).stores({ cards: 'id' });
      }
    }

    const first = new VersionOne();
    await first.cards.put({ id: 'keep-me', question: 'Behold dette kortet' });
    first.close();

    class VersionTwo extends Dexie {
      cards!: Table<{ id: string; question: string; topic?: string }>;
      constructor() {
        super(NAME);
        this.version(1).stores({ cards: 'id' });
        this.version(2).stores({ cards: 'id, topic' }).upgrade(async (tx) => {
          await tx.table('cards').toCollection().modify((card: { topic?: string }) => {
            card.topic = card.topic ?? 'Uten tema';
          });
        });
      }
    }

    const second = new VersionTwo();
    const card = await second.cards.get('keep-me');
    expect(card?.question).toBe('Behold dette kortet');
    expect(card?.topic).toBe('Uten tema');
    second.close();
  });
});
