import React, { useState } from 'react';
import { Sparkles, X, Minimize2 } from 'lucide-react';
import ChatBot from './ChatBot';

interface ChatWidgetProps {
  accessToken: string;
}

export default function ChatWidget({ accessToken }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center text-white z-50 group"
      >
        <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-xl px-4 py-3 text-white z-50 flex items-center gap-2 hover:shadow-orange-500/50 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Dr. Baymax IA</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white text-sm">Dr. Baymax IA</h3>
            <p className="text-orange-100 text-xs">Asistente nutricional</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ChatBot 
          accessToken={accessToken} 
          isWidget={true}
        />
      </div>
    </div>
  );
}