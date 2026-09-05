import { useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Appliance, DiagnosticStep } from '../types';
import { ConfidenceBar } from './ConfidenceBar';

export function DiagnosisFlow({
  appliance,
  symptomId,
  onBack,
}: {
  appliance: Appliance;
  symptomId?: string;
  onBack: () => void;
}) {
  const [step, setStep] = useState<DiagnosticStep | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setBusy(true);
    setError('');
    try {
      setStep(await api.startSession(appliance.id, symptomId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر بدء الجلسة');
    } finally {
      setBusy(false);
    }
  }

  async function answer(nodeAnswerId: string) {
    if (!step) return;
    setBusy(true);
    setError('');
    try {
      setStep(await api.submitAnswer(step.sessionId, nodeAnswerId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إرسال الإجابة');
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!step) return;
    setBusy(true);
    setError('');
    try {
      setStep(await api.simulatePayment(step.sessionId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إتمام الدفع');
    } finally {
      setBusy(false);
    }
  }

  if (busy && !step) return <div className="state-message">جارٍ التحضير...</div>;

  if (error) {
    return (
      <div className="state-message error">
        {error}
        <div style={{ marginTop: 12 }}>
          <button className="secondary-btn" onClick={start}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        ← البدء من جديد
      </button>

      {step.type === 'question' && (
        <div>
          <ConfidenceBar confidenceScore={step.confidenceScore} />
          <h2 className="question-text">{step.questionText}</h2>
          <div className="answer-list">
            {step.answers?.map((a) => (
              <button key={a.id} className="answer-btn" disabled={busy} onClick={() => answer(a.id)}>
                {a.answerText}
              </button>
            ))}
          </div>
          {busy && <div className="state-message">جارٍ التحميل...</div>}
        </div>
      )}

      {step.type === 'paywall' && (
        <div className="paywall">
          <ConfidenceBar confidenceScore={step.confidenceScore} />
          <div className="paywall-icon">🔒</div>
          <p className="paywall-message">{step.message}</p>
          <button className="primary-btn full-width" disabled={busy} onClick={pay}>
            {busy ? 'جارٍ المعالجة...' : 'الدفع الآن (20 ريال سعودي)'}
          </button>
          <p className="muted small">وضع تجريبي: لا تُخصم أي مبالغ فعلية حالياً</p>
        </div>
      )}

      {step.type === 'diagnosis' && (
        <div className="diagnosis-result">
          <p className="success-badge">✓ التشخيص الكامل</p>
          <h2>{step.diagnosisTitle}</h2>
          <span className={`severity-badge severity-${severityClass(step.severityLevel)}`}>
            مستوى الخطورة: {step.severityLevel}
          </span>
          <h3>السبب الجذري</h3>
          <p>{step.rootCause}</p>
          <h3>قطع الغيار المطلوبة</h3>
          <div className="parts-list">
            {step.parts?.map((p) => (
              <div key={p.sku} className="part-card">
                <div>
                  <div className="part-name">{p.name}</div>
                  <div className="muted small">
                    {p.sku} · {p.price} ريال · {p.isRequired ? 'مطلوبة' : 'اختيارية'}
                  </div>
                </div>
                <a className="primary-btn" href={p.storeUrl} target="_blank" rel="noreferrer">
                  شراء
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function severityClass(level?: string): string {
  switch (level) {
    case 'حرج':
      return 'critical';
    case 'عالٍ':
      return 'high';
    case 'متوسط':
      return 'medium';
    default:
      return 'low';
  }
}
