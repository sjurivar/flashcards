export const AI_DRAFT_WARNING =
  'Spørsmål og svar er generert med hjelp av AI fra kildemateriale. Innholdet kan være ufullstendig eller feil og bør kontrolleres.';

export const AI_STATUS_HELP = [
  { status: 'AI-utkast', text: 'Ikke gjennomgått av deg ennå. Dette er et forslag, ikke en fasit.' },
  { status: 'Gjennomgått', text: 'Du har kontrollert innholdet, men ikke erstattet svaret med en egen formulering.' },
  { status: 'Egen formulering', text: 'Du har skrevet ditt eget hovedsvar. AI-forslaget beholdes som referanse.' },
] as const;

export function renderAiHelpBody(): string {
  return `
    <p>${AI_DRAFT_WARNING}</p>
    <p>AI-forslaget er ikke automatisk riktig. Sjekk gjerne kildehenvisningen, og skriv egne formuleringer som en del av læringen.</p>
    <ul class="help-list">
      ${AI_STATUS_HELP.map((item) => `<li><strong>${item.status}:</strong> ${item.text}</li>`).join('')}
    </ul>
  `;
}
