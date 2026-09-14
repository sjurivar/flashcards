/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { href, parseHash } from '@app/routing/router';
import {
  AI_DRAFT_WARNING,
  closeOpenHelpDialogs,
  maybeShowIntro,
  openAiHelp,
  openHelpDialog,
  renderHelpPage,
  resetIntroLock,
  ROTATE_TIP_TEXT,
  shouldShowIntro,
  showIntro,
} from '@features/help';
import {
  dismissRotateTip,
  openRatingHelp,
  resetRotateTip,
  shouldShowRotateTip,
} from '@features/practice-session';

afterEach(() => {
  closeOpenHelpDialogs();
  resetIntroLock();
  document.body.innerHTML = '';
});

describe('help dialogs and page', () => {
  it('can be used with keyboard', () => {
    const opener = document.createElement('button');
    opener.textContent = 'Åpne';
    document.body.append(opener);
    opener.focus();

    const handle = openHelpDialog({
      title: 'Hjelp',
      body: '<p>Innhold</p>',
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('help-dialog-title');

    handle.root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('shows the introduction once and can open it again', async () => {
    expect(await shouldShowIntro()).toBe(true);
    await maybeShowIntro();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Svar før du ser forslaget');

    document.querySelector<HTMLElement>('[data-intro-skip]')?.click();
    await vi.waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
    expect(await shouldShowIntro()).toBe(false);

    await maybeShowIntro();
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await showIntro({ force: true });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Svar før du ser forslaget');
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Hopp over skjuler introduksjonen neste gang');
  });

  it('does not persist the intro when it is dismissed temporarily', async () => {
    expect(await shouldShowIntro()).toBe(true);
    await maybeShowIntro();
    document.querySelector('[role="dialog"]')?.closest('[data-help-dialog]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
    expect(await shouldShowIntro()).toBe(true);
    resetIntroLock();
    await maybeShowIntro();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('shows rating repetition help', () => {
    openRatingHelp();
    const text = document.querySelector('[role="dialog"]')?.textContent ?? '';
    expect(text).toContain('Kan ikke');
    expect(text).toContain('samme økt');
    expect(text).toContain('neste dag');
    expect(text).toContain('tre dager');
  });

  it('makes the AI warning available', () => {
    openAiHelp();
    const text = document.querySelector('[role="dialog"]')?.textContent ?? '';
    expect(text).toContain(AI_DRAFT_WARNING);
    expect(text).toContain('ikke automatisk riktig');
  });

  it('has working internal help links and export link', async () => {
    const root = document.createElement('div');
    await renderHelpPage(root);

    expect(href({ name: 'help', section: 'sikkerhetskopi' })).toBe('#/help/sikkerhetskopi');
    expect(parseHash('#/help/sikkerhetskopi')).toEqual({ name: 'help', section: 'sikkerhetskopi' });
    expect(root.querySelector('#sikkerhetskopi')).toBeTruthy();
    expect(root.querySelector('#oving-pa-mobil')).toBeTruthy();
    expect(root.querySelector('a[href="#/help/sikkerhetskopi"]')).toBeTruthy();
    expect(root.querySelector('a[href="#/help/oving-pa-mobil"]')).toBeTruthy();
    expect(root.querySelector('a[href="#/help/lagring"]')).toBeTruthy();
    expect(root.textContent).toContain(ROTATE_TIP_TEXT);
    const exportLink = root.querySelector('a[href="#/data"]');
    expect(exportLink?.textContent).toContain('Gå til eksport og import');

    root.querySelector<HTMLButtonElement>('[data-replay-intro]')?.click();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Svar før du ser forslaget');
  });

  it('can restore a dismissed rotate tip from the help page', async () => {
    await dismissRotateTip();
    expect(await shouldShowRotateTip()).toBe(false);

    const root = document.createElement('div');
    await renderHelpPage(root);
    root.querySelector<HTMLButtonElement>('[data-reset-rotate-tip]')?.click();
    await vi.waitFor(async () => {
      expect(await shouldShowRotateTip()).toBe(true);
    });
    expect(root.querySelector<HTMLElement>('[data-rotate-tip-status]')?.hidden).toBe(false);

    await resetRotateTip();
    expect(await shouldShowRotateTip()).toBe(true);
  });
});
