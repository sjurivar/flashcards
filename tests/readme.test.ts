import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FULLSCREEN_HELP } from '@features/practice-session';

const readme = readFileSync(resolve(import.meta.dirname, '../README.md'), 'utf8');

describe('README', () => {
  it('mentions responsive practice, local storage and transfer without replacing in-app help', () => {
    expect(readme).toContain('responsiv');
    expect(readme).toContain('liggende');
    expect(readme).toContain('IndexedDB');
    expect(readme).toContain('Eksporter data');
    expect(readme).toContain('offline');
    expect(readme).toContain('Hjelp');
    if (FULLSCREEN_HELP.available) {
      expect(readme).toContain('Fullskjerm');
    } else {
      expect(readme).not.toContain('Fullskjerm');
    }
  });
});
