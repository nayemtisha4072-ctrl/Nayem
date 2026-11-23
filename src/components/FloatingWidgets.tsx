/**
 * Floating Widgets Component
 * 24/7 Live Customer Support Button
 * (Lucky Spin Wheel / Free Spin permanently removed as requested)
 */

import React from 'react';
import { Headphones } from 'lucide-react';

interface FloatingWidgetsProps {
  onOpenSupport: () => void;
  onOpenReward?: () => void;
}

export const FloatingWidgets: React.FC<FloatingWidgetsProps> = ({
  onOpenSupport,
}) => {
  return (
    <div className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-center gap-3 select-none">
      {/* 24/7 Live Customer Support Button */}
      <button
        onClick={onOpenSupport}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#c90059] via-[#940040] to-[#590026] hover:brightness-110 border-2 border-amber-400 text-white flex items-center justify-center shadow-2xl shadow-black/70 transform hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        title="২৪/৭ লাইভ কাস্টমার সাপোর্ট (24/7 Live Support)"
      >
        <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-25 pointer-events-none" />
        <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 drop-shadow" />
        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 border border-slate-950 text-[9px] font-black text-slate-950 shadow">
          24/7
        </span>
      </button>
    </div>
  );
};
