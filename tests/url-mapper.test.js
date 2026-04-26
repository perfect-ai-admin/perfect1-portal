import { describe, it, expect } from 'vitest';
import {
  isValidCategory,
  slugFromPath,
  fileToUrl,
  categorySlugToUrl,
} from '../lib/url-mapper.cjs';

describe('url-mapper', () => {
  it('valid category recognized; invalid rejected', () => {
    expect(isValidCategory('osek-patur')).toBe(true);
    expect(isValidCategory('hevra-bam')).toBe(true);
    expect(isValidCategory('not-a-real-cat')).toBe(false);
  });

  it('slugFromPath parses standard content path', () => {
    const result = slugFromPath('src/content/osek-patur/how-to-open.json');
    expect(result).toEqual({ category: 'osek-patur', slug: 'how-to-open' });
  });

  it('fileToUrl maps comparisons category to /compare prefix (not /comparisons)', () => {
    const url = fileToUrl('src/content/comparisons/osek-patur-vs-murshe.json');
    expect(url).toBe('https://www.perfect1.co.il/compare/osek-patur-vs-murshe');
  });

  it('fileToUrl returns null for unknown category', () => {
    expect(fileToUrl('src/content/unknown-cat/foo.json')).toBeNull();
  });

  it('categorySlugToUrl forms correct URL for known category', () => {
    expect(categorySlugToUrl('osek-murshe', 'cost')).toBe('https://www.perfect1.co.il/osek-murshe/cost');
  });

  it('categorySlugToUrl returns null for invalid category', () => {
    expect(categorySlugToUrl('not-real', 'foo')).toBeNull();
  });
});
