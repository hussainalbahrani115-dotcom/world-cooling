import { useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Appliance } from '../types';

export function ApplianceSelector({ onSelect }: { onSelect: (appliance: Appliance) => void }) {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAppliances()
      .then(setAppliances)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'تعذّر الاتصال بالخادم'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="state-message">جارٍ التحميل...</div>;
  if (error) return <div className="state-message error">{error}</div>;

  const byCategory = new Map<string, Appliance[]>();
  for (const a of appliances) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }

  return (
    <div>
      <h2>ما نوع الجهاز الذي تواجه به مشكلة؟</h2>
      {[...byCategory.entries()].map(([category, items]) => (
        <section key={category} className="category-section">
          <h3>{category}</h3>
          <div className="card-grid">
            {items.map((appliance) => (
              <button key={appliance.id} className="select-card" onClick={() => onSelect(appliance)}>
                <span className="select-card-title">{appliance.nameAr}</span>
                <span className="select-card-subtitle">{appliance.nameEn}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
