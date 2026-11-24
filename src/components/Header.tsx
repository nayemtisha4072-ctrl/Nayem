/**
 * Header Component for Fb88baji
 * Crisp White sticky header with Mint/Emerald Green wallet pill, Deposit CTA,
 * Avatar menu dropdown, and quick language toggle.
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
  Home as HomeIcon,
  Gift,
} from 'lucide-react';
import { User, Wallet } from '../types';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { PersonalCenterTab } from './PersonalCenterModal';
import { DEFAULT_CLASSIC_AVATAR } from '../utils/avatars';

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
  onOpenBonus?: () => void;
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
  onOpenPersonalCenter,
  onOpenBonus,
  onLogout,
  onRefreshWallet,
  onSelectCategory,
  unreadCount = 0,
  lang,
  setLang,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const avatarSrc = user?.avatarUrl || DEFAULT_CLASSIC_AVATAR;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#dff0e6] shadow-xs select-none">
      <div className="w-full max-w-full px-2.5 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2 relative">
        {/* Left: Mobile hamburger, Home button, Sidebar collapse [<], and Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-[#eaf8f0] hover:bg-[#d8f3e4] text-[#059669] border border-[#cbead8] shrink-0 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('hot');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#00a859] hover:bg-[#00944d] text-white font-extrabold text-xs shadow-sm transition active:scale-95 cursor-pointer shrink-0"
          >
            <HomeIcon className="w-3.5 h-3.5 text-white" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden lg:flex w-7 h-7 rounded-full bg-[#eaf8f0] hover:bg-[#d5f2e1] border border-[#cbead8] text-[#059669] items-center justify-center text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
            title={sidebarExpanded ? 'স্লাইডবার ছোট করুন' : 'স্লাইডবার বড় করুন'}
          >
            {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div
            onClick={() => {
              if (onSelectCategory) onSelectCategory('hot');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer shrink-0 flex items-center"
          >
            <Fb88BajiLogo size="sm" variant="light" />
          </div>
        </div>

        {/* Right Section: Deposit, Wallet Pill, Avatar & Language Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => onOpenWallet('deposit')}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-black text-[11px] sm:text-xs flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5 text-white" />
                <span>Deposit</span>
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-[#eaf8f0] border border-[#c7ebd6] text-[#0b4f2f] shrink-0">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className={`text-[#059669] hover:text-[#047857] transition p-0.5 shrink-0 cursor-pointer ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <span className="hidden md:inline text-[11px] font-semibold text-[#3e6b54]">
                  Wallet
                </span>
                <span className="text-[11px] sm:text-xs font-black font-mono text-[#064e3b] tracking-tight">
                  ৳{balanceTk}
                </span>
              </div>

              {/* User Avatar Circle with Notification Badge */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                  className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#eaf8f0] hover:bg-[#d6f2e2] border-2 border-[#00a859]/60 flex items-center justify-center text-[#059669] transition active:scale-95 cursor-pointer shadow-xs overflow-hidden"
                  aria-label="User Profile Menu"
                >
                  {user.avatarUrl ? (
                    <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#ef1a1a] border border-white text-[8px] sm:text-[9px] font-black text-white flex items-center justify-center shadow">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[9998] bg-black/40 sm:hidden"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-1.5 sm:mt-2 w-[calc(100vw-16px)] sm:w-64 max-w-sm rounded-2xl bg-white border border-[#dceee3] shadow-2xl overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col text-[#182620]">
                      <div className="p-4 border-b border-[#eaf5ee] bg-gradient-to-b from-[#e8f9ef] to-white flex items-center justify-between shrink-0">
                        <div
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('account');
                          }}
                          className="cursor-pointer group"
                        >
                          <div className="text-sm font-black text-[#182620] tracking-tight group-hover:text-[#00a859] transition">
                            {user.username || 'Player'}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-[#059669]">
                            <span className="text-[#527060]">VIP Points</span>
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
                              <RefreshCw className={`w-3 h-3 text-[#059669] hover:rotate-180 transition ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(false)}
                          className="sm:hidden w-7 h-7 rounded-full bg-[#eaf8f0] text-[#059669] flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="py-1.5 text-xs font-semibold text-[#182620] overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenWallet('deposit');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <WalletIcon className="w-4 h-4 text-[#00a859]" />
                          <span>Deposit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenWallet('withdraw');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Withdrawal</span>
                        </button>

                        {onOpenBonus && (
                          <button
                            type="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              onOpenBonus();
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                          >
                            <Gift className="w-4 h-4 text-[#00a859]" />
                            <span>Bonus &amp; Rewards</span>
                          </button>
                        )}

                        <div className="my-1 border-t border-[#eef7f1]" />

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('betting');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <ClipboardList className="w-4 h-4 text-[#00a859]" />
                          <span>Betting Records</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('records');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                          <span>Account Statement</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('records');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <Receipt className="w-4 h-4 text-teal-600" />
                          <span>Transaction Records</span>
                        </button>

                        <div className="my-1 border-t border-[#eef7f1]" />

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('account');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4 text-[#00a859]" />
                          <span>Personal Info</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('account');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenPersonalCenter('invite');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f2faf5] text-left transition cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-teal-600" />
                          <span>Referral</span>
                        </button>

                        <div className="my-1 border-t border-[#eef7f1]" />

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-left transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>{lang === 'bn' ? 'লগআউট' : 'Log out'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#eaf8f0] hover:bg-[#d8f3e4] border border-[#cbead8] text-[#0b4f2f] text-[11px] sm:text-xs font-bold transition cursor-pointer select-none active:scale-95 shrink-0"
                title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
              >
                <span>{lang === 'bn' ? '🇧🇩' : '🇬🇧'}</span>
                <span className="text-[#059669] font-extrabold">{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#f2faf5] border border-[#bfe6cf] text-[#059669] text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer shadow-2xs"
              >
                {lang === 'bn' ? 'লগইন' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white text-xs font-black shadow-sm hover:brightness-105 transition whitespace-nowrap active:scale-95 cursor-pointer"
              >
                {lang === 'bn' ? 'রেজিস্টার' : 'Register'}
              </button>
              <button
                type="button"
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#eaf8f0] hover:bg-[#d8f3e4] border border-[#cbead8] text-[#0b4f2f] text-[11px] sm:text-xs font-bold transition cursor-pointer select-none active:scale-95 shrink-0"
                title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
              >
                <span>{lang === 'bn' ? '🇧🇩' : '🇬🇧'}</span>
                <span className="text-[#059669] font-extrabold">{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
