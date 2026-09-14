import { describe, expect, it } from 'vitest';
import { renderStatusBadge, CARD_STATUS_HINTS } from '@shared/ui/statusBadge';

describe('status badge', () => {
  it('marks AI-utkast with icon, text and explanation', () => {
    const html = renderStatusBadge('ai_utkast', { hint: true });
    expect(html).toContain('status-badge--ai_utkast');
    expect(html).toContain('AI-utkast');
    expect(html).toContain('status-badge__icon');
    expect(html).toContain(CARD_STATUS_HINTS.ai_utkast);
    expect(html).toContain('status-badge__text');
  });

  it('does not rely on a class name alone for the label', () => {
    const html = renderStatusBadge('gjennomgatt');
    expect(html).toContain('Gjennomgått');
    expect(html).toContain('status-badge__text');
    expect(html).toContain('status-badge__icon');
  });

  it('labels own formulation in text', () => {
    const html = renderStatusBadge('egen_formulering', { hint: true });
    expect(html).toContain('Egen formulering');
    expect(html).toContain(CARD_STATUS_HINTS.egen_formulering);
  });
});
