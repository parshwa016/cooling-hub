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
      {/* Floating Launcher Button in Rich Black with Champagne pulse */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] border border-[#C8A96B]/40 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#C8A96B] group-hover:text-[#111111] transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C8A96B] rounded-full ring-2 ring-white"></span>
          </div>
          <span className="font-bold text-sm">Ask Coolie AI</span>
          <Sparkles className="w-4 h-4 text-[#C8A96B] group-hover:text-[#111111] group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-[#111111] text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#C8A96B]" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center space-x-1">
                  <span>Coolie AI Assistant</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-[#C8A96B] text-[#111111] font-extrabold rounded-full">ONLINE</span>
                </h3>
                <p className="text-[11px] text-[#E2E0DB]">AC Selection, Energy Calc & Service Bot</p>
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
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F7F6F2] dark:bg-[#111111]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    m.sender === 'user' ? 'bg-[#111111] text-white' : 'bg-[#C8A96B] text-[#111111]'
                  }`}>
                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#111111] text-white rounded-tr-none shadow-sm'
                      : 'bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-[#F7F6F2] border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm rounded-tl-none'
                  }`}>
                    {/* Render simple markdown bold lines */}
                    <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    
                    {/* Action button if returned */}
                    {m.action_type && (
                      <button
                        onClick={() => handleActionClick(m.action_type)}
                        className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#111111] text-white hover:bg-[#C8A96B] hover:text-[#111111] font-semibold rounded-lg text-[11px] shadow-sm transition-colors"
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
                        className="px-2.5 py-1 bg-white dark:bg-[#252525] hover:bg-[#FAF7F0] text-[#111111] dark:text-[#C8A96B] rounded-full text-[11px] font-medium border border-[#E2E0DB] dark:border-[#2E2E2E] transition shadow-2xs"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-[#555555] text-xs pl-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C8A96B]" />
                <span>Coolie AI is thinking...</span>
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
                placeholder="Ask about ACs, energy bill, or service..."
                className="flex-1 px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-xs text-[#111111] dark:text-[#F7F6F2] placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
              />
              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                className="p-2 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] rounded-xl disabled:opacity-50 transition-colors"
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
