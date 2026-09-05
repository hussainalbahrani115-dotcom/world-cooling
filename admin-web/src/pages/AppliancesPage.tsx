import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Appliance, Subsystem, Symptom } from '../types';

const CATEGORIES = ['تكييف', 'ثلاجات', 'أفران'];

export function AppliancesPage() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  async function reload() {
    setLoading(true);
    try {
      const data = await api.get<Appliance[]>('/admin/appliances');
      setAppliances(data);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر تحميل الأجهزة');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newNameAr.trim() || !newNameEn.trim()) return;
    try {
      await api.post('/admin/appliances', { nameAr: newNameAr, nameEn: newNameEn, category: newCategory });
      setNewNameAr('');
      setNewNameEn('');
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إضافة الجهاز');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا الجهاز؟')) return;
    try {
      await api.delete(`/admin/appliances/${id}`);
      if (selectedId === id) setSelectedId(null);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حذف الجهاز');
    }
  }

  return (
    <div className="page-grid">
      <section className="card">
        <h2>الأجهزة</h2>
        {error && <div className="error-banner">{error}</div>}

        <form className="inline-form" onSubmit={handleCreate}>
          <input placeholder="الاسم بالعربي" value={newNameAr} onChange={(e) => setNewNameAr(e.target.value)} />
          <input placeholder="الاسم بالإنجليزي" value={newNameEn} onChange={(e) => setNewNameEn(e.target.value)} />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="submit">إضافة جهاز</button>
        </form>

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>التصنيف</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appliances.map((a) => (
                <tr key={a.id} className={a.id === selectedId ? 'selected-row' : ''}>
                  <td>
                    <button className="link-btn" onClick={() => setSelectedId(a.id)}>
                      {a.nameAr} <span className="muted">({a.nameEn})</span>
                    </button>
                  </td>
                  <td>{a.category}</td>
                  <td>
                    <button className="danger-btn" onClick={() => handleDelete(a.id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {selectedId && <ApplianceDetail applianceId={selectedId} onChanged={reload} />}
    </div>
  );
}

function ApplianceDetail({ applianceId, onChanged }: { applianceId: string; onChanged: () => void }) {
  const [subsystems, setSubsystems] = useState<Subsystem[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [error, setError] = useState('');

  const [newSubAr, setNewSubAr] = useState('');
  const [newSubEn, setNewSubEn] = useState('');
  const [newSymptomTitle, setNewSymptomTitle] = useState('');
  const [newSymptomSubsystem, setNewSymptomSubsystem] = useState('');

  async function reload() {
    try {
      const [subs, syms] = await Promise.all([
        api.get<Subsystem[]>(`/admin/appliances/${applianceId}/subsystems`),
        api.get<Symptom[]>(`/admin/appliances/${applianceId}/symptoms`),
      ]);
      setSubsystems(subs);
      setSymptoms(syms);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر تحميل تفاصيل الجهاز');
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applianceId]);

  async function addSubsystem(e: FormEvent) {
    e.preventDefault();
    if (!newSubAr.trim() || !newSubEn.trim()) return;
    try {
      await api.post(`/admin/appliances/${applianceId}/subsystems`, { nameAr: newSubAr, nameEn: newSubEn });
      setNewSubAr('');
      setNewSubEn('');
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إضافة النظام الفرعي');
    }
  }

  async function removeSubsystem(id: string) {
    if (!confirm('حذف هذا النظام الفرعي؟')) return;
    try {
      await api.delete(`/admin/subsystems/${id}`);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حذف النظام الفرعي');
    }
  }

  async function addSymptom(e: FormEvent) {
    e.preventDefault();
    if (!newSymptomTitle.trim()) return;
    try {
      await api.post(`/admin/appliances/${applianceId}/symptoms`, {
        title: newSymptomTitle,
        subsystemId: newSymptomSubsystem || undefined,
      });
      setNewSymptomTitle('');
      await reload();
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إضافة العرض');
    }
  }

  async function removeSymptom(id: string) {
    if (!confirm('حذف هذا العرض؟')) return;
    try {
      await api.delete(`/admin/symptoms/${id}`);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حذف العرض');
    }
  }

  return (
    <section className="card">
      <h2>الأنظمة الفرعية والأعراض</h2>
      {error && <div className="error-banner">{error}</div>}

      <h3>الأنظمة الفرعية</h3>
      <form className="inline-form" onSubmit={addSubsystem}>
        <input placeholder="الاسم بالعربي" value={newSubAr} onChange={(e) => setNewSubAr(e.target.value)} />
        <input placeholder="الاسم بالإنجليزي" value={newSubEn} onChange={(e) => setNewSubEn(e.target.value)} />
        <button type="submit">إضافة</button>
      </form>
      <ul className="chip-list">
        {subsystems.map((s) => (
          <li key={s.id} className="chip">
            {s.nameAr}
            <button className="chip-remove" onClick={() => removeSubsystem(s.id)}>
              ×
            </button>
          </li>
        ))}
        {subsystems.length === 0 && <li className="muted">لا توجد أنظمة فرعية بعد</li>}
      </ul>

      <h3>الأعراض الشائعة</h3>
      <form className="inline-form" onSubmit={addSymptom}>
        <input placeholder="نص العرض" value={newSymptomTitle} onChange={(e) => setNewSymptomTitle(e.target.value)} />
        <select value={newSymptomSubsystem} onChange={(e) => setNewSymptomSubsystem(e.target.value)}>
          <option value="">(بدون نظام فرعي)</option>
          {subsystems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameAr}
            </option>
          ))}
        </select>
        <button type="submit">إضافة</button>
      </form>
      <ul className="chip-list">
        {symptoms.map((s) => (
          <li key={s.id} className="chip">
            {s.title}
            <button className="chip-remove" onClick={() => removeSymptom(s.id)}>
              ×
            </button>
          </li>
        ))}
        {symptoms.length === 0 && <li className="muted">لا توجد أعراض بعد</li>}
      </ul>
    </section>
  );
}
