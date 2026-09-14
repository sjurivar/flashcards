import { describe, expect, it } from 'vitest';
import { hasOwnFormulation, primaryAnswer } from '@features/card-library';

describe('primaryAnswer', () => {
  it('uses AI answer when user answer is missing', () => {
    expect(primaryAnswer('AI-fasit', null)).toBe('AI-fasit');
    expect(hasOwnFormulation(null)).toBe(false);
  });

  it('uses AI answer when user answer is blank', () => {
    expect(primaryAnswer('AI-fasit', '  \n\t')).toBe('AI-fasit');
    expect(hasOwnFormulation('   ')).toBe(false);
  });

  it('prefers own formulation when present', () => {
    expect(primaryAnswer('AI-fasit', '  Min formulering  ')).toBe('Min formulering');
    expect(hasOwnFormulation('Min formulering')).toBe(true);
  });
});
