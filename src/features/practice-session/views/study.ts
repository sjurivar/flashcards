import { href, navigate } from '@app/routing/router';
import { getCard, hasOwnFormulation, primaryAnswer } from '@features/card-library';
import { getOutcome } from '@features/learning-outcomes';
import { setFlash } from '@shared/ui/flash';
import { escapeHtml, nl2br } from '@shared/utilities/html';
import {
  endSession,
  getActiveSession,
  isSessionOpen,
  rateCard,
  revealAnswer,
  sessionCurrentCardId,
  sessionProgress,
} from '../storage/sessionStore';

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
  const own = hasOwnFormulation(card.userAnswer);
  const answer = primaryAnswer(card.aiAnswer, card.userAnswer);
  const revealed = session.answerRevealed;

  root.innerHTML = `
    <article class="study-card">
      <p class="progress">Kort ${progress.current} av ${progress.total}</p>
      <p class="study-meta">
        <span class="study-meta__topic">${escapeHtml(card.topic)}</span>
        <span class="study-meta__outcome">${escapeHtml(outcome?.text ?? '')}</span>
      </p>
      <h1 class="study-question">${escapeHtml(card.question)}</h1>
      ${revealed ? '' : `<button class="button button--primary" type="button" data-action="reveal">Vis svar</button>`}
      <section id="svar" class="answer"${revealed ? '' : ' hidden'} data-answer-panel tabindex="-1">
        <h2>Svar</h2>
        <p class="answer__primary">${nl2br(answer)}</p>
        ${own ? `<details class="answer__ai"><summary>Se opprinnelig AI-svar</summary><p>${nl2br(card.aiAnswer)}</p></details>` : ''}
        ${card.example ? `<p class="answer__example"><strong>Eksempel:</strong> ${nl2br(card.example)}</p>` : ''}
        ${card.source ? `<p class="answer__source"><strong>Kilde:</strong> ${escapeHtml(card.source)}</p>` : ''}
      </section>
      <form class="rating-form" data-rating-form ${revealed ? '' : 'hidden'}>
        <fieldset>
          <legend>Hvordan gikk det?</legend>
          <div class="rating-buttons">
            <button class="button button--danger" type="submit" name="rating" value="kan_ikke">Kan ikke</button>
            <button class="button button--warning" type="submit" name="rating" value="usikker">Usikker</button>
            <button class="button button--success" type="submit" name="rating" value="kan">Kan</button>
          </div>
        </fieldset>
      </form>
      <div class="end-form">
        <button class="button button--ghost" type="button" data-action="end">Avslutt økten</button>
        <a class="button button--ghost" href="${href({ name: 'home' })}">Til forsiden</a>
      </div>
    </article>
  `;

  const answerPanel = root.querySelector<HTMLElement>('[data-answer-panel]');
  const ratingForm = root.querySelector<HTMLFormElement>('[data-rating-form]');
  const revealButton = root.querySelector<HTMLButtonElement>('[data-action="reveal"]');

  revealButton?.addEventListener('click', async () => {
    revealButton.disabled = true;
    await revealAnswer(session.stepToken);
    if (answerPanel) {
      answerPanel.hidden = false;
      answerPanel.focus();
    }
    if (ratingForm) {
      ratingForm.hidden = false;
    }
    revealButton.hidden = true;
  });

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
}
