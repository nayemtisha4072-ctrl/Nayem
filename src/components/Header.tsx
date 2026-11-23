/**
 * Header Component for Banglabaji
 * Matches Screenshot_6 & Screenshot_7:
 * - Magenta header background (#520024)
 * - Pink "Home" button + Sidebar collapse toggle [<]
 * - "BB Banglabaji" official brand logo
 * - Golden "Deposit" button
 * - Dark "Main Wallet ৳100.00" pill with refresh button
 * - Avatar circle with notification badge '1'
 * - Bangladesh Flag circle (Green with red dot)
 * - Dropdown menu matching Screenshot_7 (Dark slate card with gold VIP points, Deposit, Withdrawal, Betting Records, Account Statement, Transaction Records, Personal Info, Reset Password, Referral, Log out)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  CreditCard,
  RefreshCw,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Wallet as WalletIcon,
  Banknote,
  ClipboardList,
  FileSpreadsheet,
  Receipt,
  UserCheck,
  KeyRound,
  Users,
  LogOut,
  Sparkles,
  Home as HomeIcon,
} from 'lucide-react';
import { User, Wallet } from '../types';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { PersonalCenterTab } from './PersonalCenterModal';

interface HeaderProps {
  user: User | null;
  wallet: Wallet | null;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenWallet: (tab: 'deposit' | 'withdraw') => void;
  onOpenProfile: () => void;
  onOpenPersonalCenter: (tab?: PersonalCenterTab) => void;
  onOpenLedger: () => void;
  onLogout: () => void;
  onRefreshWallet: () => void;
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
  unreadCount?: number;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  wallet,
  sidebarExpanded,
  setSidebarExpanded,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenAuth,
  onOpenWallet,
  onOpenProfile,
  onOpenPersonalCenter,
  onOpenLedger,
  onLogout,
  onRefreshWallet,
  onSelectCategory,
  activeCategory = 'hot',
  unreadCount = 0,
  lang,
  setLang,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    onRefreshWallet();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const balanceTk = wallet ? (wallet.availablePaisa / 100).toFixed(2) : '0.00';
  const vipPoints = ((user?.turnoverPaisa || 0) / 10000).toFixed(2);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#520024] border-b border-[#780036] shadow-lg select-none">
      <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-2 relative">
        {/* Left: Mobile hamburger, Home button, Sidebar collapse [<], and Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-[#6e0030] text-white border border-[#940042] shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Desktop "Home" Button (Matches Screenshot_6) */}
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('hot');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#940040] hover:bg-[#a80048] border border-[#cf005c] text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer shrink-0"
          >
            <HomeIcon className="w-3.5 h-3.5 text-white" />
            <span>Home</span>
          </button>

          {/* Sidebar Collapse Toggle [<] (Matches Screenshot_6) */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden lg:flex w-7 h-7 rounded-full bg-[#6e0030] hover:bg-[#85003a] border border-[#a30048] text-white items-center justify-center text-xs font-bold transition shadow shrink-0"
            title={sidebarExpanded ? 'স্লাইডবার ছোট করুন' : 'স্লাইডবার বড় করুন'}
          >
            {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Brand Logo: Single clean component prevents duplicate logo on mobile */}
          <div
            onClick={() => {
              if (onSelectCategory) onSelectCategory('hot');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer shrink-0 flex items-center"
          >
            <Fb88BajiLogo size="sm" />
          </div>
        </div>

        {/* Right Section: Deposit, Wallet Pill, Avatar & Bangladesh Flag */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {user ? (
            <>
              {/* Golden Deposit Button (Matches Screenshot_6) */}
              <button
                onClick={() => onOpenWallet('deposit')}
                className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl gold-accent-btn font-black text-[11px] sm:text-xs flex items-center gap-1 shadow-md active:scale-95 transition cursor-pointer shrink-0"
              >
                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-900" />
                <span>Deposit</span>
              </button>

              {/* Main Wallet Balance Pill (Matches Screenshot_6) */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#162320] border border-[#273a36] shadow-inner text-white shrink-0">
                <button
                  onClick={handleManualRefresh}
                  className={`text-slate-400 hover:text-white transition p-0.5 shrink-0 ${
                    isRefreshing ? 'animate-spin text-amber-400' : ''
                  }`}
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <span className="hidden md:inline text-[11px] font-semibold text-slate-300">
                  Main Wallet
                </span>
                <span className="text-[11px] sm:text-xs font-black font-mono text-white tracking-tight">
                  ৳{balanceTk}
                </span>
              </div>

              {/* User Avatar Circle with Notification Badge (Matches Screenshot_6 & Screenshot_18) */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                  className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/80 flex items-center justify-center text-white transition active:scale-95 cursor-pointer shadow"
                  aria-label="User Profile Menu"
                >
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#f42a41] border border-white text-[8px] sm:text-[9px] font-black text-white flex items-center justify-center shadow">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown Menu (Matches Screenshot_7 & Screenshot_18) */}
                {dropdownOpen && (
                  <>
                    {/* Mobile backdrop */}
                    <div
                      className="fixed inset-0 z-[9998] bg-black/60 sm:hidden"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-1.5 sm:mt-2 w-[calc(100vw-16px)] sm:w-64 max-w-sm rounded-2xl bg-[#192422] border border-[#283b37] shadow-2xl overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
                      {/* Header: Username & VIP Points */}
                      <div className="p-4 border-b border-[#283b37] bg-[#141e1c] flex items-center justify-between shrink-0">
                        <div
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('account');
                          }}
                          className="cursor-pointer group"
                        >
                          <div className="text-sm font-black text-white tracking-tight group-hover:text-amber-300 transition">
                            {user.username || 'Player'}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-amber-400">
                            <span className="text-slate-300">VIP Points</span>
                            <span className="font-mono">{vipPoints}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManualRefresh();
                              }}
                              className="cursor-pointer"
                              aria-label="Refresh Wallet"
                            >
                              <RefreshCw className={`w-3 h-3 text-amber-400/80 hover:rotate-180 transition ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => setDropdownOpen(false)}
                          className="sm:hidden w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Menu Items (Matches Screenshot_7 & Screenshot_18) */}
                      <div className="py-2 text-xs font-semibold text-slate-200 overflow-y-auto">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenWallet('deposit');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <WalletIcon className="w-4 h-4 text-emerald-400" />
                          <span>Deposit</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenWallet('withdraw');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <Banknote className="w-4 h-4 text-teal-400" />
                          <span>Withdrawal</span>
                        </button>

                        <div className="my-1 border-t border-[#283b37]" />

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('betting');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <ClipboardList className="w-4 h-4 text-emerald-400" />
                          <span>Betting Records</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('records');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                          <span>Account Statement</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('records');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <Receipt className="w-4 h-4 text-teal-400" />
                          <span>Transaction Records</span>
                        </button>

                        <div className="my-1 border-t border-[#283b37]" />

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('account');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>Personal Info</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('account');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-amber-400" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('invite');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#20302d] text-left transition cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-teal-400" />
                          <span>Referral</span>
                        </button>

                        <div className="my-1 border-t border-[#283b37]" />

                        {/* Red Logout Button with Clear Icon */}
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-left transition cursor-pointer border-t border-rose-500/20"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>{lang === 'bn' ? 'লগআউট' : 'Log out'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Language Switcher button (Interactive translation toggle between Bengali & English) */}
              <button
                type="button"
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#6e0030] hover:bg-[#85003a] border border-[#a30048] text-white text-[11px] sm:text-xs font-bold transition cursor-pointer select-none active:scale-95 shadow-xs shrink-0"
                title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
              >
                <span>{lang === 'bn' ? '🇧🇩' : '🇬🇧'}</span>
                <span className="text-amber-300 font-extrabold">{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-[#6e0030] hover:bg-[#85003a] border border-[#a30048] text-white text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer shadow-sm"
              >
                {lang === 'bn' ? 'লগইন' : 'Login'}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl gold-accent-btn text-slate-950 text-xs font-black shadow-md hover:brightness-110 transition whitespace-nowrap active:scale-95 cursor-pointer"
              >
                {lang === 'bn' ? 'রেজিস্টার' : 'Register'}
              </button>
              {/* Interactive Language Switcher Toggle */}
              <button
                type="button"
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#6e0030] hover:bg-[#85003a] border border-[#a30048] text-white text-[11px] sm:text-xs font-bold transition cursor-pointer select-none active:scale-95 shadow-xs shrink-0"
                title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
              >
                <span>{lang === 'bn' ? '🇧🇩' : '🇬🇧'}</span>
                <span className="text-amber-300 font-extrabold">{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
