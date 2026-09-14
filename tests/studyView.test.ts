/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveCardDraft } from '@features/card-library';
import {
  COMPACT_LANDSCAPE_QUERY,
  PORTRAIT_TIP_QUERY,
  ROTATE_TIP_TEXT,
  dismissRotateTip,
  renderStudy,
  setRotateTipStatus,
  shouldShowRotateTip,
  startSession,
} from '@features/practice-session';

function mockMatchMedia(matches: (query: string) => boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: matches(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

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
  beforeEach(async () => {
    mockMatchMedia(() => false);
    await setRotateTipStatus('pending');
  });

  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  it('shows AI-utkast before the answer and generated suggestion after reveal', async () => {
    await seedCard();
    await startSession();
    const root = document.createElement('div');
    await renderStudy(root);

    expect(root.textContent).toContain('Kort 1 av 1');
    expect(root.textContent).toContain('Universell utforming');
    expect(root.textContent).toContain('AI-utkast');
    expect(root.textContent).toContain('Generert fra kildematerialet – ikke gjennomgått av deg ennå.');
    expect(root.textContent).toContain('Utbytte');
    expect(root.querySelector('.study-outcome')?.textContent).toContain('funksjonshemmende barrierer');
    expect(root.querySelector('.study-toolbar')).toBeTruthy();
    expect(root.querySelector('.study-board')).toBeTruthy();
    expect(root.querySelector('.study-main')).toBeTruthy();
    expect(root.querySelector('.study-aside')).toBeTruthy();
    expect(root.querySelector('[data-action="reveal"]')?.textContent).toBe('Vis svar');
    expect(root.querySelector('[data-action="end"]')?.textContent).toBe('Avslutt økten');
    expect(root.querySelector('[data-action="fullscreen"]')).toBeNull();
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
    expect(root.querySelector('.study-aside .answer__extras')).toBeTruthy();
    expect(root.querySelector('[data-rating-form]')).toBeTruthy();
  });

  it('offers a dismissible rotate tip once on a cramped portrait phone', async () => {
    mockMatchMedia((query) => query === PORTRAIT_TIP_QUERY || query.includes('max-width: 720px'));
    expect(await shouldShowRotateTip()).toBe(true);
    await seedCard();
    await startSession();
    const root = document.createElement('div');
    await renderStudy(root);

    expect(root.textContent).toContain(ROTATE_TIP_TEXT);
    root.querySelector<HTMLButtonElement>('[data-action="dismiss-rotate-tip"]')?.click();
    await vi.waitFor(() => {
      expect(root.querySelector('[data-rotate-tip]')).toBeNull();
    });
    expect(await shouldShowRotateTip()).toBe(false);

    await dismissRotateTip();
    await renderStudy(root);
    expect(root.textContent).not.toContain(ROTATE_TIP_TEXT);
  });

  it('does not show the rotate tip in compact landscape', async () => {
    mockMatchMedia((query) => query === COMPACT_LANDSCAPE_QUERY);
    await seedCard();
    await startSession();
    const root = document.createElement('div');
    await renderStudy(root);
    expect(root.textContent).not.toContain(ROTATE_TIP_TEXT);
  });

  it('shows the fullscreen control only when the API exists', async () => {
    const proto = HTMLElement.prototype as HTMLElement & { requestFullscreen?: () => Promise<void> };
    proto.requestFullscreen = vi.fn(async () => undefined);
    await seedCard();
    await startSession();
    const root = document.createElement('div');
    await renderStudy(root);
    expect(root.querySelector('[data-action="fullscreen"]')?.textContent?.trim()).toBe('Fullskjerm');
  });
});
