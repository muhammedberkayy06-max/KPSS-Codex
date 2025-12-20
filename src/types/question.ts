import { z } from 'zod';

export const examTypeValues = ['GK-GY', 'A-GRUBU'] as const;
export type ExamType = (typeof examTypeValues)[number];

export const difficultyValues = ['kolay', 'orta', 'zor'] as const;
export type Difficulty = (typeof difficultyValues)[number];

export const answerValues = ['A', 'B', 'C', 'D', 'E'] as const;
export type AnswerOption = (typeof answerValues)[number];

export type Question = {
  id: string;
  examType: ExamType;
  ders: string;
  konu: string;
  zorluk: Difficulty;
  soru: string;
  secenekler: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  dogru: AnswerOption;
  aciklama: string;
  adimAdimCozum?: string;
  uretimNotu?: string;
};

export const questionSchema = z.object({
  id: z.string(),
  examType: z.enum(examTypeValues),
  ders: z.string(),
  konu: z.string(),
  zorluk: z.enum(difficultyValues),
  soru: z.string(),
  secenekler: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
    E: z.string()
  }),
  dogru: z.enum(answerValues),
  aciklama: z.string(),
  adimAdimCozum: z.string().optional(),
  uretimNotu: z.string().optional()
});

export const questionListSchema = z.array(questionSchema);
