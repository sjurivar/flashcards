import { isRating, type Rating } from '@shared/types';
import { addLocalDays, isDueAt, toUtcIso } from '@shared/utilities/clock';

export function nextRepetitionAt(rating: Rating, now = new Date()): string {
  if (!isRating(rating)) {
    throw new Error('Ugyldig vurdering.');
  }

  if (rating === 'kan_ikke') {
    return toUtcIso(addLocalDays(0, now));
  }
  if (rating === 'usikker') {
    return toUtcIso(addLocalDays(1, now));
  }
  return toUtcIso(addLocalDays(3, now));
}

export function shouldRequeueInSession(rating: Rating, alreadyRequeued: boolean): boolean {
  return rating === 'kan_ikke' && !alreadyRequeued;
}

export function isDue(nextRepetitionAtValue: string | null, now = new Date()): boolean {
  return isDueAt(nextRepetitionAtValue, now);
}
