export interface IntroStep {
  title: string;
  body: string;
}

export const INTRO_STEPS: IntroStep[] = [
  {
    title: 'Svar før du ser forslaget',
    body: 'Les spørsmålet og prøv å svare med egne ord før du åpner svaret. Det er selve øvingen.',
  },
  {
    title: 'Sammenlign med forslaget',
    body: 'Når du er klar, vis svaret og sammenlign med forslaget. AI-tekst kan inneholde feil, så les med et kritisk blikk.',
  },
  {
    title: 'Vurder ærlig',
    body: 'Velg Kan ikke, Usikker eller Kan. Valget styrer når kortet kommer tilbake, ikke om du «består».',
  },
  {
    title: 'Gjør AI-utkastene til dine',
    body: 'Etter hvert bør du kontrollere AI-utkast og skrive egne formuleringer. Da lærer du mer, og svaret blir ditt.',
  },
];
