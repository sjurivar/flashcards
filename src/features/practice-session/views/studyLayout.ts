export const COMPACT_LANDSCAPE_QUERY =
  '(orientation: landscape) and (max-height: 540px) and (max-width: 1100px)';
export const COMPACT_WIDTH_QUERY = '(max-width: 720px)';
export const PORTRAIT_TIP_QUERY = '(orientation: portrait) and (max-width: 480px)';

export function matchesMedia(query: string, fallback = false): boolean {
  return window.matchMedia?.(query)?.matches ?? fallback;
}

export function isCompactLandscape(): boolean {
  return matchesMedia(COMPACT_LANDSCAPE_QUERY);
}

export function isCompactWidth(): boolean {
  return matchesMedia(COMPACT_WIDTH_QUERY, true);
}

export function shouldOfferPortraitRotateTip(): boolean {
  return matchesMedia(PORTRAIT_TIP_QUERY);
}
