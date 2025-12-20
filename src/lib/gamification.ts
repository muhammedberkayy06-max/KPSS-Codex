const GAMIFICATION_KEY = 'kpss-gamification';

export type GamificationState = {
  lastDate: string | null;
  streak: number;
  points: number;
  level: number;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

export const loadGamification = (): GamificationState => {
  const raw = localStorage.getItem(GAMIFICATION_KEY);
  if (!raw) {
    return { lastDate: null, streak: 0, points: 0, level: 1 };
  }
  try {
    return JSON.parse(raw) as GamificationState;
  } catch {
    return { lastDate: null, streak: 0, points: 0, level: 1 };
  }
};

export const updateGamification = (correctCount: number, total: number): GamificationState => {
  const state = loadGamification();
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let streak = state.streak;
  if (state.lastDate === yesterday) {
    streak += 1;
  } else if (state.lastDate !== today) {
    streak = 1;
  }

  const earnedPoints = Math.round((correctCount / Math.max(total, 1)) * 100);
  const points = state.points + earnedPoints;
  const level = Math.max(1, Math.floor(points / 500) + 1);

  const nextState = { lastDate: today, streak, points, level };
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(nextState));
  return nextState;
};

export const getMotivation = (streak: number): string => {
  if (streak >= 5) {
    return 'Harika gidiyorsun! Ritmini koru ve bugün küçük bir tekrar ekle.';
  }
  if (streak >= 3) {
    return 'İstikrarlı ilerliyorsun. Bugün zayıf konulardan 20 dakika ayır.';
  }
  return 'Bugün kısa bir tekrar bile büyük fark yaratır. Başlamak için 15 dakika ayır.';
};
