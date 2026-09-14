import { href, type Route } from '@app/routing/router';
import { pullFlash } from '@shared/ui/flash';
import { escapeHtml } from '@shared/utilities/html';

export function renderLayout(root: HTMLElement, route: Route, content: string): void {
  const flash = pullFlash();
  const nav = route.name === 'cards' || route.name === 'card-new' || route.name === 'card-edit'
    ? 'cards'
    : route.name === 'data'
      ? 'data'
      : 'home';

  root.innerHTML = `
    <a class="skip-link" href="#innhold">Hopp til innhold</a>
    <header class="site-header">
      <div class="site-header__inner">
            <p class="brand">
              <a href="${href({ name: 'home' })}">
                <img class="brand__mark" src="${import.meta.env.BASE_URL}icons/icon.svg" width="32" height="32" alt="">
                <span>Flashcards</span>
              </a>
            </p>
        <nav aria-label="Hovedmeny">
          <ul class="nav">
            <li><a href="${href({ name: 'home' })}"${nav === 'home' ? ' aria-current="page"' : ''}>Øving</a></li>
            <li><a href="${href({ name: 'cards' })}"${nav === 'cards' ? ' aria-current="page"' : ''}>Kortbibliotek</a></li>
            <li><a href="${href({ name: 'data' })}"${nav === 'data' ? ' aria-current="page"' : ''}>Data</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main id="innhold" class="site-main" tabindex="-1">
      ${flash ? `<p class="flash flash--${flash.type}" role="status">${escapeHtml(flash.message)}</p>` : ''}
      <div id="page">${content}</div>
    </main>
  `;
}

export function pageRoot(): HTMLElement {
  const page = document.querySelector('#page');
  if (!(page instanceof HTMLElement)) {
    throw new Error('Siden ble ikke funnet.');
  }
  return page;
}
