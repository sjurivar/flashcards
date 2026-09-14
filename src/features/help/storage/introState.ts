import { getMeta, setMeta } from '@shared/storage/meta';

export const INTRO_STATUS_KEY = 'introStatus';
export type IntroStatus = 'pending' | 'seen';

export async function getIntroStatus(): Promise<IntroStatus> {
  return getMeta<IntroStatus>(INTRO_STATUS_KEY, 'pending');
}

export async function setIntroStatus(value: IntroStatus): Promise<void> {
  await setMeta(INTRO_STATUS_KEY, value);
}

export async function shouldShowIntro(): Promise<boolean> {
  return (await getIntroStatus()) === 'pending';
}

export async function markIntroSeen(): Promise<void> {
  await setIntroStatus('seen');
}
