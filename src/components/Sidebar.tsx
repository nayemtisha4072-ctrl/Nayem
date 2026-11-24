/**
 * Sidebar & Mobile Slide-Out Drawer Component
 * - Desktop: Crisp White sidebar with Emerald active navigation states
 * - Mobile Drawer: Exact match to reference Screenshot 1 (/m/home white slide-out drawer)
 *   with Avatar, Username, Default badge, Balance, Deposit & Withdraw buttons,
 *   Promotion / APP Download / VIP / Help Center / Message / Security center / My account,
 *   Bangla | English toggle, and red Logout button.
 */

import React from 'react';
import {
  Home,
  Trophy,
  Spade,
  Sparkles,
  Gamepad2,
  Rocket,
  Fish,
  Layers,
  CircleDot,
  Gift,
  ChevronDown,
  Smartphone,
  Crown,
  Headphones,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { GameCategory, User, Wallet } from '../types';
import { DEFAULT_CLASSIC_AVATAR } from '../utils/avatars';
import type { PersonalCenterTab } from './PersonalCenterModal';

export type NavTab =
  | GameCategory
  | 'hot'
  | 'table'
  | 'crash'
  | 'arcade'
  | 'lotto';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  expanded: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userRole?: string;
  user?: User | null;
  wallet?: Wallet | null;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  onOpenWallet?: (tab: 'deposit' | 'withdraw') => void;
  onOpenPersonalCenter?: (tab?: PersonalCenterTab) => void;
  onOpenRewardHub?: () => void;
  onOpenSupport?: () => void;
  onLogout?: () => void;
  lang: 'bn' | 'en';
  setLang?: (lang: 'bn' | 'en') => void;
}

interface NavItemDef {
  id: NavTab;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
}

export const NAV_ITEMS: NavItemDef[] = [
  { id: 'hot', title: 'Home', icon: Home },
  { id: 'sports', title: 'Sports', icon: Trophy, hasSubmenu: true },
  { id: 'live', title: 'Casino', icon: Spade, hasSubmenu: true },
  { id: 'slots', title: 'Slots', icon: Sparkles, hasSubmenu: true },
  { id: 'table', title: 'Table', icon: Layers, hasSubmenu: true },
  { id: 'crash', title: 'Crash', icon: Rocket, hasSubmenu: true },
  { id: 'fish', title: 'Fishing', icon: Fish, hasSubmenu: true },
  { id: 'arcade', title: 'Arcade', icon: Gamepad2, hasSubmenu: true },
  { id: 'lotto', title: 'Lotto', icon: CircleDot, hasSubmenu: true },
  { id: 'promotions', title: 'Promotions', icon: Gift },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  expanded,
  mobileOpen,
  setMobileOpen,
  user,
  wallet,
  onOpenAuth,
  onOpenWallet,
  onOpenPersonalCenter,
  onOpenRewardHub,
  onOpenSupport,
  onLogout,
  lang,
  setLang,
}) => {
  const handleItemClick = (item: NavItemDef) => {
    setCurrentTab(item.id);
    if (mobileOpen) setMobileOpen(false);
  };

  const balanceTk = wallet ? (wallet.availablePaisa / 100).toFixed(2) : '0.00';
  const avatarSrc = user?.avatarUrl || DEFAULT_CLASSIC_AVATAR;

  const renderDesktopNav = () => {
    return (
      <div className="flex flex-col h-full justify-between py-2.5">
        <div className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                title={item.title}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow-md shadow-emerald-900/15'
                    : 'text-[#284738] hover:bg-[#eaf8f0] hover:text-[#00a859]'
                } ${!expanded ? 'justify-center px-2' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#059669] group-hover:text-[#00a859]'
                    }`}
                  />
                  {expanded && <span>{item.title}</span>}
                </div>

                {expanded && item.hasSubmenu && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-white/80' : 'text-[#6ea889] group-hover:text-[#059669]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const drawerItems = [
    {
      id: 'promotion',
      label: 'Promotion',
      icon: Gift,
      colorClass: 'bg-rose-50 text-rose-500',
      onClick: () => {
        setCurrentTab('promotions');
        setMobileOpen(false);
      },
    },
    {
      id: 'app_download',
      label: 'APP Download',
      icon: Smartphone,
      colorClass: 'bg-sky-50 text-sky-600',
      onClick: () => {
        setCurrentTab('promotions');
        setMobileOpen(false);
      },
    },
    {
      id: 'vip',
      label: 'VIP',
      icon: Crown,
      colorClass: 'bg-amber-50 text-amber-600',
      onClick: () => {
        setMobileOpen(false);
        if (!user) {
          onOpenAuth?.('login');
        } else if (onOpenRewardHub) {
          onOpenRewardHub();
        } else {
          onOpenPersonalCenter?.('reward');
        }
      },
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: Headphones,
      colorClass: 'bg-indigo-50 text-indigo-600',
      onClick: () => {
        setMobileOpen(false);
        onOpenSupport?.();
      },
    },
    {
      id: 'message',
      label: 'Message',
      icon: MessageSquare,
      colorClass: 'bg-cyan-50 text-cyan-600',
      onClick: () => {
        setMobileOpen(false);
        if (!user) onOpenAuth?.('login');
        else onOpenPersonalCenter?.('messages');
      },
    },
    {
      id: 'security',
      label: 'Security center',
      icon: ShieldCheck,
      colorClass: 'bg-emerald-50 text-[#059669]',
      onClick: () => {
        setMobileOpen(false);
        if (!user) onOpenAuth?.('login');
        else onOpenPersonalCenter?.('security');
      },
    },
    {
      id: 'account',
      label: 'My account',
      icon: UserCheck,
      colorClass: 'bg-amber-50 text-amber-500',
      onClick: () => {
        setMobileOpen(false);
        if (!user) onOpenAuth?.('login');
        else onOpenPersonalCenter?.('account');
      },
    },
  ];

  return (
    <>
      {/* Desktop Sticky White Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white border-r border-[#dceee3] transition-all duration-200 z-30 sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar shadow-xs ${
          expanded ? 'w-48' : 'w-14'
        }`}
      >
        {renderDesktopNav()}
      </aside>

      {/* Mobile Slide-Out White Member Drawer (Matches Screenshot 1) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="relative w-[82vw] max-w-[320px] h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating circular mint close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="fixed top-12 left-[calc(min(82vw,320px)+8px)] w-8 h-8 rounded-full bg-white text-[#059669] border border-[#cbead8] shadow-lg flex items-center justify-center cursor-pointer z-50"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div>
              {/* Soft Mint Header with User Info */}
              <div className="bg-gradient-to-b from-[#e4f9ee] via-[#f1fcf6] to-white px-4 pt-7 pb-4">
                {user ? (
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenPersonalCenter?.('account');
                      }}
                      className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0 cursor-pointer bg-[#eaf8f0]"
                    >
                      <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-[#182620] truncate">
                          {user.username}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] text-[10px] font-bold">
                          {user.vipLevel || 'Default'}
                        </span>
                      </div>
                      <div className="text-sm font-black text-[#00a859] mt-1 font-mono">
                        ৳ {balanceTk}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-base font-black text-[#182620]">
                      {lang === 'bn' ? 'Fb88baji-তে স্বাগতম' : 'Welcome to Fb88baji'}
                    </div>
                    <p className="text-xs text-[#4b6b5a]">
                      {lang === 'bn'
                        ? 'গেম খেলতে ও রিওয়ার্ড পেতে লগইন বা রেজিস্টার করুন।'
                        : 'Sign up or log in to unlock games and rewards.'}
                    </p>
                  </div>
                )}

                {/* Deposit & Withdraw Side-by-Side Buttons (Matches Screenshot 1) */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      if (!user) onOpenAuth?.('login');
                      else onOpenWallet?.('deposit');
                    }}
                    className="py-2.5 rounded-xl bg-white hover:bg-[#f2faf5] border border-[#bde6cf] text-[#059669] text-sm font-bold shadow-2xs transition cursor-pointer"
                  >
                    {user ? 'Deposit' : lang === 'bn' ? 'লগইন' : 'Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      if (!user) onOpenAuth?.('register');
                      else onOpenWallet?.('withdraw');
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white text-sm font-bold shadow-md shadow-emerald-900/15 transition cursor-pointer"
                  >
                    {user ? 'Withdraw' : lang === 'bn' ? 'রেজিস্টার' : 'Register'}
                  </button>
                </div>
              </div>

              {/* White Rounded Menu Card (Matches Screenshot 1) */}
              <div className="px-4 py-2">
                <div className="bg-white rounded-2xl border border-[#e3efe8] shadow-xs divide-y divide-[#f0f7f3] overflow-hidden">
                  {drawerItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onClick}
                        className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#f4fbf7] text-left transition cursor-pointer"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-[#182620]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Game Categories Strip inside drawer */}
              <div className="px-4 pt-3 pb-2">
                <div className="text-[11px] font-bold text-[#618270] uppercase tracking-wider mb-2 px-1">
                  {lang === 'bn' ? 'গেম ক্যাটাগরি' : 'Categories'}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {NAV_ITEMS.filter((i) => i.id !== 'promotions').map((item) => {
                    const isActive = currentTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`px-2 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition cursor-pointer ${
                          isActive
                            ? 'bg-[#00a859] text-white border-[#00a859]'
                            : 'bg-[#f4fbf7] text-[#182620] border-[#dceee3] hover:bg-[#e5f6ec]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Language Segmented Toggle & Red Logout Button */}
            <div className="p-4 space-y-3 bg-white border-t border-[#eef7f1]">
              {setLang && (
                <div className="bg-[#e8f8ef] rounded-full p-1 grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setLang('bn')}
                    className={`py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      lang === 'bn'
                        ? 'bg-[#10b965] text-white shadow-sm'
                        : 'text-[#059669] hover:bg-white/60'
                    }`}
                  >
                    <span>🇧🇩</span>
                    <span>বাংলা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      lang === 'en'
                        ? 'bg-[#10b965] text-white shadow-sm'
                        : 'text-[#059669] hover:bg-white/60'
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              )}

              {user && onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full py-3 rounded-xl bg-[#ef1a1a] hover:bg-[#d91414] text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  {lang === 'bn' ? 'লগআউট (Logout)' : 'Logout'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
