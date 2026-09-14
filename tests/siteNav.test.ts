/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest';
import { renderLayout } from '@app/layout/renderLayout';

function mockMatchMedia(mobile: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: mobile && query.includes('max-width: 720px'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('site navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    mockMatchMedia(true);
  });

  it('opens and closes the compact menu with keyboard', () => {
    const root = document.querySelector('#app') as HTMLElement;
    renderLayout(root, { name: 'home' }, '<p>Innhold</p>');

    const toggle = root.querySelector<HTMLButtonElement>('[data-nav-toggle]');
    const nav = root.querySelector<HTMLElement>('#hovedmeny');
    expect(toggle).toBeTruthy();
    expect(nav).toBeTruthy();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-controls')).toBe('hovedmeny');
    expect(nav?.hidden).toBe(true);

    toggle?.focus();
    toggle?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(nav?.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(nav?.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);
  });

  it('marks the active page', () => {
    const root = document.querySelector('#app') as HTMLElement;
    renderLayout(root, { name: 'cards' }, '<p>Bibliotek</p>');
    const current = root.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe('Kortbibliotek');
  });

  it('includes the Help item', () => {
    const root = document.querySelector('#app') as HTMLElement;
    renderLayout(root, { name: 'help' }, '<p>Hjelp</p>');
    expect(root.querySelector('[aria-current="page"]')?.textContent).toBe('Hjelp');
  });
});
