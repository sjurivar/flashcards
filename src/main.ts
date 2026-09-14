import './styles.css';
import { pageRoot, renderLayout } from '@app/layout/renderLayout';
import { registerPwa } from '@app/pwa/register';
import { startRouter, type Route } from '@app/routing/router';
import { renderCardForm, renderCardList } from '@features/card-library';
import { renderDashboard } from '@features/dashboard';
import { renderDataPage } from '@features/data-transfer';
import { ensureExampleData } from '@features/example-data';
import { maybeShowIntro, renderHelpPage } from '@features/help';
import { renderStudy, renderSummary } from '@features/practice-session';
import { href } from '@app/routing/router';

const foundRoot = document.querySelector('#app');
if (!(foundRoot instanceof HTMLElement)) {
  throw new Error('App-rot mangler.');
}
const appRoot: HTMLElement = foundRoot;

async function renderRoute(route: Route): Promise<void> {
  await ensureExampleData();
  document.title = titleFor(route);
  renderLayout(appRoot, route, '<p class="muted">Laster…</p>');
  const page = pageRoot();

  try {
    switch (route.name) {
      case 'home':
        await renderDashboard(page);
        break;
      case 'cards':
        await renderCardList(page);
        break;
      case 'card-new':
        await renderCardForm(page);
        break;
      case 'card-edit':
        await renderCardForm(page, route.id);
        break;
      case 'practice':
        await renderStudy(page);
        break;
      case 'summary':
        await renderSummary(page, route.id);
        break;
      case 'data':
        await renderDataPage(page);
        break;
      case 'help':
        await renderHelpPage(page, route.section);
        break;
      default:
        page.innerHTML = `
          <section class="panel">
            <h1>Siden ble ikke funnet</h1>
            <p><a class="button" href="${href({ name: 'home' })}">Til forsiden</a></p>
          </section>
        `;
    }
  } catch (error) {
    page.innerHTML = `
      <section class="panel">
        <h1>Noe gikk galt</h1>
        <p>${error instanceof Error ? error.message : 'Ukjent feil.'}</p>
        <p><a class="button" href="${href({ name: 'home' })}">Til forsiden</a></p>
      </section>
    `;
  }
}

function titleFor(route: Route): string {
  switch (route.name) {
    case 'cards':
    case 'card-new':
    case 'card-edit':
      return 'Kortbibliotek – Flashcards';
    case 'practice':
      return 'Øving – Flashcards';
    case 'summary':
      return 'Øktoppsummering – Flashcards';
    case 'data':
      return 'Data – Flashcards';
    case 'help':
      return 'Hjelp – Flashcards';
    default:
      return 'Flashcards';
  }
}

startRouter((route) => {
  void renderRoute(route).then(() => {
    void maybeShowIntro();
  });
});

void registerPwa();
