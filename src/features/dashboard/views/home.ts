import { href, navigate } from '@app/routing/router';
import { countDueCards, listCards, ratingBreakdown } from '@features/card-library';
import { ensureExampleData } from '@features/example-data';
import { startSession } from '@features/practice-session';
import { setFlash } from '@shared/ui/flash';

export async function renderDashboard(root: HTMLElement): Promise<void> {
  const cards = await listCards();
  const dueCount = await countDueCards();
  const breakdown = ratingBreakdown(cards);

  root.innerHTML = `
    <section class="hero">
      <h1>Klar for øving?</h1>
      ${cards.length === 0 ? emptyNoCards() : dueCount === 0 ? emptyNoDue() : readyState(dueCount)}
    </section>
    <section class="panel" aria-labelledby="fordeling-heading">
      <h2 id="fordeling-heading">Siste vurdering</h2>
      <ul class="stat-list">
        <li><span>Kan ikke</span> <strong>${breakdown.kan_ikke}</strong></li>
        <li><span>Usikker</span> <strong>${breakdown.usikker}</strong></li>
        <li><span>Kan</span> <strong>${breakdown.kan}</strong></li>
        <li><span>Ikke vurdert</span> <strong>${breakdown.none}</strong></li>
      </ul>
    </section>
  `;

  root.querySelector('[data-action="start"]')?.addEventListener('click', () => {
    void beginSession('due');
  });
  root.querySelector('[data-action="start-all"]')?.addEventListener('click', () => {
    void beginSession('all');
  });
  root.querySelector('[data-action="seed"]')?.addEventListener('click', async () => {
    await ensureExampleData();
    setFlash('success', 'Eksempelkort er lagt inn.');
    navigate({ name: 'home' });
  });
}

async function beginSession(scope: 'due' | 'all'): Promise<void> {
  try {
    await startSession(scope);
    navigate({ name: 'practice' });
  } catch (error) {
    setFlash('error', error instanceof Error ? error.message : 'Kunne ikke starte øving.');
    navigate({ name: 'home' });
  }
}

function readyState(dueCount: number): string {
  return `
    <p class="lede">
      ${dueCount === 1 ? 'Du har <strong>1 kort</strong> klart for øving.' : `Du har <strong>${dueCount} kort</strong> klare for øving.`}
    </p>
    <div class="hero__actions">
      <button class="button button--primary" type="button" data-action="start">Start øving</button>
      <a class="button button--secondary" href="${href({ name: 'cards' })}">Gå til kortbibliotek</a>
      <a class="button button--ghost" href="${href({ name: 'help' })}">Hjelp</a>
    </div>
  `;
}

function emptyNoCards(): string {
  return `
    <p class="lede">Du har ingen kort ennå. Legg inn eksempelkort eller opprett ditt første kort.</p>
    <div class="hero__actions">
      <button class="button button--primary" type="button" data-action="seed">Legg inn eksempelkort</button>
      <a class="button button--secondary" href="${href({ name: 'card-new' })}">Opprett kort</a>
      <a class="button button--ghost" href="${href({ name: 'help' })}">Hjelp</a>
    </div>
  `;
}

function emptyNoDue(): string {
  return `
    <p class="lede">Ingen kort er klare akkurat nå. Du kan øve på alle kort eller komme tilbake senere.</p>
    <div class="hero__actions">
      <button class="button button--primary" type="button" data-action="start-all">Øv på alle kort</button>
      <a class="button button--secondary" href="${href({ name: 'cards' })}">Gå til kortbibliotek</a>
      <a class="button button--ghost" href="${href({ name: 'help' })}">Hjelp</a>
    </div>
  `;
}
