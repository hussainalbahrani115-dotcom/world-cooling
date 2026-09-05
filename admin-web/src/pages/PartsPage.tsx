import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Part } from '../types';

const STOCK_STATUSES = ['available', 'low_stock', 'out_of_stock'];

export function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [stockStatus, setStockStatus] = useState(STOCK_STATUSES[0]);

  async function reload() {
    setLoading(true);
    try {
      setParts(await api.get<Part[]>('/admin/parts'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر تحميل قطع الغيار');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !storeUrl.trim() || !price) return;
    try {
      await api.post('/admin/parts', { name, sku, price: Number(price), storeUrl, stockStatus });
      setName('');
      setSku('');
      setPrice('');
      setStoreUrl('');
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر إضافة القطعة');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذه القطعة؟')) return;
    try {
      await api.delete(`/admin/parts/${id}`);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر حذف القطعة');
    }
  }

  return (
    <section className="card">
      <h2>قطع الغيار</h2>
      {error && <div className="error-banner">{error}</div>}

      <form className="inline-form" onSubmit={handleCreate}>
        <input placeholder="اسم القطعة" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <input placeholder="السعر" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input placeholder="رابط المتجر" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
        <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
          {STOCK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit">إضافة قطعة</button>
      </form>

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>SKU</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.price}</td>
                <td>{p.stockStatus}</td>
                <td>
                  <button className="danger-btn" onClick={() => handleDelete(p.id)}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {parts.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  لا توجد قطع غيار بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
