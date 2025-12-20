export const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const trigrams = (text: string): Set<string> => {
  const normalized = `  ${normalizeText(text)}  `;
  const set = new Set<string>();
  for (let i = 0; i < normalized.length - 2; i += 1) {
    set.add(normalized.slice(i, i + 3));
  }
  return set;
};

export const jaccardSimilarity = (a: string, b: string): number => {
  const setA = trigrams(a);
  const setB = trigrams(b);
  if (setA.size === 0 && setB.size === 0) {
    return 1;
  }
  let intersection = 0;
  setA.forEach((value) => {
    if (setB.has(value)) {
      intersection += 1;
    }
  });
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

export const isSimilar = (a: string, b: string, threshold = 0.72): boolean =>
  jaccardSimilarity(a, b) >= threshold;
