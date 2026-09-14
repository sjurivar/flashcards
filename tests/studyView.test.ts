/** @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest';
import { saveCardDraft } from '@features/card-library';
import { renderStudy, startSession } from '@features/practice-session';

async function seedCard(userAnswer = '') {
  const created = await saveCardDraft({
    question: 'Hva er universell utforming?',
    aiAnswer: 'AI-forslag om universell utforming.',
    userAnswer,
    example: 'Trinnfri inngang.',
    source: 'Forelesning om universell utforming, lysbilde 14',
    learningOutcomeText: 'Har bred kunnskap om hvordan funksjonshemmende barrierer kan bygges ned gjennom universell utforming av omgivelser og tjenester.',
    topic: 'Universell utforming',
    status: 'ai_utkast',
    isActive: true,
  }, null);
  if (!created.ok) {
    throw new Error('Could not seed card');
  }
  return created.card;
}

describe('study view', () => {
  it('shows AI-utkast before the answer and generated suggestion after reveal', async () => {
    await seedCard();
    await startSession();
    const root = document.createElement('div');
    await renderStudy(root);

    expect(root.textContent).toContain('Kort 1 av 1');
    expect(root.textContent).toContain('Universell utforming');
    expect(root.textContent).toContain('AI-utkast');
    expect(root.textContent).toContain('Generert fra kildematerialet – ikke gjennomgått av deg ennå.');
    expect(root.textContent).toContain('Vis læringsutbytte');
    expect(root.querySelector('.study-outcome')?.textContent).toContain('funksjonshemmende barrierer');
    expect(root.querySelector('[data-action="reveal"]')?.textContent).toBe('Vis svar');
    expect(root.textContent).toContain('Avslutt økten');
    expect(root.textContent).not.toContain('Til forsiden');
    expect(root.textContent).not.toContain('Fasit');

    root.querySelector<HTMLButtonElement>('[data-action="reveal"]')?.click();
    await vi.waitFor(() => {
      expect(root.querySelector('h2')?.textContent).toBe('AI-generert forslag til svar');
    });
    expect(root.textContent).toContain('Kilde: Forelesning om universell utforming, lysbilde 14');
    expect(root.textContent).toContain('Kan');
    expect(root.querySelector('.study-question')?.textContent).toContain('universell utforming');
  });

  it('uses own formulation as the main answer', async () => {
    await seedCard('Min egen forklaring.');
    await startSession();
    const root = document.createElement('div');
    await renderStudy(root);

    expect(root.textContent).toContain('Egen formulering');
    root.querySelector<HTMLButtonElement>('[data-action="reveal"]')?.click();
    await vi.waitFor(() => {
      expect(root.querySelector('h2')?.textContent).toBe('Mitt svar');
    });
    expect(root.querySelector('.answer__primary')?.textContent).toContain('Min egen forklaring.');
    expect(root.querySelector('.answer__ai summary')?.textContent).toBe('Se opprinnelig AI-forslag');
    expect(root.querySelector('.answer__primary')?.textContent).not.toContain('AI-forslag om universell utforming');
  });
});
