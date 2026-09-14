import type { CardStatus } from '@shared/types';
import { hasOwnFormulation } from './answerResolver';

export function resolveCardStatus(
  userAnswer: string | null | undefined,
  selected: CardStatus,
): CardStatus {
  if (hasOwnFormulation(userAnswer)) {
    return 'egen_formulering';
  }
  if (selected === 'egen_formulering') {
    return 'gjennomgatt';
  }
  return selected;
}
