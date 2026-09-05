// عميل بسيط لواجهات /catalog و/diagnostics العامة — لا يحتاج أي مصادقة (على عكس
// admin-web الذي يتطلب x-admin-token). هذا هو الموقع الذي يفتحه الزبون مباشرة.

import { Appliance, DiagnosticStep, Symptom } from './types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

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
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!response.ok) {
    let message = `تعذّر الاتصال بالخادم (${response.status})`;
    try {
      const body = await response.json();
      message = Array.isArray(body.message) ? body.message.join('، ') : (body.message ?? message);
    } catch {
      // تجاهل: الاستجابة ليست JSON
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getAppliances: () => request<Appliance[]>('/catalog/appliances'),
  getSymptoms: (applianceId: string) => request<Symptom[]>(`/catalog/appliances/${applianceId}/symptoms`),

  startSession: (applianceId: string, symptomId?: string) =>
    request<DiagnosticStep>('/diagnostics/sessions', {
      method: 'POST',
      body: JSON.stringify({ applianceId, symptomId }),
    }),

  submitAnswer: (sessionId: string, nodeAnswerId: string) =>
    request<DiagnosticStep>(`/diagnostics/sessions/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ nodeAnswerId }),
    }),

  // ⚠️ يستدعي نقطة النهاية المؤقتة simulate-payment (راجع backend/src/diagnostics) —
  // ستُستبدل بتدفق دفع حقيقي عبر HyperPay/Moyasar في Phase 4 عند الاقتراب من الإطلاق.
  simulatePayment: (sessionId: string) =>
    request<DiagnosticStep>(`/diagnostics/sessions/${sessionId}/simulate-payment`, { method: 'POST' }),
};
