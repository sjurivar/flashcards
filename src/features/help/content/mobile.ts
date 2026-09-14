import {
  PRACTICE_MOBILE_LEAD,
  ROTATE_TIP_TEXT,
  renderFullscreenHelp,
  renderPracticeSurfaceHelp,
} from '@features/practice-session/content/practiceUiHelp';

export { PRACTICE_MOBILE_LEAD, ROTATE_TIP_TEXT };

export function renderMobilePracticeArticle(): string {
  return `
    <article class="help-article" id="oving-pa-mobil">
      <h2>Øving på mobil</h2>
      <p>${PRACTICE_MOBILE_LEAD}</p>
      <ul class="help-list">
        <li>Appen fungerer både i stående og liggende skjermretning. Liggende visning er ikke obligatorisk.</li>
        <li>Roter telefonen fysisk etter at økten er åpnet. Appen tvinger ikke skjermretningen og kan ikke overstyre rotasjonslåsen.</li>
        <li>Kortet tilpasses automatisk. I liggende visning på liten skjerm får spørsmål og svar mer plass.</li>
        <li>På liten, stående skjerm kan du se tipset <strong>${escapeForText(ROTATE_TIP_TEXT)}</strong> én gang. Skjuler du det, vises det ikke automatisk igjen. Valget lagres lokalt på enheten.</li>
      </ul>
      ${renderPracticeSurfaceHelp()}
      ${renderFullscreenHelp()}
      <h3>Skjermen roterer ikke</h3>
      <ol>
        <li>Kontroller at telefonens rotasjonslås er slått av.</li>
        <li>Roter telefonen etter at øvingsøkten er åpnet.</li>
        <li>Prøv vanlig nettleservisning dersom den installerte appen (PWA) ikke roterer som forventet.</li>
      </ol>
      <h3>Installert app og nettleser</h3>
      <ul class="help-list">
        <li>I vanlig nettleser kan adressefelt og nettleserknapper bruke noe av skjermplassen.</li>
        <li>En installert PWA gir en renere appvisning.</li>
        <li>Lokale data ligger fortsatt på enheten. Installasjon eller fullskjerm gir ikke automatisk synkronisering.</li>
      </ul>
      <h3>Tilgjengelighet</h3>
      <ul class="help-list">
        <li>Du kan bruke appen uten å rotere skjermen. Alle hovedfunksjoner er tilgjengelige i stående visning.</li>
        <li>Fullskjerm er valgfritt.</li>
        <li>Tastatur og skjermleser kan fortsatt brukes.</li>
      </ul>
      <p>
        <button class="button button--secondary" type="button" data-reset-rotate-tip>Vis mobiltips igjen</button>
      </p>
      <p class="muted" data-rotate-tip-status hidden>Mobiltipset vises igjen neste gang du øver i stående visning på en liten skjerm.</p>
    </article>
  `;
}

function escapeForText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
