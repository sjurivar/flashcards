/**
 * Utvidelsespunkt for senere AI-import.
 *
 * Ikke bygg et generelt AI-lag nå. En fremtidig feature, for eksempel
 * `features/ai-import`, kan:
 * 1. motta presentasjoner eller notater i UI-et
 * 2. sende innholdet til en serverbasert tjeneste (API-nøkkel bare på server)
 * 3. motta foreslåtte kort
 * 4. la brukeren kontrollere og godkjenne dem
 * 5. lagre godkjente kort via det offentlige API-et i `card-library`
 *
 * API-nøkler skal aldri ligge i PWA-en eller IndexedDB.
 */
export const AI_IMPORT_EXTENSION = 'features/ai-import';
