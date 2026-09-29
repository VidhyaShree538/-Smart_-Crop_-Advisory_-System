import { useState } from 'react';
import { User, Phone, Lock, MapPin, Leaf, Eye, EyeOff, RefreshCw, ArrowRight } from 'lucide-react';
import { API_BASE } from '../translations';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [lang, setLang] = useState('en');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', phone: '', village: '', password: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const isHi = lang === 'hi';

  const txt = {
    en: {
      welcome:    'Welcome to Smart Crop Advisor',
      tagline:    'AI-powered farming advice for every farmer 🌾',
      login:      'Login',
      register:   'Create Account',
      name:       'Full Name',
      namePh:     'e.g. Ramesh Kumar',
      phone:      'Mobile Number',
      phonePh:    '10-digit mobile number',
      village:    'Village / District',
      villagePh:  'e.g. Alwar, Rajasthan',
      password:   'Password',
      passwordPh: 'Minimum 4 characters',
      btnLogin:   'Login →',
      btnReg:     'Create Account →',
      switchReg:  "Don't have an account?",
      switchLog:  'Already have an account?',
      switchLnk:  'Register here',
      switchLnk2: 'Login here',
      demo:       'Demo: Phone 9999999999 / Password: demo',
    },
    hi: {
      welcome:    'स्मार्ट फसल सलाहकार में आपका स्वागत है',
      tagline:    'हर किसान के लिए AI खेती सलाह 🌾',
      login:      'लॉगिन',
      register:   'खाता बनाएं',
      name:       'पूरा नाम',
      namePh:     'जैसे: रमेश कुमार',
      phone:      'मोबाइल नंबर',
      phonePh:    '10 अंकों का मोबाइल नंबर',
      village:    'गाँव / जिला',
      villagePh:  'जैसे: अलवर, राजस्थान',
      password:   'पासवर्ड',
      passwordPh: 'कम से कम 4 अक्षर',
      btnLogin:   'लॉगिन करें →',
      btnReg:     'खाता बनाएं →',
      switchReg:  'खाता नहीं है?',
      switchLog:  'पहले से खाता है?',
      switchLnk:  'यहाँ रजिस्टर करें',
      switchLnk2: 'यहाँ लॉगिन करें',
      demo:       'डेमो: फोन 9999999999 / पासवर्ड: demo',
    }
  };
  const T = txt[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload  = mode === 'login'
        ? { phone: form.phone, password: form.password }
        : { name: form.name, phone: form.phone, village: form.village, password: form.password };

      const res  = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Something went wrong.'); setLoading(false); return; }

      // Persist token + user info
      localStorage.setItem('crop_token', data.user.token);
      localStorage.setItem('crop_user',  JSON.stringify(data.user));
      onLogin(data.user);
    } catch {
      setError('Cannot reach server. Make sure the backend is running on port 8000.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8
                    bg-gradient-to-br from-leaf-700 via-leaf-600 to-leaf-800 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-leaf-400/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-soil-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo / Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                          bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl mb-4">
            <span className="text-5xl">🌾</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">{T.welcome}</h1>
          <p className="text-leaf-200 text-sm mt-1">{T.tagline}</p>

          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
                       bg-white/20 hover:bg-white/30 border border-white/30
                       text-white text-xs font-semibold transition-all"
            id="auth-lang-toggle"
          >
            🌐 {isHi ? 'Switch to English' : 'हिन्दी में बदलें'}
          </button>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/50">

          {/* Tab toggle */}
          <div className="flex bg-leaf-50 rounded-2xl p-1 mb-6">
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                id={`tab-${m}`}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === m ? 'bg-leaf-600 text-white shadow-md' : 'text-gray-500 hover:text-leaf-700'
                }`}>
                {m === 'login' ? T.login : T.register}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Register-only fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="label-text text-gray-600">👤 {T.name}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="input-name" type="text" value={form.name} onChange={set('name')}
                      placeholder={T.namePh} required
                      className="input-field pl-9 text-base" />
                  </div>
                </div>
                <div>
                  <label className="label-text text-gray-600">📍 {T.village}</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="input-village" type="text" value={form.village} onChange={set('village')}
                      placeholder={T.villagePh}
                      className="input-field pl-9 text-base" />
                  </div>
                </div>
              </>
            )}

            {/* Phone */}
            <div>
              <label className="label-text text-gray-600">📱 {T.phone}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="input-phone" type="tel" value={form.phone} onChange={set('phone')}
                  placeholder={T.phonePh} required maxLength={10}
                  className="input-field pl-9 text-base tracking-widest" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label-text text-gray-600">🔒 {T.password}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="input-password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  placeholder={T.passwordPh} required minLength={4}
                  className="input-field pl-9 pr-10 text-base" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-leaf-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} id="btn-auth-submit"
              className="btn-primary w-full py-4 text-base mt-2">
              {loading
                ? <><RefreshCw size={18} className="animate-spin" /> {isHi ? 'कृपया प्रतीक्षा करें...' : 'Please wait...'}</>
                : <>{mode === 'login' ? T.btnLogin : T.btnReg}</>
              }
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === 'login' ? T.switchReg : T.switchLog}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-leaf-600 font-bold hover:underline" id="btn-switch-mode">
              {mode === 'login' ? T.switchLnk : T.switchLnk2}
            </button>
          </p>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-leaf-50 rounded-2xl border border-leaf-100 text-center">
            <p className="text-xs text-leaf-600 font-medium">💡 {T.demo}</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-leaf-300 text-xs mt-6 opacity-70">
          {isHi ? 'किसानों के लिए, किसानों द्वारा' : 'Built for farmers, by farmers'} 🇮🇳
        </p>
      </div>
    </div>
  );
}
