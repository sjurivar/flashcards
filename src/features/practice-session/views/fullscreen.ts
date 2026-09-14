type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export function supportsFullscreen(target: HTMLElement = document.documentElement): boolean {
  const el = target as FullscreenElement;
  return typeof el.requestFullscreen === 'function' || typeof el.webkitRequestFullscreen === 'function';
}

export function isFullscreen(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export async function toggleFullscreen(target: HTMLElement): Promise<void> {
  const doc = document as FullscreenDocument;
  const el = target as FullscreenElement;
  if (isFullscreen()) {
    await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
    return;
  }
  await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
}
