import { describe, expect, it } from 'vitest';
import {
  AI_DRAFT_WARNING,
  AI_STATUS_HELP,
  HELP_SECTIONS,
  markIntroSeen,
  renderHelpArticles,
  shouldShowIntro,
} from '@features/help';
import {
  FULLSCREEN_HELP,
  PRACTICE_MOBILE_LEAD,
  RATING_HELP,
  ROTATE_TIP_TEXT,
} from '@features/practice-session';

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

  it('documents mobile practice from the shared practice-help copy', () => {
    const html = renderHelpArticles();
    expect(HELP_SECTIONS.some((section) => section.id === 'oving-pa-mobil')).toBe(true);
    expect(html).toContain('id="oving-pa-mobil"');
    expect(html).toContain(PRACTICE_MOBILE_LEAD);
    expect(html).toContain(ROTATE_TIP_TEXT);
    expect(html).toContain('forslag til svar');
    expect(html).toContain('Mitt svar');
    expect(html).toContain('Avslutt økten');
    expect(html).toContain('rotasjonslås');
    expect(html).toContain('stående visning');
    expect(html).toContain('ikke som sikker fasit');
    expect(html).not.toContain('Vis læringsutbytte');
    expect(html).not.toContain('Til forsiden');
    expect(html).not.toMatch(/<h2>Fasit<\/h2>/);
    if (FULLSCREEN_HELP.available) {
      expect(html).toContain('Fullskjerm');
      expect(html).toContain('Avslutt fullskjerm');
    } else {
      expect(html).not.toContain('Fullskjerm');
    }
  });
});
