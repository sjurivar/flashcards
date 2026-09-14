export const CARD_STATUSES = ['ai_utkast', 'gjennomgatt', 'egen_formulering'] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

export const RATINGS = ['kan_ikke', 'usikker', 'kan'] as const;
export type Rating = (typeof RATINGS)[number];

export const ORIGINS = ['user', 'example'] as const;
export type Origin = (typeof ORIGINS)[number];

export const SCHEMA_VERSION = 1;
export const EXPORT_FORMAT_VERSION = 1;
export const DATABASE_NAME = 'sjurivar-flashcards';
export const DATABASE_VERSION = 1;

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  ai_utkast: 'AI-utkast',
  gjennomgatt: 'Gjennomgått',
  egen_formulering: 'Egen formulering',
};

export const RATING_LABELS: Record<Rating, string> = {
  kan_ikke: 'Kan ikke',
  usikker: 'Usikker',
  kan: 'Kan',
};

export function isCardStatus(value: string): value is CardStatus {
  return (CARD_STATUSES as readonly string[]).includes(value);
}

export function isRating(value: string): value is Rating {
  return (RATINGS as readonly string[]).includes(value);
}
