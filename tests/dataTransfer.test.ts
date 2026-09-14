import { describe, expect, it } from 'vitest';
import { listCards, saveCardDraft } from '@features/card-library';
import { applyImport, buildExport, parseExportJson, previewExport } from '@features/data-transfer';
import { EXPORT_FORMAT_VERSION } from '@shared/types';

async function createCard(question: string) {
  const result = await saveCardDraft({
    question,
    aiAnswer: 'AI',
    userAnswer: '',
    example: '',
    source: '',
    learningOutcomeText: 'Et utbytte',
    topic: 'Tema',
    status: 'ai_utkast',
    isActive: true,
  }, null);
  if (!result.ok) {
    throw new Error('Kunne ikke opprette kort.');
  }
  return result.card;
}

describe('data transfer', () => {
  it('exports a versioned payload', async () => {
    await createCard('Spørsmål A');
    const payload = await buildExport();
    expect(payload.formatVersion).toBe(EXPORT_FORMAT_VERSION);
    expect(payload.exportedAt).toMatch(/Z$/);
    expect(payload.cards).toHaveLength(1);
    expect(payload.learningOutcomes.length).toBeGreaterThan(0);
    expect(payload.settings.exampleOfferState).toBe('pending');
  });

  it('rejects invalid import files', () => {
    expect(() => parseExportJson('{')).toThrow(/gyldig JSON/);
    expect(() => parseExportJson('{"hello":1}')).toThrow(/eksportformat/);
    expect(() => parseExportJson(JSON.stringify({
      formatVersion: 99,
      exportedAt: '2026-01-01T00:00:00.000Z',
      cards: [],
      learningOutcomes: [],
      reviews: [],
      sessions: [],
    }))).toThrow(/eksportversjon/);
  });

  it('merges by id and keeps existing cards', async () => {
    const first = await createCard('Lokalt kort');
    const incoming = await buildExport();
    incoming.cards[0] = {
      ...incoming.cards[0],
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      question: 'Importert kort',
    };
    incoming.cards.push({
      ...first,
      question: 'Skal ikke overskrive',
    });

    await applyImport(incoming, 'merge');
    const cards = await listCards();
    expect(cards).toHaveLength(2);
    expect(cards.find((card) => card.id === first.id)?.question).toBe('Lokalt kort');
    expect(cards.some((card) => card.question === 'Importert kort')).toBe(true);
  });

  it('replaces existing data when asked', async () => {
    await createCard('Skal slettes');
    const incoming = await buildExport();
    incoming.cards = [{
      ...incoming.cards[0],
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      question: 'Erstatning',
    }];
    const preview = previewExport(incoming);
    expect(preview.cards).toBe(1);
    await applyImport(incoming, 'replace');
    const cards = await listCards();
    expect(cards).toHaveLength(1);
    expect(cards[0]?.question).toBe('Erstatning');
  });
});
