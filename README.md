# Flashcards

Installerbar, local-first studiehjelper. Kort, progresjon og historikk ligger i nettleseren (IndexedDB). Ingen backend eller MySQL.

Forventet produksjonsadresse: [https://sjurivar.github.io/flashcards/](https://sjurivar.github.io/flashcards/)

## Lokal oppstart

```bash
npm install
npm run dev
```

Åpne adressen Vite viser, vanligvis `http://localhost:5173/`.

## Produksjonsbygg

```bash
npm run build
npm run preview
```

GitHub Pages-bygget bruker `VITE_BASE=/flashcards/`. Lokalt brukes relativ base `./` hvis variabelen ikke er satt.

```bash
npm run icons
```

regenererer favicon og PWA-ikoner fra SVG-grunnikonet.

## Tester

```bash
npm test
```

## GitHub Pages

Deployment skjer med GitHub Actions-workflowen [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

Den kjører på push til `main` (og manuelt via *workflow_dispatch*):

1. `npm ci`
2. `npm test`
3. `npm run build` med `VITE_BASE=/flashcards/`
4. Offisiell Pages-deployment (`actions/upload-pages-artifact` og `actions/deploy-pages`)

### Aktivering i GitHub

Disse stegene må gjøres i GitHub. Appen pusher ikke automatisk.

1. Opprett repoet `flashcards` under brukeren `sjurivar` hvis det ikke finnes.
2. Push `main` til GitHub.
3. Åpne **Settings → Pages**.
4. Under **Build and deployment** velg **GitHub Actions** som kilde.
5. Gi workflowen lov til å kjøre (Actions-fanen, eventuelt godkjenn første kjøring).
6. Etter grønn workflow: åpne `https://sjurivar.github.io/flashcards/`.

Appen bruker hash-ruting (`#/cards`, `#/practice`). Oppdatering og direkte åpning av en rute treffer derfor `index.html` og trenger ikke 404-fallback.

## Installasjon av PWA

**PC (Chrome/Edge):** åpne produksjonsadressen over HTTPS, velg installér-ikonet i adresselinjen eller *Installér app* i menyen.

**Mobil:** åpne siden i Safari (iOS) eller Chrome (Android). Velg *Del → Legg til på Hjem-skjerm* eller *Installér app*.

Etter første besøk på nett kan appen åpnes offline. Ny versjon vises med meldingen «En ny versjon av appen er klar» og knappen **Oppdater**. Lokale kort slettes ikke av oppdateringen.

Øvingsmodus er responsiv. På liten skjerm i liggende retning brukes nesten hele flaten, og menyen skjules under økten. Fullskjerm er valgfritt når nettleseren støtter Fullscreen API. Detaljert brukerhjelp ligger i appen under **Hjelp**.

## Sikkerhetskopi av lokale data

IndexedDB er knyttet til **origin** (protokoll + vert + port), ikke til URL-stien.

- `http://localhost:5173` og `https://sjurivar.github.io` er to ulike origin-er og dermed to ulike lagre.
- Stien `/flashcards/` skiller ikke data fra andre apper på samme GitHub Pages-domene. Appen bruker derfor databasen `sjurivar-flashcards`.
- Bytt av domene, nettleser eller enhet gir et tomt lager. Bytt av repository-sti på samme origin gjør det ikke.
- Det finnes ingen automatisk synkronisering.

Bruk **Data → Eksporter data** for JSON-sikkerhetskopi, og **Importer data** for å slå sammen eller erstatte på en ny adresse eller enhet. Installasjon og fullskjerm synkroniserer ikke data.

## Arkitektur

Koden er organisert etter funksjon:

- `src/app` — skall, ruting, PWA
- `src/features/dashboard` — startside
- `src/features/card-library` — kort og validering
- `src/features/practice-session` — øving og repetisjon
- `src/features/learning-outcomes` — læringsutbytter
- `src/features/example-data` — innebygde eksempelkort
- `src/features/data-transfer` — eksport og import
- `src/shared` — bare det flere features faktisk deler

### IndexedDB

Dexie brukes som tynt lag over IndexedDB. Databasen heter `sjurivar-flashcards` og har eksplisitt skjemaversjon. Appoppdateringer skal utvide skjemaet, ikke slette kort.

### PWA

`vite-plugin-pwa` lager manifest og service worker som cacher applikasjonsskallet. Brukerdata caches ikke.

### AI senere

Se `src/app/future-ai.ts`. API-nøkler skal aldri ligge i PWA-en.
