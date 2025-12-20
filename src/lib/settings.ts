import { gkGyWeights } from './syllabus';

export type DifficultyDistribution = {
  kolay: number;
  orta: number;
  zor: number;
};

export type WeightMap = Record<string, Record<string, number>>;

export type AppSettings = {
  apiKey: string | null;
  model: string;
  difficulty: DifficultyDistribution;
  gkGyWeightOverrides: WeightMap;
};

const SETTINGS_KEY = 'kpss-settings';

export const defaultSettings: AppSettings = {
  apiKey: null,
  model: 'meta-llama/Meta-Llama-3-8B-Instruct',
  difficulty: {
    kolay: 25,
    orta: 55,
    zor: 20
  },
  gkGyWeightOverrides: Object.fromEntries(
    Object.entries(gkGyWeights).map(([ders, topics]) => [
      ders,
      Object.fromEntries(topics.map((topic) => [topic.topic, topic.weight]))
    ])
  )
};

export const loadSettings = (): AppSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return defaultSettings;
  }
  try {
    const parsed = JSON.parse(raw) as AppSettings;
    return {
      ...defaultSettings,
      ...parsed,
      difficulty: {
        ...defaultSettings.difficulty,
        ...parsed.difficulty
      },
      gkGyWeightOverrides: {
        ...defaultSettings.gkGyWeightOverrides,
        ...parsed.gkGyWeightOverrides
      }
    };
  } catch (error) {
    console.error('Ayarlar okunamadı', error);
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const clearSettings = (): void => {
  localStorage.removeItem(SETTINGS_KEY);
};
