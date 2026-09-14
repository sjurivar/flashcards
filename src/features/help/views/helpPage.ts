import { href } from '@app/routing/router';
import { resetRotateTip } from '@features/practice-session';
import { HELP_SECTIONS, isHelpSection, renderHelpArticles } from '../content/articles';
import { showIntro } from './intro';

export async function renderHelpPage(root: HTMLElement, section?: string): Promise<void> {
  root.innerHTML = `
    <section class="panel help-page">
      <h1>Hjelp</h1>
      <p class="lede">Korte forklaringer av øving, mobilvisning, AI-utkast, lagring og installasjon.</p>
      <nav class="help-toc" aria-label="På denne siden">
        <ul>
          ${HELP_SECTIONS.map((item) => `
            <li><a href="${href({ name: 'help', section: item.id })}">${item.title}</a></li>
          `).join('')}
        </ul>
      </nav>
      ${renderHelpArticles()}
    </section>
  `;

  root.querySelector('[data-replay-intro]')?.addEventListener('click', () => {
    void showIntro({ force: true });
  });

  root.querySelector('[data-reset-rotate-tip]')?.addEventListener('click', async () => {
    await resetRotateTip();
    const status = root.querySelector<HTMLElement>('[data-rotate-tip-status]');
    if (status) {
      status.hidden = false;
    }
  });

  if (section && isHelpSection(section)) {
    root.querySelector(`#${section}`)?.scrollIntoView({ block: 'start' });
  }
}
