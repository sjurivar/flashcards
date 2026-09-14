import { describe, expect, it } from 'vitest';
import { renderAnswerPanel } from '@features/practice-session';
import type { CardRecord } from '@features/card-library';
import { SCHEMA_VERSION } from '@shared/types';

function card(overrides: Partial<CardRecord> = {}): CardRecord {
  return {
    id: 'card-1',
    question: 'Hva er universell utforming?',
    aiAnswer: 'AI-forslag om universell utforming.',
    userAnswer: null,
    example: 'Trinnfri inngang.',
    source: 'Forelesning om universell utforming, lysbilde 14',
    learningOutcomeId: 'outcome-1',
    topic: 'Universell utforming',
    status: 'ai_utkast',
    isActive: true,
    createdAt: '2026-09-14T08:00:00.000Z',
    updatedAt: '2026-09-14T08:00:00.000Z',
    nextRepetitionAt: '2026-09-14T08:00:00.000Z',
    lastRating: null,
    origin: 'user',
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  };
}

describe('practice answer panel', () => {
  it('labels AI content as a generated suggestion, not fasit', () => {
    const html = renderAnswerPanel(card());
    expect(html).toContain('AI-generert forslag til svar');
    expect(html).toContain('AI-forslag om universell utforming.');
    expect(html).not.toContain('Fasit');
    expect(html).toContain('<strong>Kilde:</strong> Forelesning om universell utforming, lysbilde 14');
    expect(html).toContain('ikke et sitat fra kilden');
  });

  it('shows own formulation as the main answer and keeps AI collapsed', () => {
    const html = renderAnswerPanel(card({
      userAnswer: 'Min egen forklaring.',
      status: 'egen_formulering',
    }));
    expect(html).toContain('<h2>Mitt svar</h2>');
    expect(html).toContain('Min egen forklaring.');
    expect(html).toContain('Se opprinnelig AI-forslag');
    expect(html).toContain('<details class="answer__ai">');
    expect(html.indexOf('Mitt svar')).toBeLessThan(html.indexOf('Se opprinnelig AI-forslag'));
    expect(html).toMatch(/answer__primary">Min egen forklaring\./);
    expect(html).not.toMatch(/answer__primary">AI-forslag om universell utforming/);
  });
});
