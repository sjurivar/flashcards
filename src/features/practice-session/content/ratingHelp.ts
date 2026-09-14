export const RATING_HELP = {
  kan_ikke: {
    label: 'Kan ikke',
    meaning: 'Jeg klarte ikke å svare, eller svaret mitt var vesentlig feil.',
    repetition: 'Kortet kommer tilbake én gang senere i samme økt, og er klart igjen i dag.',
  },
  usikker: {
    label: 'Usikker',
    meaning: 'Jeg kunne deler av svaret, men manglet viktige poenger.',
    repetition: 'Kortet vises igjen neste dag.',
  },
  kan: {
    label: 'Kan',
    meaning: 'Jeg kunne forklare hovedinnholdet uten vesentlig hjelp.',
    repetition: 'Kortet vises igjen etter tre dager.',
  },
} as const;

export function renderRatingHelpBody(): string {
  return `
    <p>Velg det som passer best. Valget styrer når kortet kommer tilbake.</p>
    <ul class="help-list">
      ${Object.values(RATING_HELP).map((item) => `
        <li>
          <strong>${item.label}:</strong> ${item.meaning}
          <span class="muted"> ${item.repetition}</span>
        </li>
      `).join('')}
    </ul>
  `;
}
