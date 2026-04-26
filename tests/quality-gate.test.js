import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { QUALITY_THRESHOLD, MIN_WORD_COUNT } = require('../config/site.config.cjs');

/**
 * Pure quality-gate logic mirrored from F33's spec.
 * Kept here so we can test it without depending on n8n internals.
 *
 * Gate rules (per CLAUDE.md + F33 logic):
 *   - score >= QUALITY_THRESHOLD (currently 85)
 *   - wordCount >= MIN_WORD_COUNT (currently 1200)
 *   - faq present (>=3 items)
 *   - author === expected ("הצוות המקצועי של פרפקט וואן" or whitelisted)
 */
const ALLOWED_AUTHORS = new Set([
  'הצוות המקצועי של פרפקט וואן',
  'פרפקט וואן',
]);

export function evaluateGate(article) {
  const reasons = [];
  if ((article.score ?? 0) < QUALITY_THRESHOLD) reasons.push('score-too-low');
  if ((article.wordCount ?? 0) < MIN_WORD_COUNT) reasons.push('word-count-too-low');
  if (!Array.isArray(article.faq) || article.faq.length < 3) reasons.push('missing-faq');
  if (!article.author || !ALLOWED_AUTHORS.has(article.author)) reasons.push('wrong-author');
  return { passed: reasons.length === 0, reasons };
}

describe('quality gate', () => {
  const ok = {
    score: 90,
    wordCount: 1500,
    faq: [{ q: 'a' }, { q: 'b' }, { q: 'c' }],
    author: 'הצוות המקצועי של פרפקט וואן',
  };

  it('passes when all checks ok', () => {
    expect(evaluateGate(ok)).toEqual({ passed: true, reasons: [] });
  });

  it('fails when word count below MIN_WORD_COUNT', () => {
    const r = evaluateGate({ ...ok, wordCount: 800 });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('word-count-too-low');
  });

  it('fails when faq missing or too short', () => {
    const r1 = evaluateGate({ ...ok, faq: [] });
    expect(r1.passed).toBe(false);
    expect(r1.reasons).toContain('missing-faq');

    const r2 = evaluateGate({ ...ok, faq: [{ q: 'only-one' }] });
    expect(r2.reasons).toContain('missing-faq');
  });

  it('fails when author not in allowlist', () => {
    const r = evaluateGate({ ...ok, author: 'Some Random Author' });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('wrong-author');
  });

  it('fails when score below threshold', () => {
    const r = evaluateGate({ ...ok, score: 70 });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('score-too-low');
  });
});
