import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(import.meta.dirname, '../src/styles.css'), 'utf8');
const html = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8');

describe('mobile and desktop layout CSS', () => {
  it('tightens layout at 320–430 px and keeps touch-sized actions', () => {
    expect(css).toContain('@media (max-width: 430px)');
    expect(css).toContain('min-height: max(var(--touch), 44px)');
    expect(css).toContain('overflow-wrap: break-word');
    expect(css).toContain('safe-area-inset');
    expect(css).toContain('.help-dialog');
    expect(css).toContain('.help-toc');
    expect(css).toContain('flex-direction: column');
    expect(html).toContain('viewport-fit=cover');
  });

  it('keeps desktop navigation and study card width', () => {
    expect(css).toContain('@media (min-width: 721px)');
    expect(css).toContain('.nav-toggle');
    expect(css).toContain('max-width: 40rem');
    expect(css).toContain('flex-direction: row');
  });

  it('marks AI status with icon container and dashed border, not color alone', () => {
    expect(css).toContain('border-style: dashed');
    expect(css).toContain('.status-badge--ai_utkast');
    expect(css).toContain('.status-badge__icon');
  });

  it('uses a compact practice surface in short landscape viewports', () => {
    expect(css).toContain('(orientation: landscape) and (max-height: 540px) and (max-width: 1100px)');
    expect(css).toContain('body.is-practice .site-header');
    expect(css).toContain('display: none');
    expect(css).toContain('.study-board');
    expect(css).toContain('grid-template-columns: minmax(0, 1.35fr) minmax(13.25rem, 0.85fr)');
    expect(css).toContain('safe-area-inset-left');
    expect(css).toContain('100svh');
  });
});
