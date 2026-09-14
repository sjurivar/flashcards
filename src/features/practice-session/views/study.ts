import { navigate } from '@app/routing/router';
import { getCard } from '@features/card-library';
import { getOutcome } from '@features/learning-outcomes';
import { openAiHelp } from '@features/help';
import { type CardStatus } from '@shared/types';
import { setFlash } from '@shared/ui/flash';
import { renderStatusBadge } from '@shared/ui/statusBadge';
import { escapeHtml } from '@shared/utilities/html';
import {
  endSession,
  getActiveSession,
  isSessionOpen,
  rateCard,
  revealAnswer,
  sessionCurrentCardId,
  sessionProgress,
} from '../storage/sessionStore';
import { renderAnswerPanel } from './answerPanel';
import { openRatingHelp } from './ratingHelp';

export async function renderStudy(root: HTMLElement): Promise<void> {
  const session = await getActiveSession();
  if (!session || !isSessionOpen(session)) {
    setFlash('error', 'Ingen aktiv økt. Start en ny øving fra forsiden.');
    navigate({ name: 'home' });
    return;
  }

  const cardId = sessionCurrentCardId(session);
  const card = cardId ? await getCard(cardId) : undefined;
  if (!card) {
    navigate({ name: 'summary', id: session.id });
    return;
  }

  const outcome = await getOutcome(card.learningOutcomeId);
  const progress = sessionProgress(session);
  const outcomeText = outcome?.text ?? '';
  let revealed = session.answerRevealed;

  const paint = (): void => {
    root.innerHTML = `
      <article class="study-card">
        ${revealed ? '' : `<p class="progress">Kort ${progress.current} av ${progress.total}</p>`}
        ${revealed ? '' : `<p class="study-meta__topic">${escapeHtml(card.topic)}</p>`}
        ${revealed ? '' : renderStatusBlock(card.status)}
        ${revealed ? '' : renderOutcome(outcomeText)}
        <h1 class="study-question">${escapeHtml(card.question)}</h1>
        ${revealed ? `<p class="study-meta__topic">${escapeHtml(card.topic)}</p>` : ''}
        ${revealed ? renderStatusBlock(card.status) : ''}
        ${revealed ? '' : `<button class="button button--primary study-reveal" type="button" data-action="reveal">Vis svar</button>`}
        ${revealed ? renderAnswerPanel(card) : ''}
        <form class="rating-form" data-rating-form ${revealed ? '' : 'hidden'}>
          <fieldset>
            <legend>Hvordan gikk det?</legend>
            <p class="rating-help-launch">
              <button class="text-action" type="button" data-action="rating-help">Hva betyr Kan ikke, Usikker og Kan?</button>
            </p>
            <div class="rating-buttons">
              <button class="button button--danger" type="submit" name="rating" value="kan_ikke">Kan ikke</button>
              <button class="button button--warning" type="submit" name="rating" value="usikker">Usikker</button>
              <button class="button button--success" type="submit" name="rating" value="kan">Kan</button>
            </div>
          </fieldset>
        </form>
        <p class="study-end">
          <button class="text-action" type="button" data-action="end">Avslutt økten</button>
        </p>
      </article>
    `;

    syncStudyOutcome(root);

    const revealButton = root.querySelector<HTMLButtonElement>('[data-action="reveal"]');
    revealButton?.addEventListener('click', async () => {
      revealButton.disabled = true;
      await revealAnswer(session.stepToken);
      revealed = true;
      paint();
      root.querySelector<HTMLElement>('[data-answer-panel]')?.focus();
    });

    const ratingForm = root.querySelector<HTMLFormElement>('[data-rating-form]');
    ratingForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (ratingForm.dataset.submitted === '1') {
        return;
      }
      ratingForm.dataset.submitted = '1';
      const submitter = event.submitter;
      const rating = submitter instanceof HTMLButtonElement ? submitter.value : '';
      ratingForm.querySelectorAll('button').forEach((button) => {
        if (button !== submitter) {
          button.disabled = true;
        }
      });
      const updated = await rateCard(session.stepToken, card.id, rating);
      if (updated.endedAt || !isSessionOpen(updated)) {
        navigate({ name: 'summary', id: updated.id });
        return;
      }
      navigate({ name: 'practice' });
    });

    root.querySelector('[data-action="end"]')?.addEventListener('click', async () => {
      const ended = await endSession();
      navigate({ name: 'summary', id: ended.id });
    });

    root.querySelector('[data-action="rating-help"]')?.addEventListener('click', () => {
      openRatingHelp();
    });

    root.querySelector('[data-action="ai-help"]')?.addEventListener('click', () => {
      openAiHelp();
    });
  };

  paint();
}

function renderStatusBlock(status: CardStatus): string {
  return `
    ${renderStatusBadge(status, { hint: true })}
    <p class="status-help-launch">
      <button class="text-action" type="button" data-action="ai-help">Mer om AI-innhold og status</button>
    </p>
  `;
}

function renderOutcome(text: string): string {
  if (!text) {
    return '';
  }
  return `
    <details class="study-outcome">
      <summary>Vis læringsutbytte</summary>
      <p>${escapeHtml(text)}</p>
    </details>
  `;
}

function syncStudyOutcome(root: HTMLElement): void {
  const details = root.querySelector<HTMLDetailsElement>('.study-outcome');
  if (!details) {
    return;
  }
  const compact = window.matchMedia?.('(max-width: 720px)')?.matches ?? true;
  details.open = !compact;
}
