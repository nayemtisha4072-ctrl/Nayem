/**
 * Floating Widgets Component
 * Matches reference Screenshots: 3 stacked circular green buttons on the right side
 * (Lime Support Headset, Emerald Telegram, Deep Green WhatsApp)
 */

import React from 'react';
import { Headphones, Send, MessageCircle } from 'lucide-react';

interface FloatingWidgetsProps {
  onOpenSupport: () => void;
  onOpenReward?: () => void;
}

export const FloatingWidgets: React.FC<FloatingWidgetsProps> = ({
  onOpenSupport,
}) => {
  return (
    <div className="fixed bottom-24 lg:bottom-8 right-3 sm:right-5 z-40 flex flex-col items-center gap-2.5 select-none">
      {/* 1. Lime Green Live Support Headset */}
      <button
        type="button"
        onClick={onOpenSupport}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#a3e635] to-[#65a30d] hover:brightness-110 border-2 border-white/80 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="24/7 Live Support"
        aria-label="24/7 Live Support"
      >
        <Headphones className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
      </button>

      {/* 2. Emerald Telegram Button */}
      <button
        type="button"
        onClick={onOpenSupport}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#0ea564] to-[#047857] hover:brightness-110 border-2 border-white/80 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Telegram Support"
        aria-label="Telegram Support"
      >
        <Send className="w-5 h-5 -ml-0.5 stroke-[2.2]" />
      </button>

      {/* 3. WhatsApp Green Button */}
      <button
        type="button"
        onClick={onOpenSupport}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#22c55e] to-[#15803d] hover:brightness-110 border-2 border-white/80 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="WhatsApp Support"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
      </button>
    </div>
  );
};
