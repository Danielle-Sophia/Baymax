import React, { useState, useEffect, useRef } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { MessageCircle, Send, Trash2, Bot, User, Loader2, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface ChatBotProps {
  accessToken: string;
  onBack?: () => void;
  isWidget?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function ChatBot({ accessToken, onBack, isWidget = false }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/chat/history`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.history || []);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message immediately
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: userMessage,
            history: messages.slice(-10) // Send last 10 messages for context
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[CHATBOT] Error response:', data);
        if (data.details) {
          console.error('[CHATBOT] Error details:', data.details);
        }
        if (data.status) {
          console.error('[CHATBOT] Error status:', data.status);
        }
        throw new Error(data.error || 'Error al enviar mensaje');
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: error.message || 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar todo el historial de chat?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/chat/history`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      alert('Error al borrar el historial');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "¿Qué alimentos son buenos para mi objetivo?",
    "¿Cómo puedo mejorar mi alimentación?",
    "¿Cuánta agua debo tomar al día?",
    "Dame consejos para comer saludable"
  ];

  return (
    <div className={isWidget ? "h-full flex flex-col" : "max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col"}>
      {/* Header - Solo mostrar en modo página completa */}
      {!isWidget && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-white mb-1">Dr. Baymax IA</h1>
                <p className="text-emerald-50 text-sm">
                  Tu asistente nutricional personalizado
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className={`flex-1 bg-white ${isWidget ? '' : 'border-x'} overflow-y-auto ${isWidget ? 'p-3' : 'p-6'} space-y-4`}>
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="mb-3">¡Hola! Soy Dr. Baymax IA</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Estoy aquí para ayudarte con tus dudas sobre nutrición, ejercicio y hábitos saludables.
            </p>
            
            {/* Suggested Questions */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-500 mb-4">Preguntas sugeridas:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition text-sm border border-gray-200"
                  >
                    <MessageCircle className="w-4 h-4 inline mr-2 text-emerald-600" />
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-emerald-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-5 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`bg-white ${isWidget ? 'p-3 border-t' : 'border-x border-b rounded-b-xl p-4 shadow-lg'}`}>
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            className={`flex-1 resize-none border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${isWidget ? 'text-sm max-h-20' : 'px-4 py-3 max-h-32'}`}
            rows={1}
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`${isWidget ? 'px-3 bg-orange-500 hover:bg-orange-600' : 'px-6 bg-emerald-600 hover:bg-emerald-700'} text-white rounded-xl`}
          >
            {loading ? (
              <Loader2 className={`${isWidget ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />
            ) : (
              <Send className={`${isWidget ? 'w-4 h-4' : 'w-5 h-5'}`} />
            )}
          </Button>
        </div>
        {!isWidget && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Dr. Baymax IA proporciona información general. Para asesoramiento médico, consulta a un profesional de la salud.
          </p>
        )}
      </div>
    </div>
  );
}