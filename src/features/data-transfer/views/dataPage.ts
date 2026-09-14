import { navigate } from '@app/routing/router';
import { setFlash } from '@shared/ui/flash';
import { escapeHtml } from '@shared/utilities/html';
import { parseExportJson, previewExport, type ImportMode, type ImportPreview } from '../domain/importData';
import type { ExportPayload } from '../domain/exportFormat';
import { applyImport, buildExport } from '../storage/transfer';

export async function renderDataPage(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    <section class="panel">
      <h1>Sikkerhetskopi og flytting</h1>
      <p>All progresjon ligger lokalt i nettleseren og er knyttet til origin (protokoll, vert og port), ikke til stien <code>/flashcards/</code>. Eksporter jevnlig hvis du bytter maskin, nettleser eller senere flytter appen til et annet domene.</p>
      <div class="hero__actions">
        <button class="button button--primary" type="button" data-action="export">Eksporter data</button>
      </div>
    </section>
    <section class="panel">
      <h2>Importer data</h2>
      <form data-import-form>
        <div class="field">
          <label for="import-file">JSON-fil</label>
          <input id="import-file" name="file" type="file" accept="application/json,.json" required>
        </div>
        <fieldset>
          <legend>Hvordan skal dataene brukes?</legend>
          <div class="field field--check">
            <input id="mode-merge" name="mode" type="radio" value="merge" checked>
            <label for="mode-merge">Slå sammen. Eksisterende ID-er beholdes, nye legges til.</label>
          </div>
          <div class="field field--check">
            <input id="mode-replace" name="mode" type="radio" value="replace">
            <label for="mode-replace">Erstatt alt. Dette sletter kort og historikk som er her nå.</label>
          </div>
        </fieldset>
        <div class="form-actions">
          <button class="button button--secondary" type="submit">Forhåndsvis import</button>
        </div>
      </form>
      <div data-preview></div>
    </section>
    <section class="panel">
      <h2>Nettadresse og data</h2>
      <p>IndexedDB er knyttet til origin, ikke URL-stien. <code>localhost</code> og <code>sjurivar.github.io</code> er to ulike lagre. På samme GitHub Pages-domene bruker appen databasen <code>sjurivar-flashcards</code> for å unngå kollisjon med andre apper. Bytt av origin, nettleser eller enhet krever eksport og import. Automatisk synkronisering finnes ikke ennå.</p>
    </section>
    <section class="panel">
      <h2>Nettbaserte funksjoner</h2>
      <p class="muted">AI-generering og synkronisering mellom enheter er ikke tilgjengelig i denne versjonen. Appen virker uten nett når den først er lastet.</p>
    </section>
  `;

  root.querySelector('[data-action="export"]')?.addEventListener('click', async () => {
    const payload = await buildExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flashcards-${payload.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setFlash('success', 'Eksportfilen er lastet ned.');
  });

  const form = root.querySelector<HTMLFormElement>('[data-import-form]');
  const previewBox = root.querySelector<HTMLElement>('[data-preview]');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = form.querySelector<HTMLInputElement>('#import-file');
    const file = fileInput?.files?.[0];
    if (!file || !previewBox) {
      return;
    }
    try {
      const payload = parseExportJson(await file.text());
      const preview = previewExport(payload);
      const mode = (new FormData(form).get('mode') || 'merge') as ImportMode;
      showPreview(previewBox, payload, preview, mode);
    } catch (error) {
      previewBox.innerHTML = `<p class="field-error" role="alert">${escapeHtml(error instanceof Error ? error.message : 'Ugyldig fil.')}</p>`;
    }
  });
}

function showPreview(
  root: HTMLElement,
  payload: ExportPayload,
  preview: ImportPreview,
  mode: ImportMode,
): void {
  root.innerHTML = `
    <div class="offer">
      <h3>Forhåndsvisning</h3>
      <ul class="stat-list">
        <li><span>Kort</span> <strong>${preview.cards}</strong></li>
        <li><span>Læringsutbytter</span> <strong>${preview.learningOutcomes}</strong></li>
        <li><span>Øvingshistorikk</span> <strong>${preview.reviews}</strong></li>
        <li><span>Økter</span> <strong>${preview.sessions}</strong></li>
      </ul>
      <p>${mode === 'replace' ? 'Dette erstatter all lokal data.' : 'Nye ID-er legges til. Eksisterende ID-er beholdes.'}</p>
      ${mode === 'replace' ? '<p class="field-error">Bekreft at du vil slette dagens lokale kort og historikk.</p>' : ''}
      <div class="hero__actions">
        <button class="button button--primary" type="button" data-confirm-import>
          ${mode === 'replace' ? 'Ja, erstatt alt' : 'Slå sammen'}
        </button>
        ${mode === 'replace' ? '<button class="button button--ghost" type="button" data-cancel-import>Avbryt</button>' : ''}
      </div>
    </div>
  `;

  root.querySelector('[data-cancel-import]')?.addEventListener('click', () => {
    root.innerHTML = '';
  });

  root.querySelector('[data-confirm-import]')?.addEventListener('click', async () => {
    await applyImport(payload, mode);
    setFlash('success', mode === 'replace' ? 'Lokal data er erstattet.' : 'Importen er slått sammen.');
    navigate({ name: 'data' });
  });
}
