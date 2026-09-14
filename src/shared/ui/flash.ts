export type FlashType = 'success' | 'error';

let current: { type: FlashType; message: string } | null = null;

export function setFlash(type: FlashType, message: string): void {
  current = { type, message };
}

export function pullFlash(): { type: FlashType; message: string } | null {
  const value = current;
  current = null;
  return value;
}
