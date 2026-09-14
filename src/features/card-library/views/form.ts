import { href, navigate } from '@app/routing/router';
import { CARD_STATUS_LABELS, type CardStatus } from '@shared/types';
import { setFlash } from '@shared/ui/flash';
import { CARD_STATUS_HINTS } from '@shared/ui/statusBadge';
import { escapeAttr, escapeHtml } from '@shared/utilities/html';
import { listOutcomes } from '@features/learning-outcomes';
import { emptyCardDraft, type CardDraft, type CardRecord } from '../domain/card';
import { hasOwnFormulation } from '../domain/answerResolver';
import { resolveCardStatus } from '../domain/resolveStatus';
import { MAX_SOURCE, MAX_TEXT, MAX_TOPIC, type CardErrors } from '../domain/validateCard';
import { getCard, saveCardDraft } from '../storage/cardStore';

export async function renderCardForm(root: HTMLElement, id?: string): Promise<void> {
  const existing = id ? await getCard(id) : undefined;
  if (id && !existing) {
    root.innerHTML = `
      <section class="panel">
        <h1>Kortet ble ikke funnet</h1>
        <p><a class="button" href="${href({ name: 'cards' })}">Tilbake til biblioteket</a></p>
      </section>
    `;
    return;
  }

  const outcomes = await listOutcomes();
  const draft = existing ? draftFromCard(existing, outcomes.find((item) => item.id === existing.learningOutcomeId)?.text ?? '') : emptyCardDraft();
  paint(root, existing ?? null, draft, {}, outcomes.map((item) => item.text));
}

function draftFromCard(card: CardRecord, learningOutcomeText: string): CardDraft {
  return {
    question: card.question,
    aiAnswer: card.aiAnswer,
    userAnswer: card.userAnswer ?? '',
    example: card.example ?? '',
    source: card.source ?? '',
    learningOutcomeText,
    topic: card.topic,
    status: card.status,
    isActive: card.isActive,
  };
}

function paint(
  root: HTMLElement,
  existing: CardRecord | null,
  values: CardDraft,
  errors: CardErrors,
  outcomeOptions: string[],
): void {
  const isEdit = existing !== null;
  root.innerHTML = `
    <section class="panel">
      <h1>${isEdit ? 'Rediger kort' : 'Nytt kort'}</h1>
      ${Object.keys(errors).length > 0 ? '<div class="error-summary" role="alert"><p>Skjemaet kunne ikke lagres. Rett opp feltene merket under.</p></div>' : ''}
      <form class="card-form" data-card-form>
        ${field('topic', 'Tema', input('topic', values.topic, MAX_TOPIC, errors.topic, true))}
        ${field('question', 'Spørsmål', area('question', values.question, 4, errors.question, true))}
        ${field('learningOutcomeText', 'Læringsutbytte', `
          <p class="hint">Hva kortet bidrar til å øve på. Du kan gjenbruke samme tekst på flere kort.</p>
          <input id="learningOutcomeText" name="learningOutcomeText" list="outcome-list" required maxlength="${MAX_TEXT}" value="${escapeAttr(values.learningOutcomeText)}" ${errors.learningOutcomeText ? 'aria-invalid="true"' : ''}>
          <datalist id="outcome-list">${outcomeOptions.map((text) => `<option value="${escapeAttr(text)}"></option>`).join('')}</datalist>
          ${error('learningOutcomeText', errors.learningOutcomeText)}
        `)}
        <fieldset class="answer-group">
          <legend>AI-generert svar</legend>
          <p class="hint">Opprinnelig forslag fra kildematerialet. Dette er ikke automatisk en fasit, og det lagres separat fra din egen formulering.</p>
          ${field('aiAnswer', 'AI-generert forslag', area('aiAnswer', values.aiAnswer, 5, errors.aiAnswer, true))}
        </fieldset>
        <fieldset class="answer-group answer-group--own">
          <legend>Min formulering</legend>
          <p class="hint">Ditt bearbeidede hovedsvar. Når du lagrer et eget svar, blir det hovedsvaret i øvingen og status settes automatisk til «Egen formulering». AI-forslaget beholdes som referanse.</p>
          ${field('userAnswer', 'Mitt svar', area('userAnswer', values.userAnswer, 5, errors.userAnswer, false))}
        </fieldset>
        ${field('example', 'Eksempel eller praksissituasjon', area('example', values.example, 3, errors.example, false))}
        ${field('source', 'Kilde', `
          ${input('source', values.source, MAX_SOURCE, errors.source, false)}
          <p class="hint">Hvor opplysningene kommer fra, for eksempel «Forelesning om universell utforming, lysbilde 14». Kilden er ikke det samme som AI-teksten og bør kontrolleres.</p>
        `)}
        <div class="field">
          <label for="status">Status</label>
          <p class="hint">Hvor langt kortet er kvalitetssikret: AI-utkast (ikke gjennomgått), gjennomgått (kontrollert) eller egen formulering (du har skrevet hovedsvaret).</p>
          <select id="status" name="status" required>
            ${Object.entries(CARD_STATUS_LABELS).map(([value, label]) => `
              <option value="${value}"${values.status === value ? ' selected' : ''}>${escapeHtml(label)}</option>
            `).join('')}
          </select>
          <p class="hint" data-status-hint>${escapeHtml(statusFieldHint(values.userAnswer, values.status))}</p>
        </div>
        <div class="field field--check">
          <input id="isActive" name="isActive" type="checkbox" value="1"${values.isActive ? ' checked' : ''}>
          <label for="isActive">Aktivt kort (inngår i øving når det er forfalt)</label>
        </div>
        <div class="form-actions">
          <button class="button button--primary" type="submit">${isEdit ? 'Lagre endringer' : 'Opprett kort'}</button>
          <a class="button button--secondary" href="${href({ name: 'cards' })}">Avbryt</a>
        </div>
      </form>
    </section>
  `;

  const form = root.querySelector<HTMLFormElement>('[data-card-form]');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.dataset.submitted === '1') {
      return;
    }
    form.dataset.submitted = '1';
    const data = new FormData(form);
    const draft: CardDraft = {
      question: String(data.get('question') ?? ''),
      aiAnswer: String(data.get('aiAnswer') ?? ''),
      userAnswer: String(data.get('userAnswer') ?? ''),
      example: String(data.get('example') ?? ''),
      source: String(data.get('source') ?? ''),
      learningOutcomeText: String(data.get('learningOutcomeText') ?? ''),
      topic: String(data.get('topic') ?? ''),
      status: String(data.get('status') ?? 'ai_utkast') as CardStatus,
      isActive: data.get('isActive') === '1',
    };
    draft.status = resolveCardStatus(draft.userAnswer, draft.status);
    const result = await saveCardDraft(draft, existing);
    if (!result.ok) {
      form.dataset.submitted = '0';
      paint(root, existing, draft, result.errors, outcomeOptions);
      return;
    }
    setFlash('success', isEdit ? 'Kortet er oppdatert.' : 'Kortet er opprettet.');
    navigate({ name: 'cards' });
  });

  bindStatusSync(form);
}

function bindStatusSync(form: HTMLFormElement | null): void {
  const userAnswer = form?.querySelector<HTMLTextAreaElement>('#userAnswer');
  const status = form?.querySelector<HTMLSelectElement>('#status');
  const hint = form?.querySelector('[data-status-hint]');
  if (!form || !userAnswer || !status || !hint) {
    return;
  }

  const sync = (): void => {
    const next = resolveCardStatus(userAnswer.value, status.value as CardStatus);
    if (hasOwnFormulation(userAnswer.value) && status.value !== 'egen_formulering') {
      status.value = 'egen_formulering';
    }
    hint.textContent = statusFieldHint(userAnswer.value, next);
  };

  userAnswer.addEventListener('input', sync);
  status.addEventListener('change', sync);
}

function statusFieldHint(userAnswer: string, status: CardStatus): string {
  if (hasOwnFormulation(userAnswer)) {
    return CARD_STATUS_HINTS.egen_formulering;
  }
  if (status === 'gjennomgatt') {
    return CARD_STATUS_HINTS.gjennomgatt;
  }
  return 'Velg «Gjennomgått» når du har kontrollert AI-forslaget uten å skrive et eget svar. «Egen formulering» settes automatisk når eget svar er fylt ut.';
}

function field(id: string, label: string, control: string): string {
  return `<div class="field"><label for="${id}">${escapeHtml(label)}</label>${control}</div>`;
}

function input(name: string, value: string, max: number, err: string | undefined, required: boolean): string {
  return `<input id="${name}" name="${name}" type="text" maxlength="${max}" ${required ? 'required' : ''} value="${escapeAttr(value)}" ${err ? 'aria-invalid="true"' : ''}>${error(name, err)}`;
}

function area(name: string, value: string, rows: number, err: string | undefined, required: boolean): string {
  return `<textarea id="${name}" name="${name}" rows="${rows}" maxlength="${MAX_TEXT}" ${required ? 'required' : ''} ${err ? 'aria-invalid="true"' : ''}>${escapeHtml(value)}</textarea>${error(name, err)}`;
}

function error(id: string, message?: string): string {
  return message ? `<p class="field-error" id="${id}-error">${escapeHtml(message)}</p>` : '';
}
