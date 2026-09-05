import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError, getStoredToken, setStoredToken } from './api';
import { AppliancesPage } from './pages/AppliancesPage';
import { PartsPage } from './pages/PartsPage';
import { TreePage } from './pages/TreePage';
import { ReportsPage } from './pages/ReportsPage';

type Tab = 'appliances' | 'parts' | 'tree' | 'reports';

const TABS: { id: Tab; label: string }[] = [
  { id: 'appliances', label: 'الأجهزة والأعراض' },
  { id: 'tree', label: 'شجرة القرار' },
  { id: 'parts', label: 'قطع الغيار' },
  { id: 'reports', label: 'التقارير' },
];

function App() {
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('appliances');

  useEffect(() => {
    verifyToken();
  }, []);

  async function verifyToken() {
    if (!getStoredToken()) {
      setTokenVerified(false);
      return;
    }
    try {
      await api.get('/admin/appliances');
      setTokenVerified(true);
    } catch {
      setTokenVerified(false);
    }
  }

  if (tokenVerified === null) {
    return <p>جارٍ التحقق...</p>;
  }

  if (!tokenVerified) {
    return <TokenGate onVerified={() => setTokenVerified(true)} />;
  }

  return (
    <main>
      <header className="app-header">
        <h1>لوحة تحكم الفني الذكي</h1>
        <button className="link-btn" onClick={() => { setStoredToken(''); setTokenVerified(false); }}>
          تسجيل خروج
        </button>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'tab active' : 'tab'} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'appliances' && <AppliancesPage />}
      {tab === 'tree' && <TreePage />}
      {tab === 'parts' && <PartsPage />}
      {tab === 'reports' && <ReportsPage />}
    </main>
  );
}

function TokenGate({ onVerified }: { onVerified: () => void }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError('');
    setStoredToken(token);
    try {
      await api.get('/admin/appliances');
      onVerified();
    } catch (e) {
      setStoredToken('');
      setError(e instanceof ApiError && e.status === 401 ? 'رمز الدخول غير صحيح' : 'تعذّر الاتصال بالخادم');
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="token-gate">
      <h1>لوحة تحكم الفني الذكي</h1>
      <p className="muted">أدخل رمز دخول الإدارة (ADMIN_API_TOKEN) للمتابعة.</p>
      <form onSubmit={handleSubmit} className="inline-form">
        <input
          type="password"
          placeholder="رمز الدخول"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={checking || !token}>
          {checking ? 'جارٍ التحقق...' : 'دخول'}
        </button>
      </form>
      {error && <div className="error-banner">{error}</div>}
    </main>
  );
}

export default App;
