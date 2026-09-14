import { href, navigate } from '@app/routing/router';
import { CARD_STATUS_LABELS } from '@shared/types';
import { setFlash } from '@shared/ui/flash';
import { escapeHtml } from '@shared/utilities/html';
import { getOutcome } from '@features/learning-outcomes';
import { listCards, setCardActive } from '../storage/cardStore';

export async function renderCardList(root: HTMLElement): Promise<void> {
  const cards = await listCards();
  const outcomes = new Map<string, string>();
  for (const card of cards) {
    if (!outcomes.has(card.learningOutcomeId)) {
      const outcome = await getOutcome(card.learningOutcomeId);
      outcomes.set(card.learningOutcomeId, outcome?.text ?? 'Ukjent læringsutbytte');
    }
  }

  root.innerHTML = `
    <section class="library">
      <div class="page-heading">
        <h1>Kortbibliotek</h1>
        <a class="button button--primary" href="${href({ name: 'card-new' })}">Nytt kort</a>
      </div>
      ${cards.length === 0
        ? '<p>Ingen kort ennå. Opprett det første kortet, eller hent eksempelkort fra forsiden.</p>'
        : `
        <div class="table-wrap">
          <table class="card-table">
            <thead>
              <tr>
                <th scope="col">Spørsmål</th>
                <th scope="col">Tema</th>
                <th scope="col">Læringsutbytte</th>
                <th scope="col">Status</th>
                <th scope="col">Aktiv</th>
                <th scope="col">Handling</th>
              </tr>
            </thead>
            <tbody>
              ${cards.map((card) => `
                <tr>
                  <td data-label="Spørsmål">${escapeHtml(card.question)}</td>
                  <td data-label="Tema">${escapeHtml(card.topic)}</td>
                  <td data-label="Læringsutbytte">${escapeHtml(outcomes.get(card.learningOutcomeId) ?? '')}</td>
                  <td data-label="Status">${escapeHtml(CARD_STATUS_LABELS[card.status])}</td>
                  <td data-label="Aktiv">${card.isActive ? 'Aktiv' : 'Inaktiv'}</td>
                  <td data-label="Handling" class="actions">
                    <a class="button button--small" href="${href({ name: 'card-edit', id: card.id })}">Rediger</a>
                    <button class="button button--small button--ghost" type="button" data-toggle="${card.id}">
                      ${card.isActive ? 'Deaktiver' : 'Aktiver'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`}
    </section>
  `;

  root.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.toggle;
      if (!id) {
        return;
      }
      const card = cards.find((item) => item.id === id);
      if (!card) {
        return;
      }
      await setCardActive(id, !card.isActive);
      setFlash('success', card.isActive ? 'Kortet er deaktivert.' : 'Kortet er aktivert.');
      navigate({ name: 'cards' });
    });
  });
}
