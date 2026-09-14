import { href, navigate } from '@app/routing/router';
import { countDueCards, listCards, ratingBreakdown } from '@features/card-library';
import { startSession } from '@features/practice-session';
import { setFlash } from '@shared/ui/flash';

export async function renderDashboard(root: HTMLElement): Promise<void> {
  const cards = await listCards();
  const dueCount = await countDueCards();
  const breakdown = ratingBreakdown(cards);

  root.innerHTML = `
    <section class="hero">
      <h1>Klar for øving?</h1>
      <p class="lede">
        ${dueCount === 1 ? 'Du har <strong>1 kort</strong> klart for øving.' : `Du har <strong>${dueCount} kort</strong> klare for øving.`}
      </p>
      <div class="hero__actions">
        ${dueCount > 0
          ? '<button class="button button--primary" type="button" data-action="start">Start øving</button>'
          : '<p class="muted">Ingen kort er klare i dag. Kom tilbake senere, eller rediger kortene i biblioteket.</p>'}
        <a class="button button--secondary" href="${href({ name: 'cards' })}">Gå til kortbibliotek</a>
      </div>
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

  root.querySelector('[data-action="start"]')?.addEventListener('click', async () => {
    try {
      await startSession();
      navigate({ name: 'practice' });
    } catch (error) {
      setFlash('error', error instanceof Error ? error.message : 'Kunne ikke starte øving.');
      navigate({ name: 'home' });
    }
  });
}
