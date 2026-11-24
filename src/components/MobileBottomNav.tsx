/**
 * Mobile Bottom Navigation Bar
 * Matches reference Screenshots: Crisp White bottom bar with
 * Home | Promotion | [Raised circular glowing Emerald Invite button] | Reward | Member
 */

import React from 'react';
import { Home, Gift, Users, Trophy, User as UserIcon } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isLoggedIn: boolean;
  onOpenDeposit?: () => void;
  onOpenProfile: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenInvite?: () => void;
  onOpenReward?: () => void;
  lang: 'bn' | 'en';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  isLoggedIn,
  onOpenProfile,
  onOpenAuth,
  onOpenInvite,
  onOpenReward,
  lang,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#e0efe6] flex items-center justify-between py-1 px-1 shadow-[0_-4px_20px_rgba(0,120,60,0.08)] select-none w-full max-w-full"
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => setCurrentTab('hot')}
        className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
          currentTab !== 'promotions'
            ? 'text-[#059669]'
            : 'text-[#1b5e3c] hover:text-[#00a859]'
        }`}
      >
        <Home className="w-5 h-5 stroke-[2.1]" />
        <span className="text-[10px] font-bold leading-none">
          {lang === 'bn' ? 'হোম' : 'Home'}
        </span>
      </button>

      {/* 2. Promotion */}
      <button
        type="button"
        onClick={() => setCurrentTab('promotions')}
        className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
          currentTab === 'promotions'
            ? 'text-[#059669]'
            : 'text-[#1b5e3c] hover:text-[#00a859]'
        }`}
      >
        <Gift className="w-5 h-5 stroke-[2.1]" />
        <span className="text-[10px] font-bold leading-none">
          {lang === 'bn' ? 'প্রমোশন' : 'Promotion'}
        </span>
      </button>

      {/* 3. Center Floating Glowing Emerald Invite Button */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => {
            if (!isLoggedIn) {
              onOpenAuth('register');
            } else if (onOpenInvite) {
              onOpenInvite();
            } else {
              onOpenProfile();
            }
          }}
          className="flex flex-col items-center justify-center -mt-5 min-h-[48px] min-w-[54px] cursor-pointer group focus:outline-hidden"
          aria-label="Invite Friends"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2ad178] via-[#0fb565] to-[#00994d] border-[3px] border-white shadow-[0_0_18px_rgba(0,168,89,0.45)] flex items-center justify-center text-white group-active:scale-95 transition">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-extrabold text-[#059669] mt-0.5 leading-none">
            {lang === 'bn' ? 'আমন্ত্রণ' : 'Invite'}
          </span>
        </button>
      </div>

      {/* 4. Reward */}
      <button
        type="button"
        onClick={() => {
          if (!isLoggedIn) {
            onOpenAuth('login');
          } else if (onOpenReward) {
            onOpenReward();
          } else {
            onOpenProfile();
          }
        }}
        className="flex-1 min-h-[48px] flex flex-col items-center justify-center gap-0.5 text-[#1b5e3c] hover:text-[#00a859] cursor-pointer transition"
      >
        <Trophy className="w-5 h-5 stroke-[2.1]" />
        <span className="text-[10px] font-bold leading-none">
          {lang === 'bn' ? 'রিওয়ার্ড' : 'Reward'}
        </span>
      </button>

      {/* 5. Member */}
      <button
        type="button"
        onClick={() => {
          if (isLoggedIn) {
            onOpenProfile();
          } else {
            onOpenAuth('login');
          }
        }}
        className="flex-1 min-h-[48px] flex flex-col items-center justify-center gap-0.5 text-[#7ab82d] hover:text-[#00a859] cursor-pointer transition"
      >
        <UserIcon className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-bold leading-none">
          {isLoggedIn ? (lang === 'bn' ? 'মেম্বার' : 'Member') : (lang === 'bn' ? 'লগইন' : 'Login')}
        </span>
      </button>
    </nav>
  );
};
