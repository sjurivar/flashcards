import { CARD_STATUS_LABELS, type CardStatus } from '@shared/types';
import { escapeHtml } from '@shared/utilities/html';

export const CARD_STATUS_HINTS: Record<CardStatus, string> = {
  ai_utkast: 'Generert fra kildematerialet – ikke gjennomgått av deg ennå.',
  gjennomgatt: 'AI-utkastet er kontrollert, men svaret er ikke erstattet med en egen formulering.',
  egen_formulering: 'Du har skrevet ditt eget svar. AI-forslaget ligger som referanse.',
};

const ICONS: Record<CardStatus, string> = {
  ai_utkast: `<svg class="status-badge__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M10 2.2 11.2 6.4 15.5 7.5 11.2 8.6 10 12.8 8.8 8.6 4.5 7.5 8.8 6.4Z"/>
    <path fill="currentColor" d="M15.2 11.4 15.8 13.5 18 14.1 15.8 14.7 15.2 16.8 14.6 14.7 12.4 14.1 14.6 13.5Z"/>
  </svg>`,
  gjennomgatt: `<svg class="status-badge__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M8.2 13.4 4.8 10l1.4-1.4 2 2 5.6-5.6 1.4 1.4z"/>
  </svg>`,
  egen_formulering: `<svg class="status-badge__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M4 13.9V16h2.1l6.2-6.2-2.1-2.1zm10.7-6.3 1.1-1.1a1.2 1.2 0 0 0 0-1.7l-1.6-1.6a1.2 1.2 0 0 0-1.7 0l-1.1 1.1z"/>
  </svg>`,
};

export function renderStatusBadge(
  status: CardStatus,
  options: { hint?: boolean; className?: string } = {},
): string {
  const hint = options.hint ?? false;
  const extra = options.className ? ` ${options.className}` : '';
  const label = CARD_STATUS_LABELS[status];

  return `
    <div class="status-badge-wrap${extra}">
      <span class="status-badge status-badge--${status}">
        ${ICONS[status]}
        <span class="status-badge__text">${escapeHtml(label)}</span>
      </span>
      ${hint ? `<p class="status-badge__hint">${escapeHtml(CARD_STATUS_HINTS[status])}</p>` : ''}
    </div>
  `;
}
