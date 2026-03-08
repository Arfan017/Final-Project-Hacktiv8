import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Menu,
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
  BookOpen,
  Lightbulb,
  Calculator,
  User,
  Bot,
  AlertCircle,
  X
} from 'lucide-react';


// --- MOCK DATA ---
const SUGGESTED_PROMPTS = [
  { icon: <Calculator size={20} className="text-blue-500" />, text: "Bantu saya menyelesaikan persamaan kuadrat ini" },
  { icon: <BookOpen size={20} className="text-green-500" />, text: "Jelaskan penyebab Perang Dunia II secara ringkas" },
  { icon: <Lightbulb size={20} className="text-yellow-500" />, text: "Bagaimana cara kerja fotosintesis pada tumbuhan?" },
  { icon: <MessageSquare size={20} className="text-purple-500" />, text: "Koreksi grammar esai bahasa Inggris saya" }
];

const HISTORY = [
  "Rumus Fisika Dasar",
  "Sejarah Kemerdekaan RI",
  "Tugas Biologi Sel",
  "Latihan Soal UTBK"
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Tambahkan pesan user ke UI
    const newUserMsg = { id: Date.now(), text, sender: 'user' };

    // Siapkan riwayat percakapan untuk API Backend
    // Ubah format 'sender' UI menjadi 'role' ('user' atau 'model') yang dikenali Gemini
    const conversationHistory = [...messages, newUserMsg].map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      text: msg.text
    }));

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Panggil API Backend lokal
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation: conversationHistory })
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Tambahkan balasan dari Gemini ke UI
      const botResponse = {
        id: Date.now() + 1,
        text: data.result,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Gagal menghubungi server:", error);

      // Tampilkan pesan error jika backend mati/gagal
      const errorMsg = {
        id: Date.now() + 1,
        text: "Maaf, saya tidak dapat terhubung ke server AI saat ini. Pastikan server backend sudah berjalan di port 3000 ya! 🔧",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 selection:bg-indigo-100 selection:text-indigo-900">

      {/* --- SIDEBAR --- */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out bg-slate-900 text-slate-300 flex flex-col overflow-hidden hidden md:flex shrink-0`}>
        <div className="p-4">
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-2 w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 text-white font-medium shadow-sm"
          >
            <Plus size={18} />
            Sesi Belajar Baru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Riwayat Belajar</p>
          <div className="space-y-1">
            {HISTORY.map((item, idx) => (
              <button key={idx} className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm text-left truncate">
                <MessageSquare size={16} className="shrink-0 text-slate-400" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-1">
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm">
            <Settings size={18} /> Pengaturan
          </button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 text-red-400 hover:text-red-300 transition-colors text-sm">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full max-w-full relative">

        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <GraduationCap size={20} />
              </div>
              <h1 className="font-bold text-xl tracking-tight text-gray-900">EduBot<span className="text-indigo-600">.</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Siswa SMP/SMA
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 cursor-pointer">
              A
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 w-full">
          <div className="max-w-4xl mx-auto space-y-6 pb-24">

            {/* Welcome Screen (Show if no messages) */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm border border-indigo-200 transform rotate-3">
                  <GraduationCap size={40} className="-rotate-3" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Halo! Apa yang ingin kamu pelajari hari ini?</h2>
                <p className="text-gray-500 mb-10 max-w-lg">Saya adalah asisten virtualmu. Saya bisa bantu bahas soal matematika, meringkas materi sejarah, atau berlatih bahasa Inggris.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="flex items-center gap-3 p-4 bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-xl text-left transition-all group"
                    >
                      <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
                        {prompt.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Feed */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-500 text-white shadow-sm'
                  }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl ${msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                  }`}>
                  <p className="leading-relaxed whitespace-pre-wrap text-[15px]">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white shadow-sm flex items-center justify-center mt-1">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10 pb-6 px-4">
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya soal matematika, biologi, sejarah..."
                className="w-full max-h-32 min-h-[56px] p-4 pr-32 resize-none outline-none text-gray-700 bg-transparent placeholder-gray-400"
                rows="1"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => setShowModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Lampirkan File/Foto Soal"
                >
                  <Paperclip size={20} />
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Pesan Suara"
                >
                  <Mic size={20} />
                </button>

                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-xl transition-colors ml-1 shadow-sm"
                  title="Kirim Pesan"
                >
                  <Send size={18} className={inputValue.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              EduBot dapat membuat kesalahan. Harap periksa kembali jawaban penting.
            </p>
          </div>
        </div>

      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Fitur Belum Tersedia</h3>
              <p className="text-gray-500 leading-relaxed">
                Maaf ya! Fitur ini masih dalam tahap pengembangan. Tunggu update selanjutnya! 🚀
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-md active:scale-95"
              >
                Mengerti
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
