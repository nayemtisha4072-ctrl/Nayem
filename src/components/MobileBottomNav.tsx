/**
 * Mobile Bottom Navigation Bar for Banglabaji
 * Fixed navigation on mobile with quick deposit, sports, and lobby actions
 */

import React from 'react';
import { Home, Trophy, Tv, PlusCircle, User as UserIcon, UserPlus, LogIn } from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isLoggedIn: boolean;
  onOpenDeposit: () => void;
  onOpenProfile: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  lang: 'bn' | 'en';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  isLoggedIn,
  onOpenDeposit,
  onOpenProfile,
  onOpenAuth,
  lang,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#540026] border-t border-[#800038] flex items-center justify-between py-1.5 px-1 shadow-2xl backdrop-blur-md select-none w-full max-w-full">
      {/* 1. Home */}
      <button
        onClick={() => setCurrentTab('hot')}
        className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-semibold cursor-pointer transition ${
          currentTab === 'hot' ? 'text-amber-300' : 'text-rose-200/70 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">{lang === 'bn' ? 'হোম' : 'Home'}</span>
      </button>

      {/* 2. Sports */}
      <button
        onClick={() => setCurrentTab('sports')}
        className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-semibold cursor-pointer transition ${
          currentTab === 'sports' ? 'text-amber-300' : 'text-rose-200/70 hover:text-white'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] font-bold">{lang === 'bn' ? 'স্পোর্টস' : 'Sports'}</span>
      </button>

      {/* 3. Central Button: ONLY shows Deposit when logged in! When not logged in, shows Sign Up! */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {isLoggedIn ? (
          <button
            onClick={onOpenDeposit}
            className="flex flex-col items-center justify-center -mt-6 group cursor-pointer focus:outline-hidden"
            aria-label="Deposit Money"
          >
            <div className="w-13 h-13 rounded-full gold-accent-btn flex items-center justify-center text-slate-950 shadow-xl shadow-black/70 transform group-active:scale-95 transition border-2 border-amber-300">
              <PlusCircle className="w-7 h-7 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black text-amber-300 mt-0.5 tracking-tight drop-shadow">
              {lang === 'bn' ? 'ডিপোজিট' : 'Deposit'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('register')}
            className="flex flex-col items-center justify-center -mt-6 group cursor-pointer focus:outline-hidden"
            aria-label="Sign Up"
          >
            <div className="w-13 h-13 rounded-full gold-accent-btn flex items-center justify-center text-slate-950 shadow-xl shadow-black/70 transform group-active:scale-95 transition border-2 border-amber-300">
              <UserPlus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black text-amber-300 mt-0.5 tracking-tight drop-shadow">
              {lang === 'bn' ? 'সাইন আপ' : 'Sign Up'}
            </span>
          </button>
        )}
      </div>

      {/* 4. Casino */}
      <button
        onClick={() => setCurrentTab('live')}
        className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-semibold cursor-pointer transition ${
          currentTab === 'live' ? 'text-amber-300' : 'text-rose-200/70 hover:text-white'
        }`}
      >
        <Tv className="w-5 h-5" />
        <span className="text-[10px] font-bold">{lang === 'bn' ? 'ক্যাসিনো' : 'Casino'}</span>
      </button>

      {/* 5. Profile (when logged in) or Login (when not logged in) */}
      {isLoggedIn ? (
        <button
          onClick={onOpenProfile}
          className="flex-1 flex flex-col items-center justify-center py-1 text-xs font-semibold text-rose-200/70 hover:text-white cursor-pointer transition"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">{lang === 'bn' ? 'একাউন্ট' : 'Account'}</span>
        </button>
      ) : (
        <button
          onClick={() => onOpenAuth('login')}
          className="flex-1 flex flex-col items-center justify-center py-1 text-xs font-semibold text-rose-200/70 hover:text-white cursor-pointer transition"
        >
          <LogIn className="w-5 h-5" />
          <span className="text-[10px] font-bold">{lang === 'bn' ? 'লগইন' : 'Login'}</span>
        </button>
      )}
    </div>
  );
};
