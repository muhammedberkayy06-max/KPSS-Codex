import { questionListSchema, Question } from '../types/question';

export type HFClientOptions = {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
};

export type HFError = {
  message: string;
  status?: number;
};

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MODEL = 'meta-llama/Meta-Llama-3-8B-Instruct';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error('Zaman aşımı'));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
};

const extractJsonCandidate = (raw: string): string => {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  return trimmed;
};

const extractJsonBlock = (raw: string): string | null => {
  const text = extractJsonCandidate(raw);
  const firstBrace = text.search(/[\[{]/);
  if (firstBrace === -1) {
    return null;
  }
  const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return text.slice(firstBrace, lastBrace + 1).trim();
};

const parseJsonFromResponse = (raw: string): unknown => {
  const candidate = extractJsonCandidate(raw);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    const block = extractJsonBlock(raw);
    if (block) {
      return JSON.parse(block);
    }
    throw error;
  }
};

export const requestHF = async (
  prompt: string,
  { apiKey, model = DEFAULT_MODEL, timeoutMs = DEFAULT_TIMEOUT }: HFClientOptions
): Promise<Question[]> => {
  const endpoint = `https://api-inference.huggingface.co/models/${model}`;
  const body = JSON.stringify({
    inputs: prompt,
    parameters: {
      max_new_tokens: 1200,
      temperature: 0.7,
      return_full_text: false
    }
  });

  let attempt = 0;
  let lastError: HFError | null = null;

  while (attempt < 3) {
    try {
      const response = await withTimeout(
        fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body
        }),
        timeoutMs
      );

      if (!response.ok) {
        const errorText = await response.text();
        const isRetryable = response.status === 429 || response.status >= 500;
        if (isRetryable) {
          throw { message: errorText || 'Sunucu hatası', status: response.status } satisfies HFError;
        }
        return Promise.reject({ message: errorText || 'İstek başarısız', status: response.status });
      }

      const payload = await response.json();
      const generated = Array.isArray(payload) ? payload[0]?.generated_text : payload?.generated_text;
      if (!generated) {
        return Promise.reject({ message: 'Model çıktısı alınamadı.' });
      }
      const parsed = parseJsonFromResponse(generated);
      const validated = questionListSchema.safeParse(parsed);
      if (!validated.success) {
        return Promise.reject({ message: 'JSON şeması doğrulanamadı.' });
      }
      return validated.data;
    } catch (error) {
      const hfError: HFError =
        typeof error === 'object' && error && 'message' in error
          ? (error as HFError)
          : { message: 'Beklenmeyen hata' };
      lastError = hfError;
      attempt += 1;
      if (attempt < 3) {
        await sleep(500 * 2 ** attempt);
      }
    }
  }

  return Promise.reject(lastError ?? { message: 'İstek başarısız' });
};

export const testApiKey = async (options: HFClientOptions): Promise<void> => {
  const testPrompt = `Sadece JSON döndür. Markdown yok. {"ping":"ok"}`;
  const endpoint = `https://api-inference.huggingface.co/models/${options.model ?? DEFAULT_MODEL}`;
  const response = await withTimeout(
    fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: testPrompt,
        parameters: { max_new_tokens: 20, temperature: 0.2, return_full_text: false }
      })
    }),
    options.timeoutMs ?? DEFAULT_TIMEOUT
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'API anahtarı doğrulanamadı.');
  }
};
