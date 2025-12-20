import { v4 as uuidv4 } from 'uuid';
import { requestHF } from './huggingfaceClient';
import { aGrubuCourses, gkGyCourses } from './syllabus';
import { normalizeText, isSimilar } from './similarity';
import { Difficulty, Question, ExamType } from '../types/question';

export type GeneratorOptions = {
  apiKey: string;
  model: string;
  difficultyDistribution: Record<Difficulty, number>;
  gkGyWeights: Record<string, Record<string, number>>;
  onProgress?: (progress: number, message: string) => void;
};

const createSignature = (question: Question): string =>
  normalizeText(`${question.soru}|${question.dogru}|${question.konu}`);

const weightedPick = (topics: { topic: string; weight: number }[]): string => {
  const total = topics.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const topic of topics) {
    roll -= topic.weight;
    if (roll <= 0) {
      return topic.topic;
    }
  }
  return topics[topics.length - 1].topic;
};

const buildPrompt = (
  examType: ExamType,
  ders: string,
  konu: string,
  zorluk: Difficulty,
  count: number
): string => {
  const baseRules = [
    'Sadece JSON döndür, markdown yok.',
    'JSON şemasına %100 uy.',
    'KPSS formatında 5 şıklı soru üret.',
    'Gerçek sınav benzeri, yanıltıcı çeldiriciler ve net doğru içersin.',
    'Güncel zaman bağımlı ifadelerden kaçın; tarihli iddia verme.',
    'Aciklama alanı mutlaka dolu olsun.'
  ];

  const mathRule = ders.toLowerCase().includes('matematik')
    ? 'adimAdimCozum alanı zorunlu ve adımlı olsun.'
    : 'adimAdimCozum alanını sadece matematik için kullan.';

  return `${baseRules.join(' ')} ${mathRule}

JSON şeması:
[
  {
    "id": "uuid",
    "examType": "${examType}",
    "ders": "${ders}",
    "konu": "${konu}",
    "zorluk": "${zorluk}",
    "soru": "...",
    "secenekler": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
    "dogru": "A",
    "aciklama": "...",
    "adimAdimCozum": "...",
    "uretimNotu": "..."
  }
]

Şimdi ${count} soru üret.`;
};

const allocateDifficulty = (distribution: Record<Difficulty, number>, count: number): Difficulty[] => {
  const total = distribution.kolay + distribution.orta + distribution.zor;
  const hedef = {
    kolay: Math.round((distribution.kolay / total) * count),
    orta: Math.round((distribution.orta / total) * count),
    zor: Math.max(0, count)
  };
  hedef.zor = Math.max(0, count - hedef.kolay - hedef.orta);
  const list: Difficulty[] = [];
  list.push(...Array(hedef.kolay).fill('kolay'));
  list.push(...Array(hedef.orta).fill('orta'));
  list.push(...Array(hedef.zor).fill('zor'));
  return list;
};

const ensureUnique = (items: Question[], pool: Question[]): Question[] => {
  const signatures = new Set(pool.map(createSignature));
  const unique: Question[] = [];
  for (const item of items) {
    const signature = createSignature(item);
    if (signatures.has(signature)) {
      continue;
    }
    const isNearDuplicate = pool.some((existing) =>
      isSimilar(normalizeText(existing.soru), normalizeText(item.soru))
    );
    if (isNearDuplicate) {
      continue;
    }
    signatures.add(signature);
    unique.push(item);
  }
  return unique;
};

const hydrateIds = (questions: Question[]): Question[] =>
  questions.map((question) => ({
    ...question,
    id: question.id && question.id !== 'uuid' ? question.id : uuidv4()
  }));

const generateForCourse = async (
  examType: ExamType,
  ders: string,
  topicPool: { topic: string; weight: number }[],
  count: number,
  options: GeneratorOptions,
  progressOffset: number,
  total: number,
  globalPool: Question[]
): Promise<Question[]> => {
  const result: Question[] = [];
  const difficulties = allocateDifficulty(options.difficultyDistribution, count);
  let index = 0;

  while (result.length < count) {
    const remaining = count - result.length;
    const batchSize = Math.min(5, remaining);
    const zorluk = difficulties[index % difficulties.length];
    const konu = weightedPick(topicPool);

    options.onProgress?.(
      Math.round(((progressOffset + result.length) / total) * 100),
      `${ders} için soru üretiliyor...`
    );

    const prompt = buildPrompt(examType, ders, konu, zorluk, batchSize);
    const batch = await requestHF(prompt, {
      apiKey: options.apiKey,
      model: options.model
    });

    const hydrated = hydrateIds(batch.map((question) => ({ ...question, ders, konu, examType, zorluk })));
    const unique = ensureUnique(hydrated, [...globalPool, ...result]);
    result.push(...unique);
    index += 1;
  }

  return result.slice(0, count);
};

export const generateExam = async (
  examType: ExamType,
  options: GeneratorOptions
): Promise<Question[]> => {
  const total = examType === 'GK-GY' ? 120 : 200;
  const collection: Question[] = [];

  if (examType === 'GK-GY') {
    const courseCounts: Record<string, number> = {
      Türkçe: 30,
      Matematik: 30,
      Tarih: 27,
      Coğrafya: 18,
      Vatandaşlık: 15
    };

    let progressOffset = 0;
    for (const course of gkGyCourses) {
      const overrideWeights = options.gkGyWeights[course.ders];
      const topics = course.topics.map((topic) => ({
        topic: topic.topic,
        weight: overrideWeights?.[topic.topic] ?? topic.weight
      }));
      const count = courseCounts[course.ders] ?? Math.floor(total / gkGyCourses.length);
      const questions = await generateForCourse(
        examType,
        course.ders,
        topics,
        count,
        options,
        progressOffset,
        total,
        collection
      );
      collection.push(...questions);
      progressOffset += count;
    }
  } else {
    const perCourse = 40;
    let progressOffset = 0;
    for (const course of aGrubuCourses) {
      const questions = await generateForCourse(
        examType,
        course.ders,
        course.topics,
        perCourse,
        options,
        progressOffset,
        total,
        collection
      );
      collection.push(...questions);
      progressOffset += perCourse;
    }
  }

  options.onProgress?.(100, 'Sorular hazır.');
  return collection.slice(0, total);
};
