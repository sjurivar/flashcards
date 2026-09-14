import { describe, expect, it } from 'vitest';
import { isDue, nextRepetitionAt, shouldRequeueInSession } from '@features/practice-session';

describe('repetitionPolicy', () => {
  const now = new Date(2026, 8, 13, 15, 0, 0);

  it('keeps kan_ikke due today', () => {
    const next = nextRepetitionAt('kan_ikke', now);
    expect(isDue(next, now)).toBe(true);
  });

  it('makes usikker due the next local day', () => {
    const next = nextRepetitionAt('usikker', now);
    expect(isDue(next, now)).toBe(false);
    expect(isDue(next, new Date(2026, 8, 14, 0, 0, 1))).toBe(true);
  });

  it('makes kan due after three local days', () => {
    const next = nextRepetitionAt('kan', now);
    expect(isDue(next, new Date(2026, 8, 15, 12, 0, 0))).toBe(false);
    expect(isDue(next, new Date(2026, 8, 16, 0, 0, 1))).toBe(true);
  });

  it('treats never-reviewed cards as due', () => {
    expect(isDue(null, now)).toBe(true);
  });

  it('requeues kan_ikke only once', () => {
    expect(shouldRequeueInSession('kan_ikke', false)).toBe(true);
    expect(shouldRequeueInSession('kan_ikke', true)).toBe(false);
    expect(shouldRequeueInSession('usikker', false)).toBe(false);
    expect(shouldRequeueInSession('kan', false)).toBe(false);
  });
});
