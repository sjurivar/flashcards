import { escapeHtml } from '@shared/utilities/html';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface HelpDialogOptions {
  title: string;
  body: string;
  footer?: string;
  labelledBy?: string;
  onClose?: () => void;
}

export interface HelpDialogHandle {
  root: HTMLElement;
  dialog: HTMLElement;
  close: () => void;
  setBody: (html: string) => void;
  setFooter: (html: string) => void;
  setTitle: (title: string) => void;
}

let openCount = 0;

export function openHelpDialog(options: HelpDialogOptions): HelpDialogHandle {
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const backdrop = document.createElement('div');
  backdrop.className = 'help-dialog-backdrop';
  backdrop.dataset.helpDialog = '1';
  backdrop.innerHTML = `
    <div class="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-dialog-title">
      <h2 id="help-dialog-title">${escapeHtml(options.title)}</h2>
      <div class="help-dialog__body">${options.body}</div>
      <div class="help-dialog__footer">${options.footer ?? '<button class="button button--primary" type="button" data-dialog-close>Lukk</button>'}</div>
    </div>
  `;

  const dialog = backdrop.querySelector<HTMLElement>('.help-dialog');
  const body = backdrop.querySelector<HTMLElement>('.help-dialog__body');
  const footer = backdrop.querySelector<HTMLElement>('.help-dialog__footer');
  const title = backdrop.querySelector<HTMLElement>('#help-dialog-title');
  if (!dialog || !body || !footer || !title) {
    throw new Error('Hjelpedialogen kunne ikke opprettes.');
  }

  const controller = new AbortController();
  const { signal } = controller;
  let closed = false;

  const close = (): void => {
    if (closed) {
      return;
    }
    closed = true;
    controller.abort();
    backdrop.remove();
    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) {
      document.getElementById('app')?.removeAttribute('aria-hidden');
    }
    previousFocus?.focus();
    options.onClose?.();
  };

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      close();
    }
  }, { signal });

  backdrop.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.hasAttribute('disabled'));
    if (items.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, { signal });

  footer.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('[data-dialog-close]')) {
      close();
    }
  }, { signal });

  document.body.append(backdrop);
  openCount += 1;
  document.getElementById('app')?.setAttribute('aria-hidden', 'true');
  dialog.tabIndex = -1;
  const first = dialog.querySelector<HTMLElement>(FOCUSABLE);
  (first ?? dialog).focus();

  return {
    root: backdrop,
    dialog,
    close,
    setBody(html: string) {
      body.innerHTML = html;
    },
    setFooter(html: string) {
      footer.innerHTML = html;
    },
    setTitle(next: string) {
      title.textContent = next;
    },
  };
}

export function closeOpenHelpDialogs(): void {
  document.querySelectorAll<HTMLElement>('[data-help-dialog]').forEach((node) => node.remove());
  openCount = 0;
  document.getElementById('app')?.removeAttribute('aria-hidden');
}
