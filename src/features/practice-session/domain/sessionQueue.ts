import type { Rating } from '@shared/types';
import { shouldRequeueInSession } from './repetitionPolicy';

export interface SessionQueue {
  cardIds: string[];
  position: number;
  requeuedIds: string[];
}

export function startQueue(cardIds: string[]): SessionQueue {
  return { cardIds: [...cardIds], position: 0, requeuedIds: [] };
}

export function currentCardId(queue: SessionQueue): string | null {
  return queue.cardIds[queue.position] ?? null;
}

export function isQueueComplete(queue: SessionQueue): boolean {
  return currentCardId(queue) === null;
}

export function alreadyRequeued(queue: SessionQueue, cardId: string): boolean {
  return queue.requeuedIds.includes(cardId);
}

export function applyRating(queue: SessionQueue, cardId: string, rating: Rating): SessionQueue {
  if (currentCardId(queue) !== cardId) {
    throw new Error('Kortet matcher ikke gjeldende posisjon i økten.');
  }

  const cardIds = [...queue.cardIds];
  const requeuedIds = [...queue.requeuedIds];

  if (shouldRequeueInSession(rating, alreadyRequeued(queue, cardId))) {
    cardIds.push(cardId);
    requeuedIds.push(cardId);
  }

  return {
    cardIds,
    position: queue.position + 1,
    requeuedIds,
  };
}

export function queueProgress(queue: SessionQueue): { current: number; total: number } {
  const total = queue.cardIds.length;
  return {
    current: total === 0 ? 0 : Math.min(queue.position + 1, total),
    total,
  };
}
