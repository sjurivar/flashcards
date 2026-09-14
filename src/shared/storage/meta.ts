import { getDatabase } from './database';

export type ExampleOfferState = 'pending' | 'accepted' | 'declined';

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await getDatabase().meta.get(key);
  return (row?.value as T | undefined) ?? fallback;
}

export async function setMeta<T>(key: string, value: T): Promise<void> {
  await getDatabase().meta.put({ key, value });
}

export async function getExampleOfferState(): Promise<ExampleOfferState> {
  return getMeta<ExampleOfferState>('exampleOfferState', 'pending');
}

export async function setExampleOfferState(value: ExampleOfferState): Promise<void> {
  await setMeta('exampleOfferState', value);
}
