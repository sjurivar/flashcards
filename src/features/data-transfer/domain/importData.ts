import { CARD_STATUSES, EXPORT_FORMAT_VERSION, RATINGS } from '@shared/types';
import type { ExportPayload } from './exportFormat';

export interface ImportPreview {
  cards: number;
  learningOutcomes: number;
  reviews: number;
  sessions: number;
}

export type ImportMode = 'merge' | 'replace';

export function parseExportJson(raw: string): ExportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Filen er ikke gyldig JSON.');
  }

  if (!isExportPayload(parsed)) {
    throw new Error('Filen har ikke et gyldig Flashcards-eksportformat.');
  }

  if (parsed.formatVersion !== EXPORT_FORMAT_VERSION) {
    throw new Error(`Ukjent eksportversjon: ${parsed.formatVersion}.`);
  }

  return parsed;
}

export function previewExport(payload: ExportPayload): ImportPreview {
  return {
    cards: payload.cards.length,
    learningOutcomes: payload.learningOutcomes.length,
    reviews: payload.reviews.length,
    sessions: payload.sessions.length,
  };
}

export function isExportPayload(value: unknown): value is ExportPayload {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.formatVersion !== 'number' || typeof value.exportedAt !== 'string') {
    return false;
  }
  if (!Array.isArray(value.cards) || !Array.isArray(value.learningOutcomes)) {
    return false;
  }
  if (!Array.isArray(value.reviews) || !Array.isArray(value.sessions)) {
    return false;
  }
  if (!value.cards.every(isCardLike) || !value.learningOutcomes.every(isOutcomeLike)) {
    return false;
  }
  if (!value.reviews.every(isReviewLike) || !value.sessions.every(isSessionLike)) {
    return false;
  }
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCardLike(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'string' &&
    typeof value.question === 'string' &&
    typeof value.aiAnswer === 'string' &&
    typeof value.learningOutcomeId === 'string' &&
    typeof value.topic === 'string' &&
    typeof value.status === 'string' &&
    CARD_STATUSES.includes(value.status as (typeof CARD_STATUSES)[number]) &&
    typeof value.isActive === 'boolean'
  );
}

function isOutcomeLike(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string' && typeof value.text === 'string';
}

function isReviewLike(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.cardId === 'string' &&
    typeof value.sessionId === 'string' &&
    typeof value.rating === 'string' &&
    RATINGS.includes(value.rating as (typeof RATINGS)[number])
  );
}

function isSessionLike(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string' && Array.isArray(value.queue);
}
