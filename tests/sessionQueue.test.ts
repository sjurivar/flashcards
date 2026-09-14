import { describe, expect, it } from 'vitest';
import { applyRating, queueProgress, startQueue } from '@features/practice-session';

describe('sessionQueue', () => {
  it('returns a kan_ikke card once at the end', () => {
    let queue = startQueue(['1', '2', '3']);
    queue = applyRating(queue, '1', 'kan_ikke');
    expect(queue.cardIds).toEqual(['1', '2', '3', '1']);
    queue = applyRating(queue, '2', 'kan');
    queue = applyRating(queue, '3', 'usikker');
    expect(queue.cardIds[queue.position]).toBe('1');
    queue = applyRating(queue, '1', 'kan_ikke');
    expect(queue.position).toBe(4);
    expect(queue.cardIds).toEqual(['1', '2', '3', '1']);
  });

  it('does not return usikker or kan in the same session', () => {
    let queue = startQueue(['10', '20']);
    queue = applyRating(queue, '10', 'usikker');
    queue = applyRating(queue, '20', 'kan');
    expect(queue.cardIds).toEqual(['10', '20']);
    expect(queue.position).toBe(2);
  });

  it('grows progress when a card is requeued', () => {
    let queue = startQueue(['1', '2']);
    expect(queueProgress(queue)).toEqual({ current: 1, total: 2 });
    queue = applyRating(queue, '1', 'kan_ikke');
    expect(queueProgress(queue)).toEqual({ current: 2, total: 3 });
  });
});
