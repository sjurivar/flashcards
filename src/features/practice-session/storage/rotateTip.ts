import { getMeta, setMeta } from '@shared/storage/meta';

export const ROTATE_TIP_KEY = 'rotateTipStatus';
export type RotateTipStatus = 'pending' | 'dismissed';

export async function shouldShowRotateTip(): Promise<boolean> {
  return (await getMeta<RotateTipStatus>(ROTATE_TIP_KEY, 'pending')) === 'pending';
}

export async function setRotateTipStatus(value: RotateTipStatus): Promise<void> {
  await setMeta(ROTATE_TIP_KEY, value);
}

export async function dismissRotateTip(): Promise<void> {
  await setRotateTipStatus('dismissed');
}

export async function resetRotateTip(): Promise<void> {
  await setRotateTipStatus('pending');
}
