import { describe, expect, it } from 'vitest';
import { emptyCardDraft, listCards, saveCardDraft, validateCardDraft } from '@features/card-library';

describe('card library', () => {
  it('rejects missing required fields', () => {
    const errors = validateCardDraft(emptyCardDraft());
    expect(errors.question).toBeTruthy();
    expect(errors.aiAnswer).toBeTruthy();
    expect(errors.learningOutcomeText).toBeTruthy();
    expect(errors.topic).toBeTruthy();
  });

  it('creates and edits a card without mixing answers', async () => {
    const created = await saveCardDraft({
      question: 'Hva er selvbestemmelse?',
      aiAnswer: 'AI-fasit',
      userAnswer: 'Min formulering',
      example: 'Et eksempel',
      source: 'Notat',
      learningOutcomeText: 'Kjenner selvbestemmelse.',
      topic: 'Selvbestemmelse',
      status: 'egen_formulering',
      isActive: true,
    }, null);

    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    expect(created.card.aiAnswer).toBe('AI-fasit');
    expect(created.card.userAnswer).toBe('Min formulering');

    const updated = await saveCardDraft({
      question: 'Hva innebærer selvbestemmelse?',
      aiAnswer: 'Oppdatert AI',
      userAnswer: 'Oppdatert egen',
      example: 'Nytt eksempel',
      source: '',
      learningOutcomeText: 'Kjenner selvbestemmelse.',
      topic: 'Selvbestemmelse',
      status: 'gjennomgatt',
      isActive: true,
    }, created.card);

    expect(updated.ok).toBe(true);
    if (!updated.ok) {
      return;
    }
    expect(updated.card.id).toBe(created.card.id);
    expect(updated.card.question).toContain('innebærer');
    expect(updated.card.aiAnswer).toBe('Oppdatert AI');
    expect(updated.card.userAnswer).toBe('Oppdatert egen');
    expect(updated.card.status).toBe('egen_formulering');
    expect((await listCards()).length).toBe(1);
  });

  it('sets egen_formulering automatically when an own answer is saved', async () => {
    const created = await saveCardDraft({
      question: 'Hva er relasjonsarbeid?',
      aiAnswer: 'AI-forslag',
      userAnswer: 'Min formulering',
      example: '',
      source: '',
      learningOutcomeText: 'Kan anvende relasjonsarbeid.',
      topic: 'Relasjonsarbeid',
      status: 'ai_utkast',
      isActive: true,
    }, null);
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    expect(created.card.status).toBe('egen_formulering');
  });
});
