import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import CropAdvisory from './components/CropAdvisory';
import FertilizerAdvisory from './components/FertilizerAdvisory';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import { translations, API_BASE } from './translations';
import { Sprout, Leaf, BarChart2, MessageSquare, Globe, LogOut, User } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('en');
  const [tab,  setTab]  = useState('crop');
  const [selectedCrop, setSelectedCrop] = useState('');

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crop_user')) || null; }
    catch { return null; }
  });

  // Verify stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('crop_token');
    if (!token) { setUser(null); return; }
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success) setUser(data.user);
        else { localStorage.clear(); setUser(null); }
      })
      .catch(() => {/* network down – keep cached user */});
  }, []);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem('crop_token');
    localStorage.removeItem('crop_user');
    setUser(null);
    setTab('crop');
  };

  // ── Show Login if not authenticated ───────────────────────────────────────
  if (!user) return <LoginPage onLogin={handleLogin} />;

  const t = translations[lang];

  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
    setTab('fertilizer');
  };

  const navItems = [
    { id: 'crop',       icon: <Leaf size={22} />,         label: t.nav_home },
    { id: 'fertilizer', icon: <Sprout size={22} />,        label: t.nav_fertilizer },
    { id: 'dashboard',  icon: <BarChart2 size={22} />,     label: t.nav_dashboard },
    { id: 'chat',       icon: <MessageSquare size={22} />, label: t.nav_chat },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-leaf-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 gap-2">

          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl flex-shrink-0">🌾</span>
            <div className="min-w-0">
              <div className="font-bold text-leaf-800 text-sm leading-tight truncate">{t.appName}</div>
              <div className="text-xs text-gray-400 leading-tight truncate">
                👤 {user.name}{user.village ? ` · ${user.village}` : ''}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
              id="btn-toggle-lang"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-leaf-50
                         border-2 border-leaf-200 hover:bg-leaf-100 hover:border-leaf-400
                         transition-all text-xs font-bold text-leaf-700"
            >
              <Globe size={13} />
              {lang === 'en' ? 'हि' : 'EN'}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              id="btn-logout"
              title="Logout"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50
                         border-2 border-red-200 hover:bg-red-100 hover:border-red-400
                         transition-all text-xs font-bold text-red-600"
            >
              <LogOut size={13} />
              {lang === 'hi' ? 'बाहर' : 'Out'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        {tab === 'crop'       && <CropAdvisory lang={lang} onSelectCrop={handleSelectCrop} />}
        {tab === 'fertilizer' && <FertilizerAdvisory lang={lang} preselectedCrop={selectedCrop} />}
        {tab === 'dashboard'  && <Dashboard lang={lang} />}
        {tab === 'chat'       && <Chatbot lang={lang} />}
      </main>

      {/* ── Bottom Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-30
                      bg-white/95 backdrop-blur-md border-t border-leaf-100 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              id={`nav-${item.id}`}
              className={`nav-tab flex-1 ${tab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
