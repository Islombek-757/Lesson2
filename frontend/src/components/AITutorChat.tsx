'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorChatProps {
  lessonContext?: string;
}

export default function AITutorChat({ lessonContext }: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your AI Tutor. Ask me anything about this lesson, and I will help you understand it better.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({ messages: newMessages, lessonContext });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to get AI response');
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Explain this topic simply',
    'Give me practice questions',
    'Summarize key points',
    'Give me a hint'
  ];

  return (
    <div className="glass rounded-2xl h-[600px] flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-semibold">AI Tutor</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Online • Ready to help</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-md'
                  : 'bg-white/5 text-[var(--foreground)] rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white/5 p-3 rounded-2xl rounded-bl-md">
              <Loader2 size={18} className="animate-spin text-indigo-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Sparkles size={12} />
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Tutor anything..."
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
