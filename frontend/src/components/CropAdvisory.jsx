import { useState } from 'react';
import { MapPin, Mic, Volume2, AlertTriangle, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { translations, cropIcons, API_BASE } from '../translations';

export default function CropAdvisory({ lang, onSelectCrop }) {
  const t = translations[lang];

  const [form, setForm] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: ''
  });
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [weatherWarnings, setWeatherWarnings] = useState([]);
  const [location, setLocation] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setVoice = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // Auto-detect location and fill weather fields
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        try {
          const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data.success) {
            setForm(f => ({
              ...f,
              temperature: String(Math.round(data.current.temperature ?? data.forecast.avg_max_temp)),
              humidity: String(Math.round((data.forecast.avg_max_temp + data.forecast.avg_min_temp) / 2 + 30)), // approx
              rainfall: String(data.forecast.total_rain_7d)
            }));
            const warnings = lang === 'hi' ? data.warnings_hi : data.warnings_en;
            setWeatherWarnings(warnings || []);
          }
        } catch {
          setError(t.weather_error);
        }
        setDetecting(false);
      },
      () => {
        setDetecting(false);
        alert('Could not get your location. Please allow location access.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const vals = Object.values(form);
    if (vals.some(v => v === '')) { setError(t.error_required); return; }

    setLoading(true);
    try {
      const payload = {
        N: parseFloat(form.N), P: parseFloat(form.P), K: parseFloat(form.K),
        temperature: parseFloat(form.temperature), humidity: parseFloat(form.humidity),
        ph: parseFloat(form.ph), rainfall: parseFloat(form.rainfall),
        lat: location?.lat || null, lon: location?.lon || null
      };
      const res = await fetch(`${API_BASE}/predict-crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.recommendations);
        speakResults(data.recommendations);
      } else {
        setError(data.detail || 'Prediction failed.');
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    }
    setLoading(false);
  };

  const speakResults = (recs) => {
    if (!window.speechSynthesis) return;
    const top = recs[0];
    const msg = lang === 'hi'
      ? `आपकी मिट्टी के लिए सबसे अच्छी फसल ${top.crop} है, जिसकी विश्वसनीयता ${top.confidence} प्रतिशत है।`
      : `The best crop for your soil is ${top.crop} with ${top.confidence}% confidence.`;
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 70) return 'bg-leaf-500';
    if (conf >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const fields = [
    { key: 'N', label: t.label_N, placeholder: '0–140', icon: '🧪' },
    { key: 'P', label: t.label_P, placeholder: '5–145', icon: '🔵' },
    { key: 'K', label: t.label_K, placeholder: '5–205', icon: '🟡' },
    { key: 'temperature', label: t.label_temp, placeholder: '10–45', icon: '🌡️' },
    { key: 'humidity', label: t.label_humidity, placeholder: '14–100', icon: '💧' },
    { key: 'ph', label: t.label_ph, placeholder: '3.5–9.5', icon: '⚗️' },
    { key: 'rainfall', label: t.label_rainfall, placeholder: '20–300', icon: '🌧️' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-leaf-600 to-leaf-500 text-white border-0">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🌾</div>
          <div>
            <h1 className="text-xl font-bold">{t.crop_title}</h1>
            <p className="text-leaf-100 text-sm">{t.crop_sub}</p>
          </div>
        </div>
      </div>

      {/* Location Detect Button */}
      <button
        type="button"
        onClick={detectLocation}
        disabled={detecting}
        className="btn-ghost w-full"
        id="btn-detect-location"
      >
        <MapPin size={18} className="text-leaf-600" />
        {detecting ? t.detecting : t.btn_detect}
      </button>

      {/* Weather Warnings */}
      {weatherWarnings.length > 0 && (
        <div className="card border-yellow-200 bg-yellow-50 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-yellow-600" />
            <span className="font-bold text-yellow-800">{t.warnings_title}</span>
          </div>
          {weatherWarnings.map((w, i) => (
            <p key={i} className="text-yellow-700 text-sm mb-1">{w}</p>
          ))}
        </div>
      )}

      {/* Input Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="card animate-slide-up">
          <div className="grid grid-cols-1 gap-4">
            {fields.map(({ key, label, placeholder, icon }) => (
              <div key={key}>
                <label className="label-text">{icon} {label}</label>
                <div className="flex gap-2">
                  <input
                    id={`input-${key}`}
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
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 text-lg py-4" id="btn-get-crop-advice">
            {loading ? (
              <><RefreshCw size={20} className="animate-spin" /> {t.loading}</>
            ) : (
              <>{t.btn_get_advice} →</>
            )}
          </button>
        </form>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="card bg-gradient-to-br from-leaf-50 to-white border-leaf-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">{t.result_title}</h2>
                <p className="text-sm text-gray-500">{t.result_sub}</p>
              </div>
              <button
                onClick={() => window.speechSynthesis && speakResults(result)}
                className="btn-ghost py-2 px-3 text-sm"
                id="btn-listen-results"
              >
                <Volume2 size={16} /> {t.btn_listen}
              </button>
            </div>

            <div className="space-y-4">
              {result.map((rec, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-4 border-2 transition-all ${i === 0 ? 'border-leaf-400 bg-leaf-50' : 'border-gray-100 bg-white'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{cropIcons[rec.crop] || '🌱'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {i === 0 && <span className="badge badge-green">#{i+1} Best</span>}
                        {i === 1 && <span className="badge badge-yellow">#{i+1}</span>}
                        {i === 2 && <span className="badge" style={{backgroundColor:'#f3f4f6', color:'#6b7280'}}>#{i+1}</span>}
                        <span className="font-bold text-lg capitalize text-gray-800">{rec.crop}</span>
                      </div>
                      <span className="text-sm text-gray-500">{t.confidence}: {rec.confidence}%</span>
                    </div>
                  </div>
                  {/* Confidence bar */}
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getConfidenceColor(rec.confidence)}`}
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                  {i === 0 && (
                    <button
                      onClick={() => onSelectCrop(rec.crop)}
                      className="btn-secondary w-full mt-3"
                      id={`btn-get-fert-${rec.crop}`}
                    >
                      {t.btn_fertilizer} <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setResult(null); setError(''); }} className="btn-ghost w-full" id="btn-try-again">
            <RefreshCw size={16} /> {t.btn_try_again}
          </button>
        </div>
      )}
    </div>
  );
}
