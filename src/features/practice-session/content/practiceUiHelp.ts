export const ROTATE_TIP_TEXT = 'Tips: Roter telefonen for en større kortvisning.';

export const PRACTICE_MOBILE_LEAD =
  'Du kan øve med telefonen både stående og liggende. Når du roterer telefonen, tilpasses kortet automatisk. Liggende visning gir bedre plass til spørsmål, svar og eksempler.';

export const PRACTICE_SURFACE_HELP = {
  statusBeforeAnswer: 'Statusen <strong>AI-utkast</strong> vises før du åpner svaret, sammen med tema og fremdrift.',
  reveal: 'Velg <strong>Vis svar</strong> når du har tenkt. Vurderingsknappene vises først etter at svaret er åpnet.',
  aiAnswer: 'AI-generert innhold omtales som <strong>forslag til svar</strong>, ikke som sikker fasit.',
  ownAnswer: 'Har du skrevet en egen formulering, vises den som <strong>Mitt svar</strong>. AI-teksten ligger da som referanse.',
  outcome: 'Læringsutbyttet kan være sammenfoldet på mobil, bak <strong>Utbytte</strong>.',
  navigation: 'Vanlig navigasjon skjules eller komprimeres mens en økt pågår. Du avslutter med den diskrete handlingen <strong>Avslutt økten</strong>.',
  scroll: 'Lange spørsmål og svar kan rulles, slik at handlingene fortsatt er tilgjengelige.',
  ratings: '<strong>Kan ikke</strong>, <strong>Usikker</strong> og <strong>Kan</strong> styrer når kortet kommer tilbake, ikke om du «består».',
} as const;

export const FULLSCREEN_HELP = {
  available: true,
  open: 'Trykk <strong>Fullskjerm</strong> for å skjule mest mulig av nettleseren.',
  optional: 'Fullskjerm er valgfritt. Appen fungerer like godt uten.',
  support: 'Funksjonen er ikke tilgjengelig i alle nettlesere og på alle enheter. Knappen vises bare når enheten støtter den.',
  exit: 'Avslutt med <strong>Avslutt fullskjerm</strong>, Esc, eller ved å forlate øvingsvisningen.',
} as const;

export function renderPracticeSurfaceHelp(): string {
  return `
    <ul class="help-list">
      <li>${PRACTICE_SURFACE_HELP.statusBeforeAnswer}</li>
      <li>${PRACTICE_SURFACE_HELP.reveal}</li>
      <li>${PRACTICE_SURFACE_HELP.aiAnswer}</li>
      <li>${PRACTICE_SURFACE_HELP.ownAnswer}</li>
      <li>${PRACTICE_SURFACE_HELP.outcome}</li>
      <li>${PRACTICE_SURFACE_HELP.navigation}</li>
      <li>${PRACTICE_SURFACE_HELP.scroll}</li>
      <li>${PRACTICE_SURFACE_HELP.ratings}</li>
    </ul>
  `;
}

export function renderFullscreenHelp(): string {
  if (!FULLSCREEN_HELP.available) {
    return '';
  }
  return `
    <h3>Fullskjerm</h3>
    <ul class="help-list">
      <li>${FULLSCREEN_HELP.open}</li>
      <li>${FULLSCREEN_HELP.optional}</li>
      <li>${FULLSCREEN_HELP.support}</li>
      <li>${FULLSCREEN_HELP.exit}</li>
    </ul>
  `;
}
