import { href, navigate } from '@app/routing/router';
import { CARD_STATUS_LABELS, CARD_STATUSES, type CardStatus } from '@shared/types';
import { setFlash } from '@shared/ui/flash';
import { renderStatusBadge } from '@shared/ui/statusBadge';
import { escapeHtml } from '@shared/utilities/html';
import { getOutcome } from '@features/learning-outcomes';
import { ensureExampleData } from '@features/example-data';
import { hasOwnFormulation } from '../domain/answerResolver';
import type { CardRecord } from '../domain/card';
import { listCards, markCardReviewed, setCardActive } from '../storage/cardStore';

type StatusFilter = 'all' | CardStatus;

export async function renderCardList(root: HTMLElement): Promise<void> {
  const cards = await listCards();
  const outcomes = new Map<string, string>();
  for (const card of cards) {
    if (!outcomes.has(card.learningOutcomeId)) {
      const outcome = await getOutcome(card.learningOutcomeId);
      outcomes.set(card.learningOutcomeId, outcome?.text ?? 'Ukjent læringsutbytte');
    }
  }

  let filter: StatusFilter = 'all';

  const paint = (): void => {
    const visible = filter === 'all' ? cards : cards.filter((card) => card.status === filter);
    const draftCount = cards.filter((card) => card.status === 'ai_utkast').length;

    root.innerHTML = `
      <section class="library">
        <div class="page-heading">
          <h1>Kortbibliotek</h1>
          <a class="button button--primary" href="${href({ name: 'card-new' })}">Nytt kort</a>
        </div>
        ${cards.length === 0
          ? `
          <p>Du har ingen kort ennå. Legg inn eksempelkort eller opprett ditt første kort.</p>
          <div class="hero__actions">
            <button class="button button--primary" type="button" data-action="seed">Legg inn eksempelkort</button>
            <a class="button button--secondary" href="${href({ name: 'card-new' })}">Opprett kort</a>
            <a class="button button--ghost" href="${href({ name: 'help', section: 'kortbibliotek' })}">Hjelp</a>
          </div>`
          : `
          <div class="library-filters" role="group" aria-label="Filtrer kort etter status">
            ${filterButton('all', 'Alle', filter, cards.length)}
            ${CARD_STATUSES.map((status) => filterButton(
              status,
              status === 'ai_utkast' ? `AI-utkast (${draftCount})` : CARD_STATUS_LABELS[status],
              filter,
              cards.filter((card) => card.status === status).length,
            )).join('')}
          </div>
          ${draftCount > 0 && filter === 'all'
            ? `<p class="library-review-hint">Du har ${draftCount} kort som trenger gjennomgang.</p>`
            : ''}
          ${visible.length === 0
            ? `
              <p>Ingen kort passer med valgte filtre.</p>
              <div class="hero__actions">
                <button class="button button--primary" type="button" data-filter="all" data-clear-filter>Vis alle kort</button>
              </div>`
            : renderTable(visible, outcomes)}`}
      </section>
    `;

    root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        filter = button.dataset.filter as StatusFilter;
        paint();
      });
    });

    root.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.toggle;
        const card = cards.find((item) => item.id === id);
        if (!id || !card) {
          return;
        }
        await setCardActive(id, !card.isActive);
        setFlash('success', card.isActive ? 'Kortet er deaktivert.' : 'Kortet er aktivert.');
        navigate({ name: 'cards' });
      });
    });

    root.querySelectorAll<HTMLButtonElement>('[data-review]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.review;
        if (!id) {
          return;
        }
        await markCardReviewed(id);
        setFlash('success', 'Kortet er merket som gjennomgått.');
        navigate({ name: 'cards' });
      });
    });

    root.querySelector('[data-action="seed"]')?.addEventListener('click', async () => {
      await ensureExampleData();
      setFlash('success', 'Eksempelkort er lagt inn.');
      navigate({ name: 'cards' });
    });
  };

  paint();
}

function filterButton(value: StatusFilter, label: string, current: StatusFilter, count: number): string {
  const pressed = current === value;
  return `
    <button class="filter-chip${pressed ? ' filter-chip--active' : ''}" type="button" data-filter="${value}" aria-pressed="${pressed ? 'true' : 'false'}">
      ${escapeHtml(label)}${value !== 'all' && !label.includes('(') ? ` (${count})` : ''}
    </button>
  `;
}

function renderTable(cards: CardRecord[], outcomes: Map<string, string>): string {
  return `
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
              <td data-label="Status">${renderStatusBadge(card.status)}</td>
              <td data-label="Aktiv">${card.isActive ? 'Aktiv' : 'Inaktiv'}</td>
              <td data-label="Handling" class="actions">
                <a class="button button--small" href="${href({ name: 'card-edit', id: card.id })}">
                  ${hasOwnFormulation(card.userAnswer) ? 'Rediger svar' : 'Skriv egen formulering'}
                </a>
                ${card.status === 'ai_utkast' && !hasOwnFormulation(card.userAnswer)
                  ? `<button class="button button--small button--secondary" type="button" data-review="${card.id}">Merk som gjennomgått</button>`
                  : ''}
                <button class="button button--small button--ghost" type="button" data-toggle="${card.id}">
                  ${card.isActive ? 'Deaktiver' : 'Aktiver'}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
