import { useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { ReportByAppliance, ReportOverview } from '../types';

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function ReportsPage() {
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [byAppliance, setByAppliance] = useState<ReportByAppliance[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const [ov, ba] = await Promise.all([
        api.get<ReportOverview>('/admin/reports/overview'),
        api.get<ReportByAppliance[]>('/admin/reports/by-appliance'),
      ]);
      setOverview(ov);
      setByAppliance(ba);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذّر تحميل التقارير');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <section className="card">
      <div className="node-card-header">
        <h2>تقارير الأداء</h2>
        <button onClick={reload}>تحديث</button>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading || !overview ? (
        <p>جارٍ التحميل...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-tile">
              <div className="stat-value">{overview.totalSessions}</div>
              <div className="stat-label">إجمالي الجلسات</div>
            </div>
            <div className="stat-tile">
              <div className="stat-value">{overview.reachedDiagnosisGate}</div>
              <div className="stat-label">وصلت لبوابة التشخيص</div>
            </div>
            <div className="stat-tile">
              <div className="stat-value">{overview.paidSessions}</div>
              <div className="stat-label">جلسات مدفوعة</div>
            </div>
            <div className="stat-tile">
              <div className="stat-value">{pct(overview.diagnosisReachRate)}</div>
              <div className="stat-label">نسبة نجاح التشخيص</div>
            </div>
            <div className="stat-tile">
              <div className="stat-value">{pct(overview.paymentConversionRate)}</div>
              <div className="stat-label">نسبة التحويل للدفع</div>
            </div>
          </div>

          <h3>التفصيل حسب الجهاز</h3>
          <table>
            <thead>
              <tr>
                <th>الجهاز</th>
                <th>الجلسات</th>
                <th>وصلت للبوابة</th>
                <th>مدفوعة</th>
                <th>نسبة النجاح</th>
                <th>نسبة التحويل</th>
              </tr>
            </thead>
            <tbody>
              {byAppliance.map((row) => (
                <tr key={row.applianceId}>
                  <td>{row.applianceName}</td>
                  <td>{row.totalSessions}</td>
                  <td>{row.reachedDiagnosisGate}</td>
                  <td>{row.paidSessions}</td>
                  <td>{pct(row.diagnosisReachRate)}</td>
                  <td>{pct(row.paymentConversionRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
