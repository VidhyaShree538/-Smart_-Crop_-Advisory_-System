import { Mic, MicOff } from 'lucide-react';

/**
 * VoiceButton - triggers browser speech recognition for a numeric field.
 * Props:
 *   onResult(text)  - callback with recognized text
 *   lang            - 'en' or 'hi'
 *   label           - aria label string
 */
export default function VoiceButton({ onResult, lang = 'en', label = 'Speak' }) {
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Extract first number from speech
      const match = transcript.match(/[\d.]+/);
      if (match) onResult(match[0]);
      else onResult(transcript);
    };
    recognition.onerror = () => {
      alert('Could not understand. Please try again or type the value.');
    };
  };

  return (
    <button
      type="button"
      onClick={startListening}
      title={label}
      className="p-2 rounded-xl bg-leaf-100 hover:bg-leaf-200 text-leaf-700 transition-all duration-200 active:scale-95"
    >
      <Mic size={16} />
    </button>
  );
}
