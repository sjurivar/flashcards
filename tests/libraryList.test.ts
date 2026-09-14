/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { renderCardList, saveCardDraft } from '@features/card-library';

describe('card library list', () => {
  it('shows status badges and can filter AI drafts', async () => {
    await saveCardDraft({
      question: 'AI-spørsmål',
      aiAnswer: 'AI-svar',
      userAnswer: '',
      example: '',
      source: '',
      learningOutcomeText: 'Læringsutbytte A',
      topic: 'Tema A',
      status: 'ai_utkast',
      isActive: true,
    }, null);
    await saveCardDraft({
      question: 'Eget spørsmål',
      aiAnswer: 'AI-svar',
      userAnswer: 'Mitt svar',
      example: '',
      source: '',
      learningOutcomeText: 'Læringsutbytte B',
      topic: 'Tema B',
      status: 'ai_utkast',
      isActive: true,
    }, null);

    const root = document.createElement('div');
    await renderCardList(root);

    expect(root.textContent).toContain('AI-utkast');
    expect(root.textContent).toContain('Egen formulering');
    expect(root.textContent).toContain('Skriv egen formulering');
    expect(root.textContent).toContain('Merk som gjennomgått');
    expect(root.querySelectorAll('.status-badge').length).toBeGreaterThan(0);

    const draftFilter = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')].find((button) => button.dataset.filter === 'ai_utkast');
    draftFilter?.click();
    expect(root.textContent).toContain('AI-spørsmål');
    expect(root.textContent).not.toContain('Eget spørsmål');
  });
});
