import { href } from '@app/routing/router';
import { renderMobilePracticeArticle } from './mobile';

export const HELP_SECTIONS = [
  { id: 'kom-i-gang', title: 'Kom i gang' },
  { id: 'slik-laerer-du', title: 'Slik lærer du med kortene' },
  { id: 'oving-pa-mobil', title: 'Øving på mobil' },
  { id: 'ai-utkast', title: 'AI-utkast og egne formuleringer' },
  { id: 'kortbibliotek', title: 'Kortbibliotek' },
  { id: 'lagring', title: 'Hvor lagres dataene?' },
  { id: 'sikkerhetskopi', title: 'Sikkerhetskopiering' },
  { id: 'installer', title: 'Installer appen' },
  { id: 'offline', title: 'Offline-bruk og oppdateringer' },
  { id: 'laeringsutbytter', title: 'Om læringsutbyttene' },
] as const;

export type HelpSectionId = (typeof HELP_SECTIONS)[number]['id'];

export function isHelpSection(value: string | undefined): value is HelpSectionId {
  return HELP_SECTIONS.some((section) => section.id === value);
}

export function renderHelpArticles(): string {
  return `
    <article class="help-article" id="kom-i-gang">
      <h2>Kom i gang</h2>
      <ol>
        <li>Velg <strong>Start øving</strong> på forsiden.</li>
        <li>Les spørsmålet. Status som <strong>AI-utkast</strong> vises før svaret. Prøv å svare selv.</li>
        <li>Velg <strong>Vis svar</strong> når du har tenkt. Vurderingsknappene kommer deretter.</li>
        <li>Sammenlign med <strong>forslag til svar</strong>, eller med <strong>Mitt svar</strong> hvis du har skrevet en egen formulering.</li>
        <li>Vurder mestring: <strong>Kan ikke</strong>, <strong>Usikker</strong> eller <strong>Kan</strong>. Valget styrer neste repetisjon.</li>
        <li>Fortsett til øktoppsummeringen, eller velg <strong>Avslutt økten</strong>. Navigasjonen kan være skjult mens økten pågår.</li>
      </ol>
      <p><button class="button button--secondary" type="button" data-replay-intro>Vis introduksjonen på nytt</button></p>
    </article>

    <article class="help-article" id="slik-laerer-du">
      <h2>Slik lærer du med kortene</h2>
      <p>Du lærer mer når du henter frem svaret fra minnet, ikke når du bare leser det. Derfor er svaret skjult først.</p>
      <p>Etter hver vurdering venter appen litt før kortet kommer tilbake:</p>
      <ul class="help-list">
        <li><strong>Kan ikke:</strong> kortet kommer én gang til senere i samme økt, og er klart igjen i dag.</li>
        <li><strong>Usikker:</strong> kortet vises igjen neste dag.</li>
        <li><strong>Kan:</strong> kortet vises igjen etter tre dager.</li>
      </ul>
      <p>Vær ærlig. Målet er å øve på det som fortsatt er usikkert, ikke å samle «Kan».</p>
    </article>

    ${renderMobilePracticeArticle()}

    <article class="help-article" id="ai-utkast">
      <h2>AI-utkast og egne formuleringer</h2>
      <p>Mange kort starter som AI-utkast, laget ut fra kildemateriale. De kan være ufullstendige eller feil.</p>
      <ol>
        <li>Les gjennom AI-forslaget og sjekk kilden når den finnes.</li>
        <li>Merk kortet som <strong>Gjennomgått</strong> når innholdet stemmer, men du ennå ikke har skrevet det selv.</li>
        <li>Skriv <strong>Egen formulering</strong> når du kan si det med egne ord. Da blir ditt svar hovedsvaret i øvingen, mens AI-teksten ligger igjen som referanse.</li>
      </ol>
      <p>Egen bearbeiding er en del av læringen, ikke bare kvalitetssikring.</p>
    </article>

    <article class="help-article" id="kortbibliotek">
      <h2>Kortbibliotek</h2>
      <p>I biblioteket kan du opprette kort, redigere spørsmål og svar, filtrere på status og aktivere eller deaktivere kort.</p>
      <ul class="help-list">
        <li>Nye kort blir med i øving når de er aktive og forfalt.</li>
        <li>Deaktiverte kort beholdes, men vises ikke i økten.</li>
        <li>Filteret <strong>AI-utkast</strong> viser kort som trenger gjennomgang.</li>
      </ul>
    </article>

    <article class="help-article" id="lagring">
      <h2>Hvor lagres dataene?</h2>
      <p>Kort, progresjon og innstillinger lagres lokalt i nettleserens IndexedDB. De sendes ikke automatisk til en server, og synkroniseres ikke mellom enheter.</p>
      <p>IndexedDB er knyttet til <strong>origin</strong> (protokoll, vert og port), for eksempel <code>https://sjurivar.github.io</code>. Stien <code>/flashcards/</code> skiller ikke lagringen. <code>localhost</code> og GitHub Pages er to ulike lagre.</p>
      <ul class="help-list">
        <li>Tømming av nettsteddata kan slette kort og progresjon.</li>
        <li>Inkognito- eller privat modus skal ikke brukes til varig lagring.</li>
        <li>Reinstallering, ny nettleser eller ny enhet kan kreve import av sikkerhetskopi.</li>
      </ul>
    </article>

    <article class="help-article" id="sikkerhetskopi">
      <h2>Sikkerhetskopiering</h2>
      <p>Eksporter jevnlig en JSON-fil fra datasiden. Filen kan importeres senere på samme eller en annen enhet.</p>
      <ul class="help-list">
        <li><strong>Slå sammen:</strong> eksisterende kort med samme ID beholdes. Nye kort legges til.</li>
        <li><strong>Erstatt:</strong> all lokal data slettes og erstattes med filen. Krever ekstra bekreftelse.</li>
      </ul>
      <p><a class="button button--primary" href="${href({ name: 'data' })}">Gå til eksport og import</a></p>
    </article>

    <article class="help-article" id="installer">
      <h2>Installer appen</h2>
      <p>Du kan legge Flashcards på hjemskjermen. Installasjonsvalget ser ikke likt ut i alle nettlesere, og noen skjulter det i menyen.</p>
      <h3>Chrome eller Edge på PC</h3>
      <p>Åpne nettlesermenyen (ofte tre prikker) og se etter <strong>Installer app</strong> eller et installasjonsikon i adressefeltet.</p>
      <h3>Android</h3>
      <p>I Chrome: åpne menyen og velg <strong>Installer app</strong> eller <strong>Legg til på startskjerm</strong>.</p>
      <h3>iPhone og iPad</h3>
      <p>I Safari: trykk på <strong>Del</strong> og velg <strong>Legg til på Hjem-skjerm</strong>.</p>
      <p>I vanlig nettleser kan adressefelt og knapper bruke noe av skjermplassen. En installert PWA gir en renere visning, men lokale data ligger fortsatt på enheten. Installasjon gir ikke automatisk synkronisering mellom enheter.</p>
    </article>

    <article class="help-article" id="offline">
      <h2>Offline-bruk og oppdateringer</h2>
      <p>Etter første innlasting kan appen brukes uten nett. Nye kort og progresjon lagres fortsatt lokalt.</p>
      <p>Senere AI-generering av nye kort vil kreve nett. Øving på kortene du allerede har, vil ikke det.</p>
      <p>Når en ny versjon er klar, vises et felt nederst: <strong>En ny versjon av appen er klar</strong>. Trykk <strong>Oppdater</strong>. Kortene dine blir værende i nettleseren.</p>
    </article>

    <article class="help-article" id="laeringsutbytter">
      <h2>Om læringsutbyttene</h2>
      <p>Hvert kort kan knyttes til et læringsutbytte. Da ser du hvilken del av emnet kortet øver på, og du kan gjenbruke samme utbytte på flere kort.</p>
      <p>I øving kan utbyttet være sammenfoldet på mobil, bak <strong>Utbytte</strong>. På større skjerm vises det mer åpent.</p>
    </article>
  `;
}
