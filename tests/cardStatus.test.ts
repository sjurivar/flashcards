import { describe, expect, it } from 'vitest';
import { resolveCardStatus } from '@features/card-library';

describe('resolveCardStatus', () => {
  it('sets egen_formulering when an own answer is saved', () => {
    expect(resolveCardStatus('Mitt svar', 'ai_utkast')).toBe('egen_formulering');
    expect(resolveCardStatus('  tekst  ', 'gjennomgatt')).toBe('egen_formulering');
  });

  it('keeps gjennomgått when no own answer is present', () => {
    expect(resolveCardStatus('', 'gjennomgatt')).toBe('gjennomgatt');
    expect(resolveCardStatus('   ', 'gjennomgatt')).toBe('gjennomgatt');
  });

  it('falls back from egen_formulering to gjennomgått when own answer is cleared', () => {
    expect(resolveCardStatus('', 'egen_formulering')).toBe('gjennomgatt');
  });

  it('keeps AI-utkast when selected and no own answer exists', () => {
    expect(resolveCardStatus(null, 'ai_utkast')).toBe('ai_utkast');
  });
});
