export type AnalysisResult = {
  disease: string;
  crop: string;
  confidence: string;
  suggestion: string;
};

const ANALYZE_TIMEOUT_MS = 60_000; // 60 seconds – model load on first request can be slow

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const fd = new FormData();
  fd.append('image', file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch('/api/v1/analyze', {
      method: 'POST',
      body: fd,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. The backend may still be loading the model — please try again in a moment.');
    }
    throw new Error(err?.message ?? 'Network error. Is the backend running on :3000?');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      /* fall through */
    }
    throw new Error(message);
  }

  return res.json();
}

export function confidenceToNumber(confidence: string): number {
  const n = parseFloat(confidence.replace('%', ''));
  return Number.isFinite(n) ? n : 0;
}
