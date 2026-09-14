import { isCardStatus } from '@shared/types';
import type { CardDraft } from './card';

export const MAX_TEXT = 5000;
export const MAX_TOPIC = 120;
export const MAX_SOURCE = 255;

export type CardErrors = Partial<Record<keyof CardDraft, string>>;

export function validateCardDraft(draft: CardDraft): CardErrors {
  const errors: CardErrors = {};
  const question = draft.question.trim();
  const aiAnswer = draft.aiAnswer.trim();
  const outcome = draft.learningOutcomeText.trim();
  const topic = draft.topic.trim();

  if (question === '') {
    errors.question = 'Spørsmål er påkrevd.';
  } else if (question.length > MAX_TEXT) {
    errors.question = `Spørsmål kan ikke være lenger enn ${MAX_TEXT} tegn.`;
  }

  if (aiAnswer === '') {
    errors.aiAnswer = 'AI-svar er påkrevd.';
  } else if (aiAnswer.length > MAX_TEXT) {
    errors.aiAnswer = `AI-svar kan ikke være lenger enn ${MAX_TEXT} tegn.`;
  }

  if (outcome === '') {
    errors.learningOutcomeText = 'Læringsutbytte er påkrevd.';
  } else if (outcome.length > MAX_TEXT) {
    errors.learningOutcomeText = `Læringsutbytte kan ikke være lenger enn ${MAX_TEXT} tegn.`;
  }

  if (topic === '') {
    errors.topic = 'Tema er påkrevd.';
  } else if (topic.length > MAX_TOPIC) {
    errors.topic = `Tema kan ikke være lenger enn ${MAX_TOPIC} tegn.`;
  }

  if (!isCardStatus(draft.status)) {
    errors.status = 'Ugyldig status.';
  }

  if (draft.userAnswer.trim().length > MAX_TEXT) {
    errors.userAnswer = `Egen formulering kan ikke være lenger enn ${MAX_TEXT} tegn.`;
  }

  if (draft.example.trim().length > MAX_TEXT) {
    errors.example = `Eksempel kan ikke være lenger enn ${MAX_TEXT} tegn.`;
  }

  if (draft.source.trim().length > MAX_SOURCE) {
    errors.source = `Kilde kan ikke være lenger enn ${MAX_SOURCE} tegn.`;
  }

  return errors;
}

export function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
