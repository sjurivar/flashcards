import { href, type Route } from '@app/routing/router';
import { pullFlash } from '@shared/ui/flash';
import { escapeHtml } from '@shared/utilities/html';
import { bindSiteNav } from './siteNav';

export function renderLayout(root: HTMLElement, route: Route, content: string): void {
  const practicing = route.name === 'practice';
  document.documentElement.classList.toggle('is-practice', practicing);
  document.body.classList.toggle('is-practice', practicing);
  if (!practicing) {
    exitFullscreenIfNeeded();
  }

  const flash = pullFlash();
  const nav = route.name === 'cards' || route.name === 'card-new' || route.name === 'card-edit'
    ? 'cards'
    : route.name === 'data'
      ? 'data'
      : route.name === 'help'
        ? 'help'
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
        <button
          class="nav-toggle"
          type="button"
          data-nav-toggle
          aria-expanded="false"
          aria-controls="hovedmeny"
          aria-label="Åpne meny"
        >
          <span class="nav-toggle__bars" aria-hidden="true"></span>
          Meny
        </button>
        <nav id="hovedmeny" class="site-nav" aria-label="Hovedmeny" hidden>
          <ul class="nav">
            <li><a href="${href({ name: 'home' })}"${nav === 'home' ? ' aria-current="page"' : ''}>Øving</a></li>
            <li><a href="${href({ name: 'cards' })}"${nav === 'cards' ? ' aria-current="page"' : ''}>Kortbibliotek</a></li>
            <li><a href="${href({ name: 'data' })}"${nav === 'data' ? ' aria-current="page"' : ''}>Data</a></li>
            <li><a href="${href({ name: 'help' })}"${nav === 'help' ? ' aria-current="page"' : ''}>Hjelp</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main id="innhold" class="site-main" tabindex="-1">
      ${flash ? `<p class="flash flash--${flash.type}" role="status">${escapeHtml(flash.message)}</p>` : ''}
      <div id="page">${content}</div>
    </main>
  `;

  bindSiteNav(root);
}

export function pageRoot(): HTMLElement {
  const page = document.querySelector('#page');
  if (!(page instanceof HTMLElement)) {
    throw new Error('Siden ble ikke funnet.');
  }
  return page;
}

function exitFullscreenIfNeeded(): void {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => void;
  };
  if (doc.fullscreenElement || doc.webkitFullscreenElement) {
    void (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
  }
}
