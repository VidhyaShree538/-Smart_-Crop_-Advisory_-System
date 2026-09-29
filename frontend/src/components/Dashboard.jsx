import { useState, useEffect } from 'react';
import { BarChart2, RefreshCw, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { translations, cropIcons, API_BASE } from '../translations';

export default function Dashboard({ lang }) {
  const t = translations[lang];
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [hRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/history`),
        fetch(`${API_BASE}/trends`)
      ]);
      const hData = await hRes.json();
      const tData = await tRes.json();
      if (hData.success) setHistory(hData.data);
      if (tData.success) {
        // Format timestamp for chart display
        setTrends(tData.data.map(r => ({
          ...r,
          date: new Date(r.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        })));
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const formatDate = (ts) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-sky-600 to-blue-500 text-white border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 size={32} className="text-sky-200" />
            <div>
              <h1 className="text-xl font-bold">{t.dash_title}</h1>
              <p className="text-sky-100 text-sm">{t.dash_sub}</p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
            id="btn-refresh-history"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="card flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-leaf-500 mr-3" />
          <span className="text-gray-500">{t.loading}</span>
        </div>
      )}

      {error && !loading && (
        <div className="card border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Nutrient Trend Chart */}
          {trends.length > 1 && (
            <div className="card animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-leaf-600" />
                <h2 className="font-bold text-gray-800">{t.dash_chart_title}</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="N" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Nitrogen (N)" />
                  <Line type="monotone" dataKey="P" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Phosphorus (P)" />
                  <Line type="monotone" dataKey="K" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} name="Potassium (K)" />
                  <Line type="monotone" dataKey="ph" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} name="pH" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* History Table */}
          {history.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-gray-500">{t.dash_empty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((rec, i) => (
                <div key={rec.id || i} className="card animate-slide-up hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{cropIcons[rec.crop1] || '🌱'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800 capitalize">{rec.crop1}</span>
                        <span className="text-xs text-gray-400">{formatDate(rec.timestamp)}</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        N: <strong>{rec.N}</strong> · P: <strong>{rec.P}</strong> · K: <strong>{rec.K}</strong> · pH: <strong>{rec.ph}</strong>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-green">{rec.crop1} — {rec.crop1_prob}%</span>
                        {rec.crop2 && <span className="badge" style={{background:'#f0fdf4', color:'#166534'}}>{rec.crop2}</span>}
                        {rec.crop3 && <span className="badge" style={{background:'#f0fdf4', color:'#166534'}}>{rec.crop3}</span>}
                        {rec.fertilizer_type && (
                          <span className="badge badge-yellow">🧪 {rec.fertilizer_type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
