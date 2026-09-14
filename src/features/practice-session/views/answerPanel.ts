import { hasOwnFormulation, primaryAnswer, type CardRecord } from '@features/card-library';
import { escapeHtml, nl2br } from '@shared/utilities/html';

export function renderAnswerPanel(card: CardRecord): string {
  const own = hasOwnFormulation(card.userAnswer);
  const answer = primaryAnswer(card.aiAnswer, card.userAnswer);

  return `
    <section id="svar" class="answer" data-answer-panel tabindex="-1">
      ${own ? renderOwnAnswer(card, answer) : renderAiAnswer(card)}
    </section>
  `;
}

function renderOwnAnswer(card: CardRecord, answer: string): string {
  return `
    <h2>Mitt svar</h2>
    <p class="answer__primary">${nl2br(answer)}</p>
    ${exampleHtml(card.example)}
    ${sourceHtml(card.source, 'own')}
    <details class="answer__ai">
      <summary>Se opprinnelig AI-forslag</summary>
      <p class="answer__ai-heading">AI-generert forslag til svar</p>
      <p>${nl2br(card.aiAnswer)}</p>
    </details>
  `;
}

function renderAiAnswer(card: CardRecord): string {
  return `
    <h2>AI-generert forslag til svar</h2>
    <p class="answer__primary">${nl2br(card.aiAnswer)}</p>
    ${exampleHtml(card.example)}
    ${sourceHtml(card.source, 'ai')}
  `;
}

function exampleHtml(example: string | null): string {
  if (!example) {
    return '';
  }
  return `<p class="answer__example"><strong>Eksempel:</strong> ${nl2br(example)}</p>`;
}

function sourceHtml(source: string | null, context: 'ai' | 'own'): string {
  if (!source) {
    return '';
  }

  const note = context === 'ai'
    ? 'Kilden er kildematerialet kortet bygger på. Teksten over er et AI-generert forslag, ikke et sitat fra kilden.'
    : 'Kilden er kildematerialet kortet bygger på. Den er skilt fra både ditt svar og AI-forslaget.';

  return `
    <p class="answer__source"><strong>Kilde:</strong> ${escapeHtml(source)}</p>
    <p class="answer__source-note">${escapeHtml(note)}</p>
  `;
}
