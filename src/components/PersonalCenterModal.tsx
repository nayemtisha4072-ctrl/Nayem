/**
 * Personal Center Modal Component
 * Matches Screenshot_13 & Screenshot_12:
 * - Left Navigation: My Account, Deposit, Withdrawal, Betting Record, Account Record, Profit And Loss, Reward Center, Invite Friends, Mission, Internal Message
 * - Profile Card: Avatar, VIP Default badge, Full Name, Joined date, Username, Balance, Processing counters, Last Login Time & IP
 * - Security Score Widget: High / 100 points circular badge that flips to 100% when all details are filled!
 * - Security Setup Actions: Personal Information, Login password, Link E-wallet, Transaction Password, Logout
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  FileText,
  PieChart,
  Gift,
  Users,
  Award,
  Mail,
  Edit2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  Power,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Globe,
  Share2,
} from 'lucide-react';
import { User, Wallet, PaymentMethod } from '../types';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { BkashLogo, NagadLogo, RocketLogo } from './BrandLogos';
import { safeApiFetch } from '../utils/api';
import { WeeklyBettingChart, DailyPerformancePoint } from './WeeklyBettingChart';

export type PersonalCenterTab =
  | 'account'
  | 'deposit'
  | 'withdrawal'
  | 'betting'
  | 'records'
  | 'pnl'
  | 'reward'
  | 'invite'
  | 'mission'
  | 'messages';

interface PersonalCenterModalProps {
  user: User | null;
  wallet: Wallet | null;
  initialTab?: PersonalCenterTab;
  onClose: () => void;
  onRefreshWallet: () => void;
  onUserUpdate: (updatedUser: User) => void;
  onLogout: () => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onOpenReferral?: () => void;
  onUnreadCountChange?: (count: number) => void;
  lang: 'bn' | 'en';
}

export const PersonalCenterModal: React.FC<PersonalCenterModalProps> = ({
  user,
  wallet,
  initialTab = 'account',
  onClose,
  onRefreshWallet,
  onUserUpdate,
  onLogout,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenReferral,
  onUnreadCountChange,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<PersonalCenterTab>(initialTab);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sub-dialogs for security actions
  const [editDialog, setEditDialog] = useState<
    'none' | 'personalInfo' | 'password' | 'ewallet' | 'transactionPin' | 'avatar'
  >('none');
  const [bettingViewMode, setBettingViewMode] = useState<'table' | 'chart'>('table');

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male');
  const [ewalletProvider, setEwalletProvider] = useState<PaymentMethod>(
    user?.linkedEwalletProvider || 'bkash'
  );
  const [ewalletNumber, setEwalletNumber] = useState(user?.linkedEwalletNumber || '');
  const [transactionPin, setTransactionPin] = useState(user?.transactionPin || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Summary data from backend
  const [centerData, setCenterData] = useState<{
    securityScore: number;
    securityLevel: 'Low' | 'Medium' | 'High';
    isOptimal: boolean;
    processingDeposits: number;
    processingWithdrawals: number;
    bettingRecords: any[];
    accountRecords: any[];
    weeklyPerformance?: DailyPerformancePoint[];
    pnl: {
      totalBetTk: number;
      totalWonTk: number;
      netPnlTk: number;
      winRate: number;
      totalBets: number;
    };
    missions: any[];
    internalMessages: any[];
    rewardAvailable: boolean;
    rewardAmountTk: number;
  }>({
    securityScore: 25,
    securityLevel: 'Low',
    isOptimal: false,
    processingDeposits: user?.depositProcessingCount || 0,
    processingWithdrawals: user?.withdrawalProcessingCount || 0,
    bettingRecords: [],
    accountRecords: [],
    weeklyPerformance: [],
    pnl: { totalBetTk: 0, totalWonTk: 0, netPnlTk: 0, winRate: 0, totalBets: 0 },
    missions: [],
    internalMessages: [],
    rewardAvailable: false,
    rewardAmountTk: 18.88,
  });

  // Calculate live score locally
  const computeScore = () => {
    let score = 0;
    const hasName = Boolean(fullName && fullName.trim().length > 2);
    const hasContact = Boolean(email || user?.mobile);
    const hasBday = Boolean(birthday);
    if (hasName && hasContact && hasBday) score += 25;
    if (user?.loginPasswordSet !== false) score += 25;
    if (ewalletNumber && ewalletNumber.length >= 10) score += 25;
    if ((transactionPin && transactionPin.length >= 4) || user?.transactionPasswordSet) score += 25;
    return score;
  };

  const currentScore = computeScore();
  const isHighOptimal = currentScore === 100;

  // Fetch full records from backend
  const fetchPersonalCenterData = async () => {
    if (!user?.sessionToken) return;
    try {
      const res = await safeApiFetch<any>('/api/v1/user/personal-center', {
        headers: { Authorization: `Bearer ${user.sessionToken}` },
      });
      if (res.ok && res.data) {
        setCenterData(res.data);
        if (onUnreadCountChange && Array.isArray(res.data.internalMessages)) {
          onUnreadCountChange(res.data.internalMessages.filter((m: any) => !m.read).length);
        }
        if (res.data.user) {
          onUserUpdate(res.data.user);
        }
      }
    } catch (err) {
      console.error('Fetch personal center data error:', err);
    }
  };

  useEffect(() => {
    fetchPersonalCenterData();
  }, [user?.sessionToken]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshWallet();
    await fetchPersonalCenterData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCopyUsername = () => {
    if (!user?.username) return;
    navigator.clipboard?.writeText(user.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save profile updates
  const handleSaveProfile = async (payload: any) => {
    setFormMsg(null);
    try {
      const res = await safeApiFetch<any>('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.sessionToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok && res.data) {
        setFormMsg({ type: 'success', text: res.data.message || 'Updated successfully!' });
        if (res.data.user) onUserUpdate(res.data.user);
        await fetchPersonalCenterData();
        setTimeout(() => {
          setEditDialog('none');
          setFormMsg(null);
        }, 1200);
      } else {
        setFormMsg({ type: 'error', text: res.error || 'Failed to update.' });
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message || 'Network error.' });
    }
  };

  // Claim Daily Reward
  const handleClaimReward = async () => {
    setBannerFeedback(null);
    try {
      const res = await safeApiFetch<any>('/api/v1/user/reward/claim', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user?.sessionToken}` },
      });
      if (res.ok && res.data) {
        setCenterData((prev) => ({ ...prev, rewardAvailable: false }));
        onRefreshWallet();
        setBannerFeedback({ type: 'success', text: res.data.message || 'Reward claimed!' });
      } else {
        setBannerFeedback({ type: 'error', text: res.error || 'Could not claim reward.' });
      }
    } catch (err: any) {
      setBannerFeedback({ type: 'error', text: err.message || 'Network error.' });
    }
  };

  // Claim Mission
  const handleClaimMission = async (missionId: string, rewardTk: number) => {
    setBannerFeedback(null);
    try {
      const res = await safeApiFetch<any>('/api/v1/user/mission/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.sessionToken}`,
        },
        body: JSON.stringify({ missionId, rewardTk }),
      });
      if (res.ok && res.data) {
        setCenterData((prev) => ({
          ...prev,
          missions: prev.missions.map((m) =>
            m.id === missionId ? { ...m, claimed: true } : m
          ),
        }));
        onRefreshWallet();
        setBannerFeedback({ type: 'success', text: res.data.message || 'Mission reward claimed!' });
      } else {
        setBannerFeedback({ type: 'error', text: res.error || 'Could not claim mission reward.' });
      }
    } catch (err: any) {
      setBannerFeedback({ type: 'error', text: err.message || 'Network error.' });
    }
  };

  // Mark internal message as read
  const handleMarkMessageRead = async (messageId: string) => {
    if (!user?.sessionToken) return;
    setCenterData((prev) => {
      const updated = prev.internalMessages.map((m) =>
        m.id === messageId ? { ...m, read: true } : m
      );
      if (onUnreadCountChange) {
        onUnreadCountChange(updated.filter((m) => !m.read).length);
      }
      return { ...prev, internalMessages: updated };
    });
    try {
      await safeApiFetch<any>('/api/v1/user/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ messageId }),
      });
    } catch {
      // ignore background error
    }
  };

  const availableTk = ((wallet?.availablePaisa || 0) / 100).toFixed(2);
  const avatarImage =
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  const claimableMissionsCount = centerData.missions.filter((m) => m.completed && !m.claimed).length;
  const unreadMessagesCount = centerData.internalMessages.filter((m) => !m.read).length;

  const menuItems = [
    { id: 'account', labelBn: 'আমার অ্যাকাউন্ট', labelEn: 'My Account', icon: UserIcon },
    { id: 'deposit', labelBn: 'ডিপোজিট', labelEn: 'Deposit', icon: CreditCard },
    { id: 'withdrawal', labelBn: 'উইথড্রয়াল', labelEn: 'Withdrawal', icon: ArrowUpRight },
    { id: 'betting', labelBn: 'বেটিং রেকর্ড', labelEn: 'Betting Record', icon: ClipboardList },
    { id: 'records', labelBn: 'অ্যাকাউন্ট রেকর্ড', labelEn: 'Account Record', icon: FileText },
    { id: 'pnl', labelBn: 'লাভ ও ক্ষতি', labelEn: 'Profit And Loss', icon: PieChart },
    {
      id: 'reward',
      labelBn: 'রিওয়ার্ড সেন্টার',
      labelEn: 'Reward Center',
      icon: Gift,
      badge: centerData.rewardAvailable ? 1 : undefined,
    },
    { id: 'invite', labelBn: 'বন্ধু আমন্ত্রণ', labelEn: 'Invite Friends', icon: Users },
    {
      id: 'mission',
      labelBn: 'মিশন',
      labelEn: 'Mission',
      icon: Award,
      badge: claimableMissionsCount > 0 ? claimableMissionsCount : undefined,
    },
    {
      id: 'messages',
      labelBn: 'অভ্যন্তরীণ বার্তা',
      labelEn: 'Internal Message',
      icon: Mail,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Container - Responsive layout matching Screenshot_13 */}
      <div className="relative w-full max-w-5xl bg-[#750035] border border-[#940042] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row my-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#61002a] hover:bg-[#940042] text-slate-300 hover:text-white flex items-center justify-center border border-[#940042] transition"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT SIDEBAR: Personal Center Menu */}
        <aside className="w-full md:w-64 bg-[#61002a] border-b md:border-b-0 md:border-r border-[#940042] p-4 flex flex-col shrink-0">
          <div className="pb-3 border-b border-[#940042] mb-3 space-y-2">
            <Fb88BajiLogo size="xs" className="scale-95 origin-left" />
            <div>
              <h2 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {lang === 'bn' ? 'পার্সোনাল সেন্টার' : 'Personal Center'}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'bn' ? 'অ্যাকাউন্ট ও নিরাপত্তা ব্যবস্থাপনা' : 'Account & Security Center'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'deposit') {
                      onClose();
                      onOpenDeposit();
                    } else if (item.id === 'withdrawal') {
                      onClose();
                      onOpenWithdrawal();
                    } else {
                      setActiveTab(item.id as PersonalCenterTab);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#940042] text-white shadow-sm font-black'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#750035]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                  </div>

                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT / MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#750035] space-y-6">
          {bannerFeedback && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 ${
                bannerFeedback.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}
            >
              <span>{bannerFeedback.text}</span>
              <button
                type="button"
                onClick={() => setBannerFeedback(null)}
                className="text-current opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: MY ACCOUNT (Screenshot_13) */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Top Row: User Card + High Security Gauge (Screenshot_13 layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. User Profile Info Card (Left-Center) */}
                <div className="lg:col-span-6 bg-[#47001f] border border-[#940042] rounded-2xl p-5 shadow-lg relative flex flex-col justify-between">
                  <div>
                    {/* Avatar & VIP info */}
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <img
                          src={avatarImage}
                          alt="User avatar"
                          className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/80 shadow-md"
                        />
                        <button
                          onClick={() => setEditDialog('avatar')}
                          className="absolute bottom-0 right-0 p-1 bg-amber-400 text-slate-950 rounded-full hover:brightness-110 shadow transition"
                          title="Change avatar"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#61002a] border border-[#940042] text-[10px] font-bold text-amber-300 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            {user?.vipLevel || 'Default'}
                          </span>
                          <Gift className="w-3.5 h-3.5 text-amber-400" />
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <h3 className="text-base font-extrabold text-white tracking-wide">
                            {user?.fullName || fullName}
                          </h3>
                          <button
                            onClick={() => setEditDialog('personalInfo')}
                            className="text-slate-400 hover:text-amber-400 transition"
                            title="Edit Name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium">
                          Joined {user?.createdAt ? user.createdAt.substring(0, 10) : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Username with Copy */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#940042]">
                      <span className="text-xs text-slate-400 font-medium">Username:</span>
                      <span className="text-xs font-bold text-slate-200">{user?.username || 'Player'}</span>
                      <button
                        onClick={handleCopyUsername}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded transition flex items-center gap-1 text-[10px]"
                        title="Copy username"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied && <span className="text-emerald-400">Copied</span>}
                      </button>
                    </div>

                    {/* Balance with Refresh & Show/Hide Eye */}
                    <div className="mt-4 p-3 rounded-xl bg-[#61002a] border border-[#940042] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-amber-400">৳</span>
                        <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                          {showBalance ? availableTk : '••••••'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        <button
                          onClick={handleRefresh}
                          className={`p-1.5 hover:text-white rounded-lg hover:bg-[#47001f] transition ${
                            refreshing ? 'animate-spin text-amber-400' : ''
                          }`}
                          title="Refresh balance"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowBalance(!showBalance)}
                          className="p-1.5 hover:text-white rounded-lg hover:bg-[#47001f] transition"
                          title={showBalance ? 'Hide balance' : 'Show balance'}
                        >
                          {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Processing Requests Status */}
                    <div className="space-y-2 mt-4 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#750035] text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>{centerData.processingDeposits} deposit request processing.</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString('en-GB')}</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#750035] text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                          <span>{centerData.processingWithdrawals} withdrawal request processing.</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Last Login Meta */}
                  <div className="mt-4 pt-3 border-t border-[#940042] text-[11px] text-slate-400 space-y-0.5">
                    <p>Last Login Time: {user?.lastLoginTime || '—'}</p>
                    <p>Last Login IP: {user?.lastLoginIp || '—'}</p>
                  </div>
                </div>

                {/* 2. Security Score Center Gauge (Screenshot_13 Center) */}
                <div
                  className={`lg:col-span-6 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between text-center border transition-all duration-500 ${
                    isHighOptimal
                      ? 'bg-gradient-to-b from-[#10B981]/25 via-[#064E3B]/20 to-[#61002a] border-emerald-500/40 shadow-emerald-500/10'
                      : 'bg-[#47001f] border-[#940042]'
                  }`}
                >
                  <div className="w-full flex justify-between items-center text-xs text-slate-300 font-semibold mb-2">
                    <span>{lang === 'bn' ? 'অ্যাকাউন্ট সিকিউরিটি লেভেল' : 'Account Security'}</span>
                    <span className="text-amber-400 text-[11px]">
                      {currentScore === 100
                        ? (lang === 'bn' ? 'সম্পূর্ণ নিরাপদ' : '100% Protected')
                        : `${currentScore}/100 points`}
                    </span>
                  </div>

                  {/* Circular Security Gauge */}
                  <div className="relative my-4 flex items-center justify-center">
                    {/* Animated Outer Ring */}
                    <div
                      className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 ${
                        isHighOptimal
                          ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-2xl shadow-emerald-500/30'
                          : currentScore >= 50
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-tr from-rose-500 to-red-600'
                      } p-3`}
                    >
                      {/* Inner White/Clean Card */}
                      <div className="w-full h-full rounded-full bg-white text-slate-900 flex flex-col items-center justify-center shadow-inner p-2 select-none">
                        <span
                          className={`text-3xl font-black tracking-tight ${
                            isHighOptimal
                              ? 'text-emerald-600'
                              : currentScore >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {isHighOptimal ? 'High' : currentScore >= 50 ? 'Medium' : 'Low'}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 mt-0.5">
                          Security Level
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Text and Description */}
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-white">
                      Score is <span className="text-emerald-400 font-mono text-lg">{currentScore}</span> points
                    </p>
                    <p className="text-xs text-slate-300">
                      {isHighOptimal
                        ? 'Your account security level is High'
                        : 'Complete all 4 items below to achieve 100 points optimal score!'}
                    </p>
                  </div>

                  {/* Status Pill */}
                  <div className="mt-4 w-full">
                    {isHighOptimal ? (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Currently the optimal setting</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!user?.fullName || !birthday) setEditDialog('personalInfo');
                          else if (!ewalletNumber) setEditDialog('ewallet');
                          else if (!transactionPin) setEditDialog('transactionPin');
                        }}
                        className="w-full py-2.5 px-4 rounded-xl gold-gradient text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow hover:brightness-110 transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === 'bn' ? '১০০ পয়েন্ট ফিলাপ করুন' : 'Complete 100 Points Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Security Checklist Items (Screenshot_13 Right List) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  {lang === 'bn' ? 'নিরাপত্তা কনফিগারেশন চেকলিস্ট' : 'Security Configuration Checklist'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* 1. Personal Information */}
                  <div
                    onClick={() => setEditDialog('personalInfo')}
                    className="p-4 rounded-2xl bg-[#47001f] hover:bg-[#2A314D] border border-[#940042] flex items-center justify-between cursor-pointer transition group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                            Personal Information
                          </span>
                          {fullName && birthday && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          Complete the personal information to improve your account security.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
                  </div>

                  {/* 2. Login Password */}
                  <div
                    onClick={() => setEditDialog('password')}
                    className="p-4 rounded-2xl bg-[#47001f] hover:bg-[#2A314D] border border-[#940042] flex items-center justify-between cursor-pointer transition group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                            Login password
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          Recommended password with combination of letters and numbers.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
                  </div>

                  {/* 3. Link E-wallet */}
                  <div
                    onClick={() => setEditDialog('ewallet')}
                    className="p-4 rounded-2xl bg-[#47001f] hover:bg-[#2A314D] border border-[#940042] flex items-center justify-between cursor-pointer transition group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-pink-300 transition">
                            Link E-wallet
                          </span>
                          {ewalletNumber && ewalletNumber.length >= 10 && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          Link E-wallet (bKash/Nagad/Rocket) for fast withdrawal.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
                  </div>

                  {/* 4. Transaction Password */}
                  <div
                    onClick={() => setEditDialog('transactionPin')}
                    className="p-4 rounded-2xl bg-[#47001f] hover:bg-[#2A314D] border border-[#940042] flex items-center justify-between cursor-pointer transition group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600/20 text-amber-500 flex items-center justify-center">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                            Transaction Password
                          </span>
                          {transactionPin && transactionPin.length >= 4 && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          6-digit PIN used to verify your identity for any fund operation.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
                  </div>
                </div>

                {/* 5. Logout Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition"
                  >
                    <Power className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'নিরাপদে লগআউট করুন' : 'Logout Safely'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BETTING RECORD */}
          {activeTab === 'betting' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {lang === 'bn' ? 'বেটিং রেকর্ড ও পারফরম্যান্স' : 'Betting Records & Performance'}
                  </h3>
                  <span className="text-xs text-slate-400">Total: {centerData.bettingRecords.length} bets</span>
                </div>

                <div className="flex items-center gap-1 bg-[#47001f] p-1 rounded-xl border border-[#940042] self-start sm:self-auto">
                  <button
                    onClick={() => setBettingViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      bettingViewMode === 'table'
                        ? 'bg-[#940042] text-white shadow font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'টেবিল রেকর্ড' : 'Table View'}</span>
                  </button>
                  <button
                    onClick={() => setBettingViewMode('chart')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      bettingViewMode === 'chart'
                        ? 'bg-[#940042] text-white shadow font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'D3 চার্ট বিশ্লেষণ' : 'D3 Chart Analytics'}</span>
                  </button>
                </div>
              </div>

              {bettingViewMode === 'chart' ? (
                <WeeklyBettingChart
                  data={centerData.weeklyPerformance}
                  bettingRecords={centerData.bettingRecords}
                  pnlSummary={centerData.pnl}
                  lang={lang}
                />
              ) : centerData.bettingRecords.length === 0 ? (
                <div className="p-8 text-center bg-[#47001f] rounded-2xl border border-[#940042] text-slate-400 space-y-2">
                  <ClipboardList className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="text-xs">
                    {lang === 'bn'
                      ? 'এখনো কোনো বেট প্লেস করা হয়নি। স্পোর্টস বা ক্যাসিনো উপভোগ করুন।'
                      : 'No bets recorded yet. Place bets on sportsbook or casino games.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-[#61002a] text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Market</th>
                        <th className="p-2.5">Stake</th>
                        <th className="p-2.5">Odds</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#940042]">
                      {centerData.bettingRecords.map((b) => (
                        <tr key={b.id} className="hover:bg-[#47001f]">
                          <td className="p-2.5">{b.createdAt?.substring(0, 16)}</td>
                          <td className="p-2.5 font-bold text-white">{b.marketName || b.gameTitle || 'Match'}</td>
                          <td className="p-2.5 font-mono">৳{(b.stakePaisa / 100).toFixed(2)}</td>
                          <td className="p-2.5 text-amber-400 font-mono">{b.odds}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.status === 'WON'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : b.status === 'LOST'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT RECORD (Statement) */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'bn' ? 'অ্যাকাউন্ট রেকর্ড (লেনদেন বিবরণী)' : 'Account Records'}
                </h3>
              </div>

              {centerData.accountRecords.length === 0 ? (
                <div className="p-8 text-center bg-[#47001f] rounded-2xl border border-[#940042] text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="text-xs">
                    {lang === 'bn' ? 'কোনো লেনদেন রেকর্ড নেই।' : 'No transaction records found.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-[#61002a] text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#940042]">
                      {centerData.accountRecords.map((r, i) => (
                        <tr key={i} className="hover:bg-[#47001f]">
                          <td className="p-2.5">{r.date?.substring(0, 16)}</td>
                          <td className="p-2.5 font-bold text-white">{r.type}</td>
                          <td className="p-2.5 uppercase font-mono">{r.method}</td>
                          <td className="p-2.5 font-mono text-emerald-400 font-bold">
                            ৳{r.amountTk.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#61002a] text-slate-300">
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFIT AND LOSS */}
          {activeTab === 'pnl' && (
            <div className="space-y-6">
              {/* D3.js Line & Area Chart for Weekly Betting Performance and P/L History */}
              <WeeklyBettingChart
                data={centerData.weeklyPerformance}
                bettingRecords={centerData.bettingRecords}
                pnlSummary={centerData.pnl}
                lang={lang}
              />

              {/* Lifetime Balance & P/L Summary Metrics */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>{lang === 'bn' ? 'লাইফটাইম ব্যালেন্স ও টার্নওভার অডিট' : 'Lifetime Audit & Account Metrics'}</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'মোট সেটেলড রাউন্ড: ' : 'Total settled rounds: '}
                    <strong className="text-amber-400 font-mono">{centerData.pnl.totalBets || centerData.bettingRecords.length}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-[#47001f] border border-[#940042]">
                    <span className="text-[11px] text-slate-400">Total Turnover</span>
                    <div className="text-lg font-mono font-bold text-white mt-1">
                      ৳{centerData.pnl.totalBetTk.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#47001f] border border-[#940042]">
                    <span className="text-[11px] text-slate-400">Total Payouts</span>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                      ৳{centerData.pnl.totalWonTk.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#47001f] border border-[#940042]">
                    <span className="text-[11px] text-slate-400">Net Profit</span>
                    <div
                      className={`text-lg font-mono font-bold mt-1 ${
                        centerData.pnl.netPnlTk >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {centerData.pnl.netPnlTk >= 0 ? '+' : ''}৳{centerData.pnl.netPnlTk.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#47001f] border border-[#940042]">
                    <span className="text-[11px] text-slate-400">Win Rate</span>
                    <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                      {centerData.pnl.winRate}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REWARD CENTER */}
          {activeTab === 'reward' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl gold-gradient text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-950 text-[10px] font-black uppercase">
                    DAILY GIFT
                  </span>
                  <h3 className="text-xl font-black mt-1">Daily Login Bonus</h3>
                  <p className="text-xs text-slate-800 mt-0.5">
                    Claim your daily attendance reward of ৳{centerData.rewardAmountTk} today!
                  </p>
                </div>

                <button
                  onClick={handleClaimReward}
                  disabled={!centerData.rewardAvailable}
                  className={`px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition ${
                    centerData.rewardAvailable
                      ? 'bg-slate-950 text-white hover:bg-slate-900 cursor-pointer'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {centerData.rewardAvailable ? 'Claim ৳18.88' : 'Claimed for Today'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: INVITE FRIENDS */}
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {lang === 'bn' ? 'বন্ধু আমন্ত্রণ ও ৩-স্তর রেফারেল কমিশন' : 'Invite Friends & 3-Tier Commissions'}
                  </h3>
                  <p className="text-xs text-rose-200/70 mt-0.5">
                    {lang === 'bn'
                      ? 'Fb88baji-তে ৩ স্তরের আজীবন কমিশন ও সর্বোচ্চ ৳৩,০০,০০০ নগদ রিওয়ার্ড পান!'
                      : 'Earn lifetime 3-tier commissions & up to ৳300,000 milestone prizes!'}
                  </p>
                </div>

                {onOpenReferral && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReferral();
                    }}
                    className="px-4 py-2 rounded-xl gold-gradient text-slate-950 text-xs font-black shadow flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'পূর্ণাঙ্গ রেফারেল হাব' : 'Open Full Hub'}</span>
                  </button>
                )}
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#47001f] border border-[#940042]">
                  <span className="text-[11px] text-slate-400">উত্তোলনযোগ্য ব্যালেন্স</span>
                  <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                    ৳{((user?.referralClaimablePaisa || 0) / 100).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-400">০x টার্নওভার (Withdrawable)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#47001f] border border-[#940042]">
                  <span className="text-[11px] text-slate-400">সর্বমোট কমিশন</span>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    ৳{((user?.referralTotalEarnedPaisa || 0) / 100).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400">আজীবন ৩-স্তর ইনকাম</span>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#47001f] border border-[#940042]">
                  <span className="text-[11px] text-slate-400">রেফারেল কোড</span>
                  <div className="text-base font-mono font-black text-amber-300 mt-1">
                    {user?.referralCode || `REF${user?.username.slice(0, 5).toUpperCase() || 'PLAYER'}88`}
                  </div>
                  <span className="text-[10px] text-amber-400">১ম স্তরে ১.৫% ডিপোজিট</span>
                </div>
              </div>

              {/* Link Box */}
              <div className="p-5 rounded-2xl bg-[#47001f] border border-[#940042] space-y-4">
                <p className="text-xs text-slate-300">
                  {lang === 'bn'
                    ? 'আপনার রেফারেল লিঙ্ক দিয়ে যেকোনো বন্ধুকে জয়েন করান। সে যতবার ডিপোজিট করবে বা গেম খেলবে, আপনি নিয়মিত কমিশন পাবেন।'
                    : 'Share your exclusive link. Earn recurring commissions every time your friends deposit or play.'}
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/register?ref=${user?.referralCode || `REF${user?.username.slice(0, 5).toUpperCase() || 'PLAYER'}88`}`}
                    className="flex-1 bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `${window.location.origin}/register?ref=${user?.referralCode || `REF${user?.username.slice(0, 5).toUpperCase() || 'PLAYER'}88`}`
                      );
                      setCopiedReferral(true);
                      setBannerFeedback({
                        type: 'success',
                        text: lang === 'bn' ? 'রেফারেল লিঙ্ক কপি হয়েছে!' : 'Referral link copied!',
                      });
                      setTimeout(() => setCopiedReferral(false), 2000);
                    }}
                    className="px-4 py-2 rounded-xl gold-gradient text-slate-950 text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer"
                  >
                    {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferral ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {onOpenReferral && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReferral();
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#61002a] hover:bg-[#940042] text-amber-300 hover:text-white border border-[#940042] text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'bn' ? '৩-স্তর কমিশন টেবিল ও ৮টি মাইলস্টোন প্রাইজ দেখুন →' : 'View 3-Tier Rates & 8 Milestone Prizes →'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: MISSION */}
          {activeTab === 'mission' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-white">
                {lang === 'bn' ? 'মিশন ও পুরস্কার' : 'Daily & Weekly Missions'}
              </h3>

              <div className="space-y-3">
                {centerData.missions.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-[#47001f] border border-[#940042] flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{lang === 'bn' ? m.titleBn : m.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'bn' ? m.descBn : m.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-28 h-1.5 rounded-full bg-[#61002a] overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {m.progress}/{m.target}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimMission(m.id, m.rewardTk)}
                      disabled={!m.completed || m.claimed}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                        m.claimed
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : m.completed
                          ? 'gold-gradient text-slate-950 hover:brightness-110 shadow'
                          : 'bg-[#61002a] text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {m.claimed ? 'Claimed' : `Claim ৳${m.rewardTk}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: INTERNAL MESSAGE */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'bn' ? 'ইনবক্স বার্তা' : 'Internal Messages'}
                </h3>
                {unreadMessagesCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
                    {unreadMessagesCount} {lang === 'bn' ? 'টি অপঠিত' : 'Unread'}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {centerData.internalMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      if (!msg.read) handleMarkMessageRead(msg.id);
                    }}
                    className={`p-4 rounded-2xl border space-y-1.5 transition cursor-pointer ${
                      msg.read
                        ? 'bg-[#47001f] border-[#940042]/70 opacity-85'
                        : 'bg-[#5c0028] border-amber-400/50 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {!msg.read && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                        <span className="font-bold text-amber-400">{msg.sender}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{msg.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- SUB-DIALOGS FOR SECURITY CONFIGURATION --- */}
      {/* 1. Edit Personal Information Dialog */}
      {editDialog === 'personalInfo' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-[#47001f] border border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#940042]">
              <h3 className="text-sm font-black text-white">Edit Personal Information</h3>
              <button onClick={() => setEditDialog('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2 rounded-xl text-xs ${
                  formMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name (পুরো নাম):</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. MD NAYEM ISLAM"
                  className="w-full bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email (ইমেইল):</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@domain.com"
                  className="w-full bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Date of Birth (জন্মতারিখ):</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Gender (লিঙ্গ):</label>
                <div className="flex gap-4 text-slate-300">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                    />
                    Female
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSaveProfile({ fullName, email, birthday, gender })}
              className="w-full py-2.5 rounded-xl gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
            >
              Save Information & Update Score (+25 pts)
            </button>
          </div>
        </div>
      )}

      {/* 2. Change Password Dialog */}
      {editDialog === 'password' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-[#47001f] border border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#940042]">
              <h3 className="text-sm font-black text-white">Change Login Password</h3>
              <button onClick={() => setEditDialog('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2 rounded-xl text-xs ${
                  formMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">New Password (নতুন পাসওয়ার্ড):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (newPassword !== confirmPassword) {
                  setFormMsg({ type: 'error', text: 'Passwords do not match!' });
                  return;
                }
                handleSaveProfile({ newPassword });
              }}
              className="w-full py-2.5 rounded-xl gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* 3. Link E-Wallet Dialog */}
      {editDialog === 'ewallet' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-[#47001f] border border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#940042]">
              <h3 className="text-sm font-black text-white">Link E-wallet for Withdrawals</h3>
              <button onClick={() => setEditDialog('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2 rounded-xl text-xs ${
                  formMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Provider:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bkash', 'nagad', 'rocket'] as PaymentMethod[]).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setEwalletProvider(prov)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition cursor-pointer ${
                        ewalletProvider === prov
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow'
                          : 'border-[#940042] bg-[#61002a] text-slate-300 hover:bg-[#720032]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                        {prov === 'bkash' && <BkashLogo size="sm" showText={false} />}
                        {prov === 'nagad' && <NagadLogo size="sm" showText={false} />}
                        {prov === 'rocket' && <RocketLogo size="sm" showText={false} />}
                      </div>
                      <span className="text-xs">
                        {prov === 'bkash' ? 'bKash' : prov === 'nagad' ? 'Nagad' : 'Rocket'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Wallet Mobile Number:</label>
                <input
                  type="text"
                  value={ewalletNumber}
                  onChange={(e) => setEwalletNumber(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={() =>
                handleSaveProfile({
                  linkedEwalletNumber: ewalletNumber,
                  linkedEwalletProvider: ewalletProvider,
                })
              }
              className="w-full py-2.5 rounded-xl gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
            >
              Save E-wallet & Update Score (+25 pts)
            </button>
          </div>
        </div>
      )}

      {/* 4. Set Transaction Password PIN Dialog */}
      {editDialog === 'transactionPin' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-[#47001f] border border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#940042]">
              <h3 className="text-sm font-black text-white">Set 6-Digit Transaction Password PIN</h3>
              <button onClick={() => setEditDialog('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2 rounded-xl text-xs ${
                  formMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Transaction password will be used to verify your identity for any fund related operation (withdrawals & balance security).
              </p>

              <div>
                <label className="text-slate-400 block mb-1">Enter 6-Digit PIN:</label>
                <input
                  type="password"
                  maxLength={6}
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full bg-[#61002a] border border-[#940042] rounded-xl px-3 py-2 text-white font-mono tracking-widest text-center text-lg"
                />
              </div>
            </div>

            <button
              onClick={() => handleSaveProfile({ transactionPin })}
              className="w-full py-2.5 rounded-xl gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
            >
              Set PIN & Complete 100% Score (+25 pts)
            </button>
          </div>
        </div>
      )}

      {/* 5. Avatar Picker Dialog */}
      {editDialog === 'avatar' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-[#47001f] border border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#940042]">
              <h3 className="text-sm font-black text-white">Select Avatar</h3>
              <button onClick={() => setEditDialog('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
              ].map((url, i) => (
                <img
                  key={i}
                  src={url}
                  onClick={() => handleSaveProfile({ avatarUrl: url })}
                  alt="avatar option"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#940042] hover:border-amber-400 cursor-pointer transition shadow"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
