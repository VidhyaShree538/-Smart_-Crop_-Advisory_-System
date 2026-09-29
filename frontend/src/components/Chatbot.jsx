import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MessageSquare, RefreshCw } from 'lucide-react';
import { translations, API_BASE } from '../translations';

export default function Chatbot({ lang }) {
  const t = translations[lang];

  const [messages, setMessages] = useState([
    { role: 'bot', text: t.chat_greeting }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, lang })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
      // TTS for bot response
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.answer);
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: lang === 'hi'
          ? 'सर्वर से जुड़ने में समस्या हुई। कृपया बाद में प्रयास करें।'
          : 'Could not connect to server. Please make sure the backend is running.'
      }]);
    }
    setLoading(false);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice input not supported in this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.start();
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
  };

  // Quick question chips
  const quickQuestions = lang === 'hi' ? [
    'रेतीली मिट्टी के लिए कौन सी फसल?',
    'यूरिया क्या है?',
    'धान के बारे में बताएं',
    'खाद की सलाह कैसे लें?',
  ] : [
    'Which crop for sandy soil?',
    'What does Urea do?',
    'Tell me about rice',
    'How to get fertilizer advice?',
  ];

  const clearChat = () => setMessages([{ role: 'bot', text: t.chat_greeting }]);

  return (
    <div className="animate-fade-in flex flex-col h-full" style={{ minHeight: '80vh' }}>
      {/* Header */}
      <div className="card bg-gradient-to-r from-purple-600 to-indigo-500 text-white border-0 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare size={28} className="text-purple-200" />
            <div>
              <h1 className="text-xl font-bold">{t.chat_title}</h1>
              <p className="text-purple-100 text-sm">{t.chat_sub}</p>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all" title="Clear chat">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            id={`quick-q-${i}`}
            className="flex-shrink-0 text-xs font-semibold bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400 px-3 py-2 rounded-2xl transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ maxHeight: '55vh' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-leaf-100 flex items-center justify-center text-base mr-2 flex-shrink-0 mt-1">
                🌾
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-leaf-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-leaf-100 flex items-center justify-center text-base mr-2">🌾</div>
            <div className="bg-white border border-gray-100 rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="card p-3 border-2 border-purple-100">
        <div className="flex gap-2">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder={t.chat_placeholder}
            className="flex-1 border-0 outline-none text-gray-700 font-medium text-sm bg-transparent"
          />
          <button
            onClick={startVoiceInput}
            className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 transition-all"
            title={t.chat_speak}
            id="btn-voice-chat"
          >
            <Mic size={18} />
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-leaf-600 hover:bg-leaf-700 text-white transition-all disabled:opacity-50"
            id="btn-send-chat"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
