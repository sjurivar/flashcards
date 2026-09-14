import { href } from '@app/routing/router';
import { emptySummary } from '../domain/session';
import { getSession } from '../storage/sessionStore';

export async function renderSummary(root: HTMLElement, id: string): Promise<void> {
  const session = await getSession(id);
  if (!session) {
    root.innerHTML = `
      <section class="panel">
        <h1>Fant ikke øktoppsummeringen</h1>
        <p><a class="button button--primary" href="${href({ name: 'home' })}">Til forsiden</a></p>
      </section>
    `;
    return;
  }

  const summary = session.summary ?? emptySummary();
  root.innerHTML = `
    <section class="panel">
      <h1>Økten er ferdig</h1>
      <p class="lede">Du gjennomgikk ${session.cardsShown} kort.</p>
      <ul class="stat-list">
        <li><span>Kan ikke</span> <strong>${summary.kan_ikke}</strong></li>
        <li><span>Usikker</span> <strong>${summary.usikker}</strong></li>
        <li><span>Kan</span> <strong>${summary.kan}</strong></li>
      </ul>
      <p><a class="button button--primary" href="${href({ name: 'home' })}">Til forsiden</a></p>
    </section>
  `;
}
