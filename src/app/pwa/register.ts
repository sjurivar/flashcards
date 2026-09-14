import { showUpdateBanner } from './updateBanner';

export async function registerPwa(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const { registerSW } = await import('virtual:pwa-register');
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showUpdateBanner(() => {
        void updateSW(true);
      });
    },
  });
}
