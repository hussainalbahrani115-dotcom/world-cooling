import { useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Appliance, Symptom } from '../types';

export function SymptomSelector({
  appliance,
  onSelect,
  onBack,
}: {
  appliance: Appliance;
  onSelect: (symptomId?: string) => void;
  onBack: () => void;
}) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getSymptoms(appliance.id)
      .then(setSymptoms)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'تعذّر تحميل الأعراض'))
      .finally(() => setLoading(false));
  }, [appliance.id]);

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        ← رجوع لاختيار الجهاز
      </button>
      <h2>ما العرض الأقرب لمشكلتك في {appliance.nameAr}؟</h2>
      <p className="muted">اختياري — يمكنك تخطّي هذه الخطوة والبدء بالأسئلة مباشرة</p>

      {loading && <div className="state-message">جارٍ التحميل...</div>}
      {error && <div className="state-message error">{error}</div>}

      {!loading && !error && (
        <div className="card-grid">
          {symptoms.map((s) => (
            <button key={s.id} className="select-card" onClick={() => onSelect(s.id)}>
              <span className="select-card-title">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      <button className="secondary-btn full-width" onClick={() => onSelect(undefined)}>
        لا يوجد عرض مطابق — ابدأ التشخيص مباشرة
      </button>
    </div>
  );
}
