export function nowUtcIso(now = new Date()): string {
  return now.toISOString();
}

export function startOfLocalDay(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addLocalDays(days: number, now = new Date()): Date {
  const start = startOfLocalDay(now);
  start.setDate(start.getDate() + days);
  return start;
}

export function toUtcIso(date: Date): string {
  return date.toISOString();
}

export function isDueAt(nextRepetitionAt: string | null, now = new Date()): boolean {
  return nextRepetitionAt === null || new Date(nextRepetitionAt) <= now;
}

export function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString('nb-NO');
}
