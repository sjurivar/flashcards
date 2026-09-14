/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { renderDashboard } from '@features/dashboard';
import { getCard, renderCardList, saveCardDraft } from '@features/card-library';
import { startSession } from '@features/practice-session';

describe('empty states', () => {
  it('offers actions when there are no cards', async () => {
    const root = document.createElement('div');
    await renderDashboard(root);
    expect(root.textContent).toContain('Du har ingen kort ennå. Legg inn eksempelkort eller opprett ditt første kort.');
    expect(root.querySelector('[data-action="seed"]')).toBeTruthy();
    expect(root.querySelector('a[href="#/cards/new"]')).toBeTruthy();
  });

  it('offers practice-all when no cards are due', async () => {
    await saveCardDraft({
      question: 'Spørsmål',
      aiAnswer: 'Svar',
      userAnswer: '',
      example: '',
      source: '',
      learningOutcomeText: 'Utbytte',
      topic: 'Tema',
      status: 'ai_utkast',
      isActive: true,
    }, null);
    const { getDatabase } = await import('@shared/storage/database');
    const card = (await getDatabase().cards.toArray())[0];
    await getDatabase().cards.update(card.id, { nextRepetitionAt: '2099-01-01T00:00:00.000Z' });

    const root = document.createElement('div');
    await renderDashboard(root);
    expect(root.textContent).toContain('Ingen kort er klare akkurat nå. Du kan øve på alle kort eller komme tilbake senere.');
    expect(root.querySelector('[data-action="start-all"]')?.textContent).toContain('Øv på alle kort');
  });

  it('does not change repetition dates when starting practice on all cards', async () => {
    const created = await saveCardDraft({
      question: 'Senere kort',
      aiAnswer: 'Svar',
      userAnswer: '',
      example: '',
      source: '',
      learningOutcomeText: 'Utbytte',
      topic: 'Tema',
      status: 'gjennomgatt',
      isActive: true,
    }, null);
    if (!created.ok) {
      throw new Error('Could not create card');
    }
    const dueAt = '2099-01-01T00:00:00.000Z';
    const { getDatabase } = await import('@shared/storage/database');
    await getDatabase().cards.update(created.card.id, { nextRepetitionAt: dueAt, lastRating: 'kan' });

    await startSession('all');
    const card = await getCard(created.card.id);
    expect(card?.nextRepetitionAt).toBe(dueAt);
    expect(card?.lastRating).toBe('kan');
  });

  it('shows a clear action when a library filter has no matches', async () => {
    await saveCardDraft({
      question: 'AI-spørsmål',
      aiAnswer: 'Svar',
      userAnswer: '',
      example: '',
      source: '',
      learningOutcomeText: 'Utbytte',
      topic: 'Tema',
      status: 'ai_utkast',
      isActive: true,
    }, null);

    const root = document.createElement('div');
    await renderCardList(root);
    root.querySelector<HTMLButtonElement>('[data-filter="gjennomgatt"]')?.click();
    expect(root.textContent).toContain('Ingen kort passer med valgte filtre.');
    expect(root.querySelector('[data-clear-filter]')?.textContent).toContain('Vis alle kort');
  });
});
