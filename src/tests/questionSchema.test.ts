import { describe, expect, it } from 'vitest';
import { questionSchema } from '../types/question';

const baseQuestion = {
  id: 'uuid',
  examType: 'GK-GY',
  ders: 'Türkçe',
  konu: 'Paragrafta Anlam',
  zorluk: 'orta',
  soru: 'Aşağıdaki paragrafın ana düşüncesi nedir?',
  secenekler: {
    A: 'Seçenek A',
    B: 'Seçenek B',
    C: 'Seçenek C',
    D: 'Seçenek D',
    E: 'Seçenek E'
  },
  dogru: 'A',
  aciklama: 'Doğru cevap A seçeneğidir.'
};

describe('questionSchema', () => {
  it('accepts a valid question payload', () => {
    const result = questionSchema.safeParse(baseQuestion);
    expect(result.success).toBe(true);
  });

  it('rejects invalid answer options', () => {
    const invalid = { ...baseQuestion, dogru: 'F' };
    const result = questionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
