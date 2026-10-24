import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Sparkles, User, ArrowRight, Zap, 
  RefreshCw, RotateCcw, Wrench, AlertTriangle, CheckCircle2, 
  ShieldCheck, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INITIAL_MESSAGE = {
  sender: 'bot',
  text: '👋 Hello! I am **Coolie AI**, your 24/7 HVAC AC Specialist at **Cooling Hub**.\n\n' +
        'How can I help you today? You can select a common issue below or describe your problem:',
  suggestions: [
    '❄️ AC Not Cooling',
    '🔋 Remote Not Working',
    '⚠️ Error Code on Display',
    '💧 Water Leakage',
    '🔊 Strange Noise',
    '🔌 AC Won\'t Turn On',
    '⏱️ Shuts Off Automatically',
    '👨‍🔧 Book a Technician'
  ]
};

export default function Chatbot({ setActiveTab }) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({});
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setContext({});
    setInputMsg('');
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await api.queryChatbot(text, currentUser?.id, context);
      
      // Update diagnostic context from backend
      if (res.payload?.context) {
        setContext((prev) => ({ ...prev, ...res.payload.context }));
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.reply,
            suggestions: res.suggestions || [],
            action_type: res.action_type,
            intent: res.intent
          }
        ]);
        setLoading(false);
      }, 400);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ I am experiencing a temporary connection issue. Please check your network or try again in a moment.',
          suggestions: ['Recommend best AC', 'Book a Technician', 'Check AMC Plans']
        }
      ]);
      setLoading(false);
    }
  };

  const handleActionClick = (actionType) => {
    if (actionType === 'navigate_shop') setActiveTab('shop');
    else if (actionType === 'navigate_calculator') setActiveTab('calculator');
    else if (actionType === 'navigate_services') setActiveTab('services');
    else if (actionType === 'navigate_complaint') setActiveTab('complaints');
    else if (actionType === 'navigate_amc') setActiveTab('amc');
    setIsOpen(false);
  };

  const renderFormattedText = (rawText) => {
    // Convert newlines and bold markdown
    let formatted = rawText
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#111111] dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-[#555555] dark:text-[#A0A0A0]">$1</em>');

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <>
      {/* Floating Launcher Button in Rich Black with Champagne pulse */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 sm:px-5 py-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] border border-[#C8A96B]/50 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
          aria-label="Open Coolie AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#C8A96B] group-hover:text-[#111111] transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#111111] animate-pulse"></span>
          </div>
          <div className="text-left hidden xs:block sm:block">
            <span className="block font-bold text-xs sm:text-sm leading-tight">Ask Coolie AI</span>
            <span className="block text-[10px] text-[#C8A96B] group-hover:text-[#111111] font-medium leading-tight">AC Troubleshooting</span>
          </div>
          <Sparkles className="w-4 h-4 text-[#C8A96B] group-hover:text-[#111111] group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[600px] max-h-[88vh] bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-[#111111] text-white flex items-center justify-between border-b border-[#292929]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-[#C8A96B]/30 flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#C8A96B]" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center space-x-2">
                  <span>Coolie AI Specialist</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ONLINE</span>
                  </span>
                </h3>
                <p className="text-[11px] text-[#A0A0A0]">Verified AC Diagnostics & Technician Booking</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-xl hover:bg-white/15 text-[#C8A96B] hover:text-white transition"
                title="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Problem Category Bar */}
          <div className="px-3 py-2 bg-[#FAF7F0] dark:bg-[#151515] border-b border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-[10px] font-bold text-[#858585] uppercase tracking-wider whitespace-nowrap pl-1">
              Quick Diagnostics:
            </span>
            <button
              onClick={() => handleSendMessage('my AC is not cooling properly')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#222222] border border-[#E2E0DB] dark:border-[#333333] font-semibold text-[#111111] dark:text-[#E2E0DB] hover:border-[#C8A96B] hover:text-[#C8A96B] transition whitespace-nowrap"
            >
              ❄️ Not Cooling
            </button>
            <button
              onClick={() => handleSendMessage('my AC remote is not working')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#222222] border border-[#E2E0DB] dark:border-[#333333] font-semibold text-[#111111] dark:text-[#E2E0DB] hover:border-[#C8A96B] hover:text-[#C8A96B] transition whitespace-nowrap"
            >
              🔋 Remote
            </button>
            <button
              onClick={() => handleSendMessage('my AC is displaying an error code')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#222222] border border-[#E2E0DB] dark:border-[#333333] font-semibold text-[#111111] dark:text-[#E2E0DB] hover:border-[#C8A96B] hover:text-[#C8A96B] transition whitespace-nowrap"
            >
              ⚠️ Error Codes
            </button>
            <button
              onClick={() => handleSendMessage('water is leaking from my AC')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#222222] border border-[#E2E0DB] dark:border-[#333333] font-semibold text-[#111111] dark:text-[#E2E0DB] hover:border-[#C8A96B] hover:text-[#C8A96B] transition whitespace-nowrap"
            >
              💧 Leakage
            </button>
            <button
              onClick={() => handleSendMessage('my AC makes strange noise')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#222222] border border-[#E2E0DB] dark:border-[#333333] font-semibold text-[#111111] dark:text-[#E2E0DB] hover:border-[#C8A96B] hover:text-[#C8A96B] transition whitespace-nowrap"
            >
              🔊 Noise
            </button>
            <button
              onClick={() => handleSendMessage('my AC won\'t turn on')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#222222] border border-[#E2E0DB] dark:border-[#333333] font-semibold text-[#111111] dark:text-[#E2E0DB] hover:border-[#C8A96B] hover:text-[#C8A96B] transition whitespace-nowrap"
            >
              🔌 No Power
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-[#F7F6F2] dark:bg-[#111111]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[88%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                    m.sender === 'user' ? 'bg-[#111111] text-white' : 'bg-[#C8A96B] text-[#111111] shadow-sm'
                  }`}>
                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-[#111111] text-white rounded-tr-none shadow-sm'
                      : 'bg-white dark:bg-[#1A1A1A] text-[#222222] dark:text-[#F7F6F2] border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm rounded-tl-none'
                  }`}>
                    {renderFormattedText(m.text)}
                    
                    {/* Primary Action Button (e.g. Book Technician / Services) */}
                    {m.action_type && (
                      <div className="pt-2 border-t border-[#E2E0DB]/60 dark:border-[#2E2E2E]/60 flex flex-wrap gap-2">
                        {m.action_type === 'navigate_services' && (
                          <button
                            onClick={() => handleActionClick('navigate_services')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#C8A96B] text-[#111111] hover:bg-[#b59556] font-black rounded-xl text-xs shadow-md transition-all duration-200"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Book a Technician Now</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                        )}

                        {m.action_type === 'navigate_complaint' && (
                          <button
                            onClick={() => handleActionClick('navigate_complaint')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 text-white hover:bg-rose-700 font-bold rounded-xl text-xs shadow-md transition-all duration-200"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Raise Priority Complaint</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                        )}

                        {m.action_type === 'navigate_shop' && (
                          <button
                            onClick={() => handleActionClick('navigate_shop')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#111111] text-white hover:bg-[#C8A96B] hover:text-[#111111] font-bold rounded-xl text-xs shadow-md transition-all duration-200"
                          >
                            <span>Browse AC Store</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                        )}

                        {m.action_type === 'navigate_calculator' && (
                          <button
                            onClick={() => handleActionClick('navigate_calculator')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#111111] text-white hover:bg-[#C8A96B] hover:text-[#111111] font-bold rounded-xl text-xs shadow-md transition-all duration-200"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#C8A96B]" />
                            <span>Open Energy Calculator</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                        )}

                        {m.action_type === 'navigate_amc' && (
                          <button
                            onClick={() => handleActionClick('navigate_amc')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#111111] text-white hover:bg-[#C8A96B] hover:text-[#111111] font-bold rounded-xl text-xs shadow-md transition-all duration-200"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96B]" />
                            <span>Explore AMC Plans</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions Pills (Only on latest message) */}
                {m.suggestions && m.suggestions.length > 0 && idx === messages.length - 1 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pl-9 max-w-[95%]">
                    {m.suggestions.map((s, sIdx) => {
                      const isPositive = s.includes('Yes') || s.includes('resolved') || s.includes('cleared');
                      const isNegative = s.includes('No') || s.includes('not') || s.includes('still');
                      const isTech = s.includes('Technician') || s.includes('Service');

                      let pillStyle = "bg-white dark:bg-[#252525] text-[#111111] dark:text-[#E2E0DB] border-[#E2E0DB] dark:border-[#2E2E2E] hover:border-[#C8A96B] hover:text-[#C8A96B]";
                      if (isPositive) {
                        pillStyle = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 font-bold";
                      } else if (isNegative) {
                        pillStyle = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 font-bold";
                      } else if (isTech) {
                        pillStyle = "bg-[#FAF7F0] dark:bg-[#202020] text-[#111111] dark:text-[#C8A96B] border-[#C8A96B]/50 hover:bg-[#C8A96B] hover:text-[#111111] font-bold";
                      }

                      return (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(s)}
                          className={`px-3 py-1.5 rounded-full text-[11px] border transition shadow-xs flex items-center space-x-1 ${pillStyle}`}
                        >
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-[#555555] text-xs pl-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C8A96B]" />
                <span className="font-medium">Coolie AI is analyzing troubleshooting manuals...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-[#1A1A1A] border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Describe your AC problem or error code (e.g. Voltas E1)..."
                className="flex-1 px-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-xs text-[#111111] dark:text-[#F7F6F2] placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
              />
              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                className="p-2.5 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}

