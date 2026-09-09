import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chatbot({ setActiveTab }) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Hello! I am **Coolie AI**, your intelligent HVAC & AC assistant. How can I help you today?',
      suggestions: ['Recommend best 1.5T AC', 'Calculate Electricity Bill', 'Book AC Cleaning', 'Raise Water Leakage Complaint']
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await api.queryChatbot(text, currentUser?.id);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.reply,
            suggestions: res.suggestions || [],
            action_type: res.action_type
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I am experiencing a temporary connection glitch. Please check your internet connection or try again.',
          suggestions: ['Recommend best AC', 'Book Service']
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

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-cool-600 via-cyan-500 to-cool-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white"></span>
          </div>
          <span className="font-bold text-sm">Ask Coolie AI</span>
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cool-600 to-cyan-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center space-x-1">
                  <span>Coolie AI Assistant</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-400 text-slate-900 font-extrabold rounded-full">ONLINE</span>
                </h3>
                <p className="text-[11px] text-cyan-100">AC Selection, Energy Calc & Service Bot</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/60">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    m.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-cool-600 text-white'
                  }`}>
                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 shadow-sm rounded-tl-none'
                  }`}>
                    {/* Render simple markdown bold lines */}
                    <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    
                    {/* Action button if returned */}
                    {m.action_type && (
                      <button
                        onClick={() => handleActionClick(m.action_type)}
                        className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-cool-600 text-white font-semibold rounded-lg text-[11px] shadow hover:bg-cool-700 transition"
                      >
                        <span>Open Section Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick suggestions pills */}
                {m.suggestions && m.suggestions.length > 0 && idx === messages.length - 1 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-9">
                    {m.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(s)}
                        className="px-2.5 py-1 bg-cyan-50 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 rounded-full text-[11px] font-medium border border-cyan-200 dark:border-slate-700 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span>Coolie AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
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
                placeholder="Ask about ACs, energy bill, or service..."
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                className="p-2 bg-gradient-to-r from-cool-600 to-cyan-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition"
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
