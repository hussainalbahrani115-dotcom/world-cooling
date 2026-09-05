// طبقة رفيعة فوق fetch لكل نداءات /admin/*: تُرفق ترويسة x-admin-token المخزَّنة محلياً،
// وتحوّل استجابات الخطأ إلى استثناء برسالة عربية واضحة تعرضها الواجهة مباشرة.

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'admin-token';

export function getStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // localStorage غير متاح (وضع خاص مثلاً) — الرمز سيُطلب مجدداً في كل جلسة متصفح.
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': getStoredToken(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `خطأ غير متوقع (${response.status})`;
    try {
      const body = await response.json();
      message = Array.isArray(body.message) ? body.message.join('، ') : body.message ?? message;
    } catch {
      // تجاهل: الاستجابة ليست JSON
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
