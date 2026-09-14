import { describe, expect, it } from 'vitest';
import { AI_DRAFT_WARNING, AI_STATUS_HELP, markIntroSeen, shouldShowIntro } from '@features/help';
import { RATING_HELP } from '@features/practice-session';

describe('help content', () => {
  it('shows the intro only the first time', async () => {
    expect(await shouldShowIntro()).toBe(true);
    await markIntroSeen();
    expect(await shouldShowIntro()).toBe(false);
  });

  it('explains rating repetition rules', () => {
    expect(RATING_HELP.kan_ikke.meaning).toContain('vesentlig feil');
    expect(RATING_HELP.kan_ikke.repetition).toContain('samme økt');
    expect(RATING_HELP.usikker.repetition).toContain('neste dag');
    expect(RATING_HELP.kan.repetition).toContain('tre dager');
  });

  it('includes the AI draft warning and status explanations', () => {
    expect(AI_DRAFT_WARNING).toContain('generert med hjelp av AI');
    expect(AI_DRAFT_WARNING).toContain('bør kontrolleres');
    expect(AI_STATUS_HELP.map((item) => item.status)).toEqual([
      'AI-utkast',
      'Gjennomgått',
      'Egen formulering',
    ]);
  });
});
