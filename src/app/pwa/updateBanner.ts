export function showUpdateBanner(onUpdate: () => void): void {
  if (document.querySelector('[data-update-banner]')) {
    return;
  }

  const banner = document.createElement('div');
  banner.className = 'update-banner';
  banner.dataset.updateBanner = '1';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <p>En ny versjon av appen er klar. Kortene dine blir værende i nettleseren.</p>
    <button class="button button--primary" type="button">Oppdater</button>
  `;
  banner.querySelector('button')?.addEventListener('click', () => {
    onUpdate();
  });
  document.body.append(banner);
}
