import { describe, expect, it } from 'vitest';
import { isSimilar, jaccardSimilarity } from '../lib/similarity';

describe('similarity', () => {
  it('treats identical strings as highly similar', () => {
    expect(jaccardSimilarity('test soru', 'test soru')).toBeGreaterThan(0.9);
  });

  it('detects near-duplicate content', () => {
    const a = 'Paragrafın ana düşüncesi nedir?';
    const b = 'Paragrafın temel düşüncesi hangisidir?';
    expect(isSimilar(a, b, 0.3)).toBe(true);
  });

  it('keeps unrelated strings apart', () => {
    const a = 'Türkiye fiziki coğrafyası hangi bölgeyi kapsar?';
    const b = 'Anayasanın değiştirilmesi için gereken çoğunluk nedir?';
    expect(isSimilar(a, b)).toBe(false);
  });
});
