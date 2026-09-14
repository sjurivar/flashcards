import { navigate } from '@app/routing/router';
import { getCard } from '@features/card-library';
import { getOutcome } from '@features/learning-outcomes';
import { openAiHelp } from '@features/help';
import { type CardStatus } from '@shared/types';
import { setFlash } from '@shared/ui/flash';
import { CARD_STATUS_HINTS, renderStatusBadge } from '@shared/ui/statusBadge';
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
import { ROTATE_TIP_TEXT } from '../content/practiceUiHelp';
import { dismissRotateTip, shouldShowRotateTip } from '../storage/rotateTip';
import { renderAnswerExtras, renderAnswerMain } from './answerPanel';
import { isFullscreen, supportsFullscreen, toggleFullscreen } from './fullscreen';
import { openRatingHelp } from './ratingHelp';
import { isCompactLandscape, isCompactWidth, shouldOfferPortraitRotateTip } from './studyLayout';

let fullscreenSyncBound = false;

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
  let rotateTipVisible = (await shouldShowRotateTip()) && shouldOfferPortraitRotateTip();

  const paint = (): void => {
    const canFullscreen = supportsFullscreen();
    root.innerHTML = `
      <article class="study-card${revealed ? ' is-revealed' : ''}" data-study-card>
        ${rotateTipVisible ? renderRotateTip() : ''}
        <header class="study-toolbar">
          <div class="study-toolbar__meta">
            <p class="progress">Kort ${progress.current} av ${progress.total}</p>
            <p class="study-meta__topic">${escapeHtml(card.topic)}</p>
            ${renderStatusBadge(card.status, { className: 'study-toolbar__badge' })}
            <button
              class="icon-button"
              type="button"
              data-action="ai-help"
              aria-label="Mer om AI-innhold og status"
              title="Mer om AI-innhold og status"
            >
              <span aria-hidden="true">i</span>
            </button>
            ${renderOutcome(outcomeText)}
          </div>
          <p class="study-toolbar__actions">
            ${canFullscreen ? renderFullscreenButton() : ''}
            <button class="text-action" type="button" data-action="end">Avslutt økten</button>
          </p>
        </header>
        ${renderStatusHint(card.status)}
        <div class="study-board">
          <section class="study-main">
            <h1 class="study-question">${escapeHtml(card.question)}</h1>
            ${revealed ? `<section id="svar" class="answer" data-answer-panel tabindex="-1">${renderAnswerMain(card)}</section>` : ''}
          </section>
          <aside class="study-aside" aria-label="Svarhandlinger">
            <div class="study-aside__body">
              ${revealed ? renderAnswerExtras(card) : ''}
            </div>
            <div class="study-actions">
              ${revealed ? '' : `<button class="button button--primary study-reveal" type="button" data-action="reveal">Vis svar</button>`}
              <form class="rating-form" data-rating-form ${revealed ? '' : 'hidden'}>
                <fieldset>
                  <legend class="rating-legend">
                    Hvordan gikk det?
                    <button
                      class="icon-button icon-button--tiny rating-help-icon"
                      type="button"
                      data-action="rating-help"
                      aria-label="Hva betyr Kan ikke, Usikker og Kan?"
                      title="Hva betyr Kan ikke, Usikker og Kan?"
                    >
                      <span aria-hidden="true">i</span>
                    </button>
                  </legend>
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
            </div>
          </aside>
        </div>
      </article>
    `;

    syncStudyOutcome(root);
    bindStudyActions(root, {
      sessionStepToken: session.stepToken,
      cardId: card.id,
      onReveal: async () => {
        await revealAnswer(session.stepToken);
        revealed = true;
        paint();
        root.querySelector<HTMLElement>('[data-answer-panel]')?.focus({ preventScroll: true });
      },
      onDismissTip: async () => {
        await dismissRotateTip();
        rotateTipVisible = false;
        root.querySelector('[data-rotate-tip]')?.remove();
      },
    });
  };

  paint();
}

function renderRotateTip(): string {
  return `
    <aside class="rotate-tip" data-rotate-tip>
      <p>${ROTATE_TIP_TEXT}</p>
      <button class="text-action" type="button" data-action="dismiss-rotate-tip">Skjul</button>
    </aside>
  `;
}

function renderFullscreenButton(): string {
  return `
    <button class="text-action" type="button" data-action="fullscreen">
      ${isFullscreen() ? 'Avslutt fullskjerm' : 'Fullskjerm'}
    </button>
  `;
}

function renderStatusHint(status: CardStatus): string {
  return `<p class="status-badge__hint study-status-hint">${escapeHtml(CARD_STATUS_HINTS[status])}</p>`;
}

function renderOutcome(text: string): string {
  if (!text) {
    return '';
  }
  return `
            <details class="study-outcome">
      <summary>Utbytte</summary>
      <p>${escapeHtml(text)}</p>
    </details>
  `;
}

function syncStudyOutcome(root: HTMLElement): void {
  const details = root.querySelector<HTMLDetailsElement>('.study-outcome');
  if (!details) {
    return;
  }
  details.open = !isCompactLandscape() && !isCompactWidth();
}

function bindStudyActions(
  root: HTMLElement,
  options: {
    sessionStepToken: string;
    cardId: string;
    onReveal: () => Promise<void>;
    onDismissTip: () => Promise<void>;
  },
): void {
  const revealButton = root.querySelector<HTMLButtonElement>('[data-action="reveal"]');
  revealButton?.addEventListener('click', async () => {
    revealButton.disabled = true;
    await options.onReveal();
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
    const updated = await rateCard(options.sessionStepToken, options.cardId, rating);
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

  root.querySelectorAll('[data-action="rating-help"]').forEach((button) => {
    button.addEventListener('click', () => {
      openRatingHelp();
    });
  });

  root.querySelector('[data-action="ai-help"]')?.addEventListener('click', () => {
    openAiHelp();
  });

  root.querySelector('[data-action="dismiss-rotate-tip"]')?.addEventListener('click', () => {
    void options.onDismissTip();
  });

  bindFullscreen(root);
}

function bindFullscreen(root: HTMLElement): void {
  const button = root.querySelector<HTMLButtonElement>('[data-action="fullscreen"]');
  if (!button) {
    return;
  }

  const syncLabel = (): void => {
    const current = document.querySelector<HTMLButtonElement>('[data-action="fullscreen"]');
    if (current) {
      current.textContent = isFullscreen() ? 'Avslutt fullskjerm' : 'Fullskjerm';
    }
  };

  if (!fullscreenSyncBound) {
    fullscreenSyncBound = true;
    document.addEventListener('fullscreenchange', syncLabel);
    document.addEventListener('webkitfullscreenchange', syncLabel);
  }

  button.addEventListener('click', async () => {
    const card = root.querySelector<HTMLElement>('[data-study-card]');
    const target = card ?? document.documentElement;
    try {
      await toggleFullscreen(target);
    } catch {
      try {
        await toggleFullscreen(document.documentElement);
      } catch {
        button.hidden = true;
      }
    }
    syncLabel();
  });
}
