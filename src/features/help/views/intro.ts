import { INTRO_STEPS } from '../content/intro';
import { markIntroSeen, shouldShowIntro } from '../storage/introState';
import { closeOpenHelpDialogs, openHelpDialog } from '../components/dialog';

let introVisible = false;

export function resetIntroLock(): void {
  introVisible = false;
}

export async function maybeShowIntro(): Promise<void> {
  if (introVisible || !(await shouldShowIntro())) {
    return;
  }
  await showIntro();
}

export async function showIntro(options: { force?: boolean } = {}): Promise<void> {
  if (introVisible) {
    return;
  }
  if (!options.force && !(await shouldShowIntro())) {
    return;
  }
  closeOpenHelpDialogs();
  introVisible = true;
  let step = 0;

  const paint = (): void => {
    const current = INTRO_STEPS[step];
    const last = step === INTRO_STEPS.length - 1;
    handle.setTitle(current.title);
    handle.setBody(`
      <p class="muted">Steg ${step + 1} av ${INTRO_STEPS.length}</p>
      <p>${current.body}</p>
      <p class="hint">Hopp over skjuler introduksjonen neste gang. Du finner den igjen under Hjelp. Escape eller trykk utenfor lukker bare for nå.</p>
    `);
    handle.setFooter(`
      <button class="button button--ghost" type="button" data-intro-skip>Hopp over</button>
      ${step > 0 ? '<button class="button button--secondary" type="button" data-intro-prev>Forrige</button>' : ''}
      <button class="button button--primary" type="button" data-intro-next>${last ? 'Ferdig' : 'Neste'}</button>
    `);
  };

  const finish = async (): Promise<void> => {
    await markIntroSeen();
    handle.close();
  };

  const handle = openHelpDialog({
    title: INTRO_STEPS[0].title,
    body: '',
    footer: '',
    onClose: () => {
      introVisible = false;
    },
  });

  handle.root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.closest('[data-intro-skip]')) {
      void finish();
      return;
    }
    if (target.closest('[data-intro-prev]')) {
      step = Math.max(0, step - 1);
      paint();
      return;
    }
    if (target.closest('[data-intro-next]')) {
      if (step >= INTRO_STEPS.length - 1) {
        void finish();
        return;
      }
      step += 1;
      paint();
    }
  });

  paint();
}
