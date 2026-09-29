import { useState, useEffect } from 'react';
import { Sprout, RefreshCw, CheckCircle } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { translations, cropIcons, API_BASE } from '../translations';

export default function FertilizerAdvisory({ lang, preselectedCrop }) {
  const t = translations[lang];

  const [form, setForm] = useState({
    crop: preselectedCrop || '',
    soil_type: '',
    N: '', P: '', K: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedCrop) setForm(f => ({ ...f, crop: preselectedCrop }));
  }, [preselectedCrop]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setVoice = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    if (!form.crop || !form.soil_type || form.N === '' || form.P === '' || form.K === '') {
      setError(t.error_required); return;
    }
    setLoading(true);
    try {
      const payload = {
        crop: form.crop,
        soil_type: form.soil_type,
        N: parseFloat(form.N),
        P: parseFloat(form.P),
        K: parseFloat(form.K),
      };
      const res = await fetch(`${API_BASE}/predict-fertilizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    }
    setLoading(false);
  };

  const nutrientColors = {
    'Nitrogen (N)': 'border-green-300 bg-green-50',
    'Phosphorus (P)': 'border-orange-300 bg-orange-50',
    'Potassium (K)': 'border-purple-300 bg-purple-50',
    'Organic': 'border-yellow-300 bg-yellow-50',
  };
  const nutrientIcons = {
    'Nitrogen (N)': '🌿',
    'Phosphorus (P)': '🟠',
    'Potassium (K)': '🟣',
    'Organic': '🍂',
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-soil-600 to-soil-500 text-white border-0">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🧑‍🌾</div>
          <div>
            <h1 className="text-xl font-bold">{t.fert_title}</h1>
            <p className="text-soil-100 text-sm">{t.fert_sub}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="card animate-slide-up space-y-4">
          {/* Crop Select */}
          <div>
            <label className="label-text">🌾 {t.label_crop}</label>
            <select
              id="select-crop"
              value={form.crop}
              onChange={set('crop')}
              className="input-field"
            >
              <option value="">{lang === 'hi' ? 'फसल चुनें...' : 'Select crop...'}</option>
              {t.crop_list.map(c => (
                <option key={c} value={c}>{cropIcons[c] || '🌱'} {c}</option>
              ))}
            </select>
          </div>

          {/* Soil Type */}
          <div>
            <label className="label-text">🌍 {t.label_soil_type}</label>
            <div className="grid grid-cols-3 gap-2">
              {t.soil_types.map((s, i) => {
                const engTypes = ['Sandy', 'Loamy', 'Clayey', 'Red', 'Black', 'Alluvial'];
                const engKey = engTypes[i];
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setForm(f => ({ ...f, soil_type: engKey }))}
                    id={`soil-type-${engKey.toLowerCase()}`}
                    className={`py-3 px-2 rounded-2xl text-sm font-semibold border-2 transition-all duration-200 ${
                      form.soil_type === engKey
                        ? 'border-leaf-500 bg-leaf-100 text-leaf-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-leaf-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* NPK Inputs */}
          {[
            { key: 'N', label: t.label_current_N, placeholder: '0–140', icon: '🧪' },
            { key: 'P', label: t.label_current_P, placeholder: '5–145', icon: '🔵' },
            { key: 'K', label: t.label_current_K, placeholder: '5–205', icon: '🟡' },
          ].map(({ key, label, placeholder, icon }) => (
            <div key={key}>
              <label className="label-text">{icon} {label}</label>
              <div className="flex gap-2">
                <input
                  id={`fert-input-${key}`}
                  type="number"
                  step="any"
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="input-field"
                />
                <VoiceButton onResult={setVoice(key)} lang={lang} label={label} />
              </div>
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-secondary w-full py-4 text-lg" id="btn-get-fertilizer">
            {loading
              ? <><RefreshCw size={20} className="animate-spin" /> {t.loading}</>
              : <><Sprout size={20} /> {t.btn_get_fert} →</>
            }
          </button>
        </form>
      )}

      {/* Results */}
      {result && (
        <div className="animate-slide-up space-y-4">
          {/* Status Header */}
          <div className={`card border-2 ${result.status === 'optimal' ? 'border-leaf-400 bg-leaf-50' : 'border-soil-300 bg-soil-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              {result.status === 'optimal' ? (
                <CheckCircle size={24} className="text-leaf-600" />
              ) : (
                <Sprout size={24} className="text-soil-600" />
              )}
              <div>
                <h2 className="font-bold text-lg capitalize text-gray-800">
                  {cropIcons[result.crop]} {result.crop} — {result.soil_type} Soil
                </h2>
                <p className="text-sm text-gray-500">
                  {result.status === 'optimal'
                    ? (lang === 'hi' ? result.recommendations[0]?.description_hi : t.soil_optimal)
                    : t.fert_result_title
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Fertilizer Cards */}
          {result.recommendations.map((rec, i) => (
            <div key={i} className={`card border-2 ${nutrientColors[rec.nutrient] || 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{nutrientIcons[rec.nutrient] || '🌱'}</span>
                  <div>
                    <div className="font-bold text-gray-800">{rec.fertilizer}</div>
                    <div className="text-xs text-gray-500">{rec.nutrient}</div>
                  </div>
                </div>
                {rec.quantity_kg_per_acre > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-800">{rec.quantity_kg_per_acre}</div>
                    <div className="text-xs text-gray-500">{t.qty_per_acre}</div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {lang === 'hi' ? rec.description_hi : rec.description_en}
              </p>
            </div>
          ))}

          {/* General Organic Tip */}
          {result.general_en && (
            <div className="card border-2 border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🍂</span>
                <span className="font-bold text-yellow-800">
                  {lang === 'hi' ? 'जैविक खाद सलाह' : 'Organic Manure Tip'}
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                {lang === 'hi' ? result.general_hi : result.general_en}
              </p>
            </div>
          )}

          <button
            onClick={() => setResult(null)}
            className="btn-ghost w-full"
            id="btn-fert-try-again"
          >
            <RefreshCw size={16} /> {t.btn_try_again}
          </button>
        </div>
      )}
    </div>
  );
}
