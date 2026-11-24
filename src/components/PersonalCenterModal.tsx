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
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Settings,
  Download,
  Headphones,
  RotateCcw,
} from 'lucide-react';
import { User, Wallet, PaymentMethod } from '../types';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { BkashLogo, NagadLogo, RocketLogo } from './BrandLogos';
import { safeApiFetch } from '../utils/api';
import { WeeklyBettingChart, DailyPerformancePoint } from './WeeklyBettingChart';
import { CLASSIC_AVATARS, DEFAULT_CLASSIC_AVATAR } from '../utils/avatars';

export type PersonalCenterTab =
  | 'account'
  | 'security'
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
  onOpenAvatarPicker?: () => void;
  onOpenSupport?: () => void;
  onOpenBonus?: () => void;
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
  onOpenAvatarPicker,
  onOpenSupport,
  onOpenBonus,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<PersonalCenterTab>(initialTab);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
  const avatarImage = user?.avatarUrl || DEFAULT_CLASSIC_AVATAR;
  const daysJoined = user?.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
    : 0;

  const claimableMissionsCount = centerData.missions.filter((m) => m.completed && !m.claimed).length;
  const unreadMessagesCount = centerData.internalMessages.filter((m) => !m.read).length;

  const menuItems = [
    { id: 'account', labelBn: 'আমার অ্যাকাউন্ট', labelEn: 'Member', icon: UserIcon },
    { id: 'security', labelBn: 'সিকিউরিটি সেন্টার', labelEn: 'Security center', icon: ShieldCheck },
    { id: 'deposit', labelBn: 'ডিপোজিট', labelEn: 'Deposit', icon: CreditCard },
    { id: 'withdrawal', labelBn: 'উইথড্রয়াল', labelEn: 'Withdrawal', icon: ArrowUpRight },
    { id: 'betting', labelBn: 'বেটিং রেকর্ড', labelEn: 'Betting Record', icon: ClipboardList },
    { id: 'records', labelBn: 'অ্যাকাউন্ট রেকর্ড', labelEn: 'Transaction History', icon: FileText },
    { id: 'pnl', labelBn: 'লাভ ও ক্ষতি', labelEn: 'Profit And Loss', icon: PieChart },
    {
      id: 'reward',
      labelBn: 'রিওয়ার্ড সেন্টার',
      labelEn: 'My Rewards',
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

  const handleDownloadHint = () => {
    setBannerFeedback({
      type: 'success',
      text:
        lang === 'bn'
          ? 'অ্যাপ ইনস্টল করতে আপনার ব্রাউজারের মেনু থেকে "Add to Home Screen" ব্যবহার করুন।'
          : 'Use your browser menu "Add to Home Screen" to install the app.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Container - Crisp Mint & White */}
      <div className="relative w-full max-w-5xl bg-[#f2f9f5] border border-[#cde8d8] sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row my-auto h-full sm:h-auto max-h-screen sm:max-h-[92vh] text-[#182620]">
        {/* Desktop Close Button */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white hover:bg-[#eaf8f0] text-[#557063] hover:text-[#182620] items-center justify-center border border-[#cde8d8] transition cursor-pointer shadow-xs"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT SIDEBAR: Desktop Personal Center Menu */}
        <aside className="hidden md:flex w-64 bg-white border-r border-[#dceee3] p-4 flex-col shrink-0">
          <div className="pb-3 border-b border-[#e5f3eb] mb-3 space-y-2">
            <Fb88BajiLogo size="xs" variant="light" className="scale-95 origin-left" />
            <div>
              <h2 className="text-base font-black text-[#182620] tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00a859]"></span>
                {lang === 'bn' ? 'মেম্বার সেন্টার' : 'MEMBER CENTER'}
              </h2>
              <p className="text-[10px] text-[#557063] mt-0.5">
                {lang === 'bn' ? 'অ্যাকাউন্ট ও নিরাপত্তা ব্যবস্থাপনা' : 'Account & Security Center'}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 overflow-y-auto py-1">
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
                    } else if (item.id === 'reward' && onOpenBonus) {
                      onClose();
                      onOpenBonus();
                    } else {
                      setActiveTab(item.id as PersonalCenterTab);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#00a859] text-white shadow-sm font-black'
                      : 'text-[#557063] hover:text-[#182620] hover:bg-[#eaf8f0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#00a859]'}`} />
                    <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                  </div>

                  {item.badge && (
                    <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white text-[#00a859]' : 'bg-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT / MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#f2f9f5] flex flex-col">
          {/* Sub-tab mobile header bar when not on 'account' */}
          {activeTab !== 'account' && (
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#dceee3] px-4 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className="w-8 h-8 rounded-full bg-[#eaf8f0] hover:bg-[#d6f2e2] text-[#00a859] flex items-center justify-center cursor-pointer transition"
                aria-label="Back to Member"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-black uppercase tracking-wider text-[#182620]">
                {menuItems.find((i) => i.id === activeTab)?.[lang === 'bn' ? 'labelBn' : 'labelEn'] || 'MEMBER'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-full bg-[#f4fbf7] text-[#557063] flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="hidden md:block w-8" />
            </div>
          )}

          <div className="p-4 md:p-6 space-y-4">
            {bannerFeedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 ${
                  bannerFeedback.type === 'success'
                    ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-100 border border-rose-200 text-rose-800'
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

            {/* TAB 1: MEMBER HOME VIEW (Matches Screenshots 3 & 4) */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                {/* Top MEMBER Header Bar */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-[#e3f5eb] hover:bg-[#cdebd9] text-[#00a859] flex items-center justify-center cursor-pointer transition"
                    aria-label="Back"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-black tracking-wider text-[#182620]">MEMBER</h2>
                  <div className="flex items-center gap-2 pr-0 md:pr-8">
                    <button
                      type="button"
                      onClick={() => setActiveTab('security')}
                      className="p-2 rounded-full hover:bg-[#e3f5eb] text-[#182620] cursor-pointer transition"
                      title="Security Center"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="relative p-2 rounded-full hover:bg-[#e3f5eb] text-[#182620] cursor-pointer transition"
                      title="Messages"
                    >
                      <Mail className="w-5 h-5" />
                      {unreadMessagesCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Member Profile Strip */}
                <div className="bg-white border border-[#dceee3] rounded-2xl p-4 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAvatarPicker) {
                            onClose();
                            onOpenAvatarPicker();
                          } else {
                            setEditDialog('avatar');
                          }
                        }}
                        className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#00a859] shadow-sm shrink-0 cursor-pointer group"
                        title="Change avatar"
                      >
                        <img src={avatarImage} alt="User avatar" className="w-full h-full object-cover" />
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-black text-[#182620] truncate">
                            {user?.username || 'Player'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#00a859] text-white text-[10px] font-black tracking-wide">
                            {user?.vipLevel || 'Default'}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUsername}
                            className="p-0.5 text-[#557063] hover:text-[#00a859] cursor-pointer"
                            title="Copy username"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-[#00a859]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <p className="text-xs text-[#557063]">
                          Join Fb88baji on the {daysJoined} day
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-[#182620] font-mono">
                            ৳ {showBalance ? availableTk : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={handleRefresh}
                            className={`p-1 text-[#557063] hover:text-[#00a859] cursor-pointer ${
                              refreshing ? 'animate-spin text-[#00a859]' : ''
                            }`}
                            title="Refresh balance"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowBalance(!showBalance)}
                            className="p-1 text-[#557063] hover:text-[#00a859] cursor-pointer"
                            title={showBalance ? 'Hide balance' : 'Show balance'}
                          >
                            {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('security')}
                      className="p-1.5 text-[#557063] hover:text-[#00a859] cursor-pointer shrink-0"
                      title="Account & Security Settings"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Deposit & Withdrawal Dual CTA Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDeposit();
                      }}
                      className="py-2.5 rounded-xl bg-white border border-[#cde8d8] hover:bg-[#eaf8f0] text-[#00a859] font-black text-sm shadow-xs transition cursor-pointer"
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenWithdrawal();
                      }}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-black text-sm shadow-md transition cursor-pointer"
                    >
                      Withdrawal
                    </button>
                  </div>
                </div>

                {/* Rank Benefits | Download Mint Split Card */}
                <div className="bg-[#eaf8f0] border border-[#cde8d8] rounded-2xl p-3 grid grid-cols-2 divide-x divide-[#cde8d8] shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('reward')}
                    className="flex items-center justify-center gap-2.5 py-1.5 px-2 cursor-pointer hover:opacity-85"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2ad17e] to-[#00a859] text-white flex items-center justify-center shadow-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#182620]">Rank Benefits</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadHint}
                    className="flex items-center justify-center gap-2.5 py-1.5 px-2 cursor-pointer hover:opacity-85"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2ad17e] to-[#00a859] text-white flex items-center justify-center shadow-sm">
                      <Download className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#182620]">Download</span>
                  </button>
                </div>

                {/* 4 Quick Emerald Icon Shortcuts */}
                <div className="grid grid-cols-4 gap-2 text-center bg-white border border-[#dceee3] rounded-2xl p-3 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('betting')}
                    className="flex flex-col items-center gap-1.5 py-1 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2ad17e] to-[#00994d] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#182620] leading-tight">Bet History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenReferral) {
                        onClose();
                        onOpenReferral();
                      } else {
                        setActiveTab('invite');
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 py-1 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2ad17e] to-[#00994d] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#182620] leading-tight">Invite friends</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('records')}
                    className="flex flex-col items-center gap-1.5 py-1 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2ad17e] to-[#00994d] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#182620] leading-tight">Transaction History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="flex flex-col items-center gap-1.5 py-1 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2ad17e] to-[#00994d] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#182620] leading-tight">Security center</span>
                  </button>
                </div>

                {/* Vertical White Menu List (Matches Screenshot 3 & 4) */}
                <div className="bg-white border border-[#dceee3] rounded-2xl divide-y divide-[#edf6f0] overflow-hidden shadow-xs">
                  {[
                    {
                      label: lang === 'bn' ? 'Invite friends (বন্ধু আমন্ত্রণ)' : 'Invite friends',
                      icon: Users,
                      onClick: () => {
                        if (onOpenReferral) {
                          onClose();
                          onOpenReferral();
                        } else {
                          setActiveTab('invite');
                        }
                      },
                    },
                    {
                      label: lang === 'bn' ? 'Deposit Record' : 'Deposit Record',
                      icon: CreditCard,
                      onClick: () => setActiveTab('records'),
                    },
                    {
                      label: lang === 'bn' ? 'Withdrawal Record' : 'Withdrawal Record',
                      icon: ArrowUpRight,
                      onClick: () => setActiveTab('records'),
                    },
                    {
                      label: lang === 'bn' ? 'Profit And Loss' : 'Profit And Loss',
                      icon: PieChart,
                      onClick: () => setActiveTab('pnl'),
                    },
                    {
                      label: lang === 'bn' ? 'My Rewards' : 'My Rewards',
                      icon: Gift,
                      badge: centerData.rewardAvailable ? 1 : undefined,
                      onClick: () => {
                        if (onOpenBonus) {
                          onClose();
                          onOpenBonus();
                        } else {
                          setActiveTab('reward');
                        }
                      },
                    },
                    {
                      label: lang === 'bn' ? 'My Rebates' : 'My Rebates',
                      icon: RotateCcw,
                      onClick: () => setActiveTab('betting'),
                    },
                    {
                      label: lang === 'bn' ? 'Mission' : 'Mission',
                      icon: Award,
                      badge: claimableMissionsCount > 0 ? claimableMissionsCount : undefined,
                      onClick: () => setActiveTab('mission'),
                    },
                    {
                      label: lang === 'bn' ? 'Internal Message' : 'Internal Message',
                      icon: Mail,
                      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
                      onClick: () => setActiveTab('messages'),
                    },
                    {
                      label: lang === 'bn' ? 'Customer Service' : 'Customer Service',
                      icon: Headphones,
                      onClick: () => {
                        if (onOpenSupport) {
                          onClose();
                          onOpenSupport();
                        }
                      },
                    },
                    {
                      label: lang === 'bn' ? 'APP Download' : 'APP Download',
                      icon: Download,
                      onClick: handleDownloadHint,
                    },
                  ].map((row) => {
                    const RowIcon = row.icon;
                    return (
                      <button
                        key={row.label}
                        type="button"
                        onClick={row.onClick}
                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#f4fbf7] transition cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <RowIcon className="w-5 h-5 text-[#00a859]" />
                          <span className="text-sm font-medium text-[#182620]">{row.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {row.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                              {row.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-[#8ea89a]" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Power className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'নিরাপদে লগআউট করুন' : 'Logout Safely'}</span>
                </button>
              </div>
            )}

            {/* TAB: SECURITY CENTER */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Profile Meta Summary */}
                  <div className="lg:col-span-6 bg-white border border-[#dceee3] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={avatarImage}
                        alt="User avatar"
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#00a859]"
                      />
                      <div>
                        <h3 className="text-base font-black text-[#182620]">{user?.fullName || user?.username}</h3>
                        <p className="text-xs text-[#557063]">Username: {user?.username}</p>
                        <p className="text-[11px] text-[#557063]">Joined {user?.createdAt ? user.createdAt.substring(0, 10) : '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f4fbf7] border border-[#dceee3]">
                        <span className="text-[#557063]">{centerData.processingDeposits} deposit request processing</span>
                        <span className="text-[10px] text-[#557063]">{new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f4fbf7] border border-[#dceee3]">
                        <span className="text-[#557063]">{centerData.processingWithdrawals} withdrawal request processing</span>
                        <span className="text-[10px] text-[#557063]">{new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e5f3eb] text-[11px] text-[#557063] space-y-0.5">
                      <p>Last Login Time: {user?.lastLoginTime || '—'}</p>
                      <p>Last Login IP: {user?.lastLoginIp || '—'}</p>
                    </div>
                  </div>

                  {/* Security Score Gauge */}
                  <div className="lg:col-span-6 bg-white border border-[#dceee3] rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center">
                    <div className="w-full flex justify-between items-center text-xs text-[#557063] font-semibold">
                      <span>{lang === 'bn' ? 'অ্যাকাউন্ট সিকিউরিটি লেভেল' : 'Account Security'}</span>
                      <span className="text-[#00a859] font-bold">
                        {currentScore === 100 ? (lang === 'bn' ? 'সম্পূর্ণ নিরাপদ' : '100% Protected') : `${currentScore}/100 points`}
                      </span>
                    </div>

                    <div className="relative my-4 flex items-center justify-center">
                      <div
                        className={`w-36 h-36 rounded-full flex items-center justify-center p-2.5 shadow-lg ${
                          isHighOptimal
                            ? 'bg-gradient-to-tr from-[#00a859] to-[#2ad17e]'
                            : currentScore >= 50
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-tr from-rose-500 to-red-500'
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                          <span
                            className={`text-2xl font-black ${
                              isHighOptimal ? 'text-[#00a859]' : currentScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}
                          >
                            {isHighOptimal ? 'High' : currentScore >= 50 ? 'Medium' : 'Low'}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#557063]">
                            Security Level
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-[#182620]">
                        Score is <span className="text-[#00a859] font-mono text-base">{currentScore}</span> points
                      </p>
                      <p className="text-xs text-[#557063]">
                        {isHighOptimal
                          ? 'Your account security level is High'
                          : 'Complete all 4 items below to achieve 100 points optimal score!'}
                      </p>
                    </div>

                    <div className="mt-4 w-full">
                      {isHighOptimal ? (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-[#eaf8f0] border border-[#bde6cf] text-[#00a859] text-xs font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Currently the optimal setting</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!user?.fullName || !birthday) setEditDialog('personalInfo');
                            else if (!ewalletNumber) setEditDialog('ewallet');
                            else if (!transactionPin) setEditDialog('transactionPin');
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white text-xs font-black flex items-center justify-center gap-2 shadow hover:brightness-105 transition cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{lang === 'bn' ? '১০০ পয়েন্ট ফিলাপ করুন' : 'Complete 100 Points Now'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4 Security Configuration Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => setEditDialog('personalInfo')}
                    className="p-4 rounded-2xl bg-white hover:bg-[#f4fbf7] border border-[#dceee3] flex items-center justify-between cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#eaf8f0] text-[#00a859] flex items-center justify-center">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#182620]">Personal Information</span>
                          {fullName && birthday && <CheckCircle2 className="w-4 h-4 text-[#00a859]" />}
                        </div>
                        <p className="text-[11px] text-[#557063] mt-0.5">Complete full name, email &amp; birthday.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8ea89a]" />
                  </div>

                  <div
                    onClick={() => setEditDialog('password')}
                    className="p-4 rounded-2xl bg-white hover:bg-[#f4fbf7] border border-[#dceee3] flex items-center justify-between cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#eaf8f0] text-[#00a859] flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#182620]">Login password</span>
                          <CheckCircle2 className="w-4 h-4 text-[#00a859]" />
                        </div>
                        <p className="text-[11px] text-[#557063] mt-0.5">Update your account login password.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8ea89a]" />
                  </div>

                  <div
                    onClick={() => setEditDialog('ewallet')}
                    className="p-4 rounded-2xl bg-white hover:bg-[#f4fbf7] border border-[#dceee3] flex items-center justify-between cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#eaf8f0] text-[#00a859] flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#182620]">Link E-wallet</span>
                          {ewalletNumber && ewalletNumber.length >= 10 && <CheckCircle2 className="w-4 h-4 text-[#00a859]" />}
                        </div>
                        <p className="text-[11px] text-[#557063] mt-0.5">Bind bKash / Nagad / Rocket for withdrawals.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8ea89a]" />
                  </div>

                  <div
                    onClick={() => setEditDialog('transactionPin')}
                    className="p-4 rounded-2xl bg-white hover:bg-[#f4fbf7] border border-[#dceee3] flex items-center justify-between cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#eaf8f0] text-[#00a859] flex items-center justify-center">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#182620]">Transaction Password</span>
                          {transactionPin && transactionPin.length >= 4 && <CheckCircle2 className="w-4 h-4 text-[#00a859]" />}
                        </div>
                        <p className="text-[11px] text-[#557063] mt-0.5">6-digit PIN for secure fund transfers.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8ea89a]" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BETTING RECORD */}
            {activeTab === 'betting' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-[#182620]">
                      {lang === 'bn' ? 'বেটিং রেকর্ড ও পারফরম্যান্স' : 'Betting Records & Performance'}
                    </h3>
                    <span className="text-xs text-[#557063]">Total: {centerData.bettingRecords.length} bets</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#dceee3] shadow-xs self-start sm:self-auto">
                    <button
                      onClick={() => setBettingViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        bettingViewMode === 'table'
                          ? 'bg-[#00a859] text-white shadow-xs font-black'
                          : 'text-[#557063] hover:text-[#182620]'
                      }`}
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'টেবিল রেকর্ড' : 'Table View'}</span>
                    </button>
                    <button
                      onClick={() => setBettingViewMode('chart')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        bettingViewMode === 'chart'
                          ? 'bg-[#00a859] text-white shadow-xs font-black'
                          : 'text-[#557063] hover:text-[#182620]'
                      }`}
                    >
                      <TrendingUp className={`w-3.5 h-3.5 ${bettingViewMode === 'chart' ? 'text-white' : 'text-[#00a859]'}`} />
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
                  <div className="p-8 text-center bg-white rounded-2xl border border-[#dceee3] text-[#557063] space-y-2 shadow-xs">
                    <ClipboardList className="w-8 h-8 mx-auto text-[#8ea89a]" />
                    <p className="text-xs">
                      {lang === 'bn'
                        ? 'এখনো কোনো বেট প্লেস করা হয়নি। স্পোর্টস বা ক্যাসিনো উপভোগ করুন।'
                        : 'No bets recorded yet. Place bets on sportsbook or casino games.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-2xl border border-[#dceee3] shadow-xs">
                    <table className="w-full text-xs text-left text-[#182620]">
                      <thead className="bg-[#f4fbf7] text-[#557063] uppercase text-[10px] border-b border-[#dceee3]">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Market</th>
                          <th className="p-3">Stake</th>
                          <th className="p-3">Odds</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf6f0]">
                        {centerData.bettingRecords.map((b) => (
                          <tr key={b.id} className="hover:bg-[#f4fbf7] transition">
                            <td className="p-3 text-[#557063]">{b.createdAt?.substring(0, 16)}</td>
                            <td className="p-3 font-bold text-[#182620]">{b.marketName || b.gameTitle || 'Match'}</td>
                            <td className="p-3 font-mono">৳{(b.stakePaisa / 100).toFixed(2)}</td>
                            <td className="p-3 text-[#00a859] font-mono font-bold">{b.odds}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === 'WON'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : b.status === 'LOST'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-100 text-amber-700'
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
                  <h3 className="text-base font-extrabold text-[#182620]">
                    {lang === 'bn' ? 'অ্যাকাউন্ট রেকর্ড (লেনদেন বিবরণী)' : 'Account Records'}
                  </h3>
                </div>

                {centerData.accountRecords.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-[#dceee3] text-[#557063] space-y-2 shadow-xs">
                    <FileText className="w-8 h-8 mx-auto text-[#8ea89a]" />
                    <p className="text-xs">
                      {lang === 'bn' ? 'কোনো লেনদেন রেকর্ড নেই।' : 'No transaction records found.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-2xl border border-[#dceee3] shadow-xs">
                    <table className="w-full text-xs text-left text-[#182620]">
                      <thead className="bg-[#f4fbf7] text-[#557063] uppercase text-[10px] border-b border-[#dceee3]">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf6f0]">
                        {centerData.accountRecords.map((r, i) => (
                          <tr key={i} className="hover:bg-[#f4fbf7] transition">
                            <td className="p-3 text-[#557063]">{r.date?.substring(0, 16)}</td>
                            <td className="p-3 font-bold text-[#182620]">{r.type}</td>
                            <td className="p-3 uppercase font-mono text-[#557063]">{r.method}</td>
                            <td className="p-3 font-mono text-[#00a859] font-bold">
                              ৳{r.amountTk.toFixed(2)}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf8f0] text-[#00a859] border border-[#cde8d8]">
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
                    <h4 className="text-xs font-black text-[#182620] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00a859]"></span>
                      <span>{lang === 'bn' ? 'লাইফটাইম ব্যালেন্স ও টার্নওভার অডিট' : 'Lifetime Audit & Account Metrics'}</span>
                    </h4>
                    <span className="text-[11px] text-[#557063]">
                      {lang === 'bn' ? 'মোট সেটেলড রাউন্ড: ' : 'Total settled rounds: '}
                      <strong className="text-[#00a859] font-mono">{centerData.pnl.totalBets || centerData.bettingRecords.length}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-[#dceee3] shadow-xs">
                      <span className="text-[11px] text-[#557063]">Total Turnover</span>
                      <div className="text-lg font-mono font-bold text-[#182620] mt-1">
                        ৳{centerData.pnl.totalBetTk.toFixed(2)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#dceee3] shadow-xs">
                      <span className="text-[11px] text-[#557063]">Total Payouts</span>
                      <div className="text-lg font-mono font-bold text-[#00a859] mt-1">
                        ৳{centerData.pnl.totalWonTk.toFixed(2)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#dceee3] shadow-xs">
                      <span className="text-[11px] text-[#557063]">Net Profit</span>
                      <div
                        className={`text-lg font-mono font-bold mt-1 ${
                          centerData.pnl.netPnlTk >= 0 ? 'text-[#00a859]' : 'text-rose-600'
                        }`}
                      >
                        {centerData.pnl.netPnlTk >= 0 ? '+' : ''}৳{centerData.pnl.netPnlTk.toFixed(2)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#dceee3] shadow-xs">
                      <span className="text-[11px] text-[#557063]">Win Rate</span>
                      <div className="text-lg font-mono font-bold text-[#00a859] mt-1">
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
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                      DAILY GIFT
                    </span>
                    <h3 className="text-xl font-black mt-1">Daily Login Bonus</h3>
                    <p className="text-xs text-emerald-50 mt-0.5">
                      Claim your daily attendance reward of ৳{centerData.rewardAmountTk} today!
                    </p>
                  </div>

                  <button
                    onClick={handleClaimReward}
                    disabled={!centerData.rewardAvailable}
                    className={`px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition ${
                      centerData.rewardAvailable
                        ? 'bg-white text-[#00994d] hover:bg-emerald-50 cursor-pointer'
                        : 'bg-white/25 text-white/75 cursor-not-allowed'
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#182620]">
                      {lang === 'bn' ? 'বন্ধু আমন্ত্রণ ও ৩-স্তর রেফারেল কমিশন' : 'Invite Friends & 3-Tier Commissions'}
                    </h3>
                    <p className="text-xs text-[#557063] mt-0.5">
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
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white text-xs font-black shadow flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'পূর্ণাঙ্গ রেফারেল হাব' : 'Open Full Hub'}</span>
                    </button>
                  )}
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#dceee3] shadow-xs">
                    <span className="text-[11px] text-[#557063]">উত্তোলনযোগ্য ব্যালেন্স</span>
                    <div className="text-lg font-mono font-bold text-[#00a859] mt-1">
                      ৳{((user?.referralClaimablePaisa || 0) / 100).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-[#00a859] font-semibold">০x টার্নওভার (Withdrawable)</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#dceee3] shadow-xs">
                    <span className="text-[11px] text-[#557063]">সর্বমোট কমিশন</span>
                    <div className="text-lg font-mono font-bold text-[#182620] mt-1">
                      ৳{((user?.referralTotalEarnedPaisa || 0) / 100).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-[#557063]">আজীবন ৩-স্তর ইনকাম</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white border border-[#dceee3] shadow-xs">
                    <span className="text-[11px] text-[#557063]">রেফারেল কোড</span>
                    <div className="text-base font-mono font-black text-[#00a859] mt-1">
                      {user?.referralCode || `REF${user?.username.slice(0, 5).toUpperCase() || 'PLAYER'}88`}
                    </div>
                    <span className="text-[10px] text-[#557063]">১ম স্তরে ১.৫% ডিপোজিট</span>
                  </div>
                </div>

                {/* Link Box */}
                <div className="p-5 rounded-2xl bg-white border border-[#dceee3] space-y-4 shadow-xs">
                  <p className="text-xs text-[#557063]">
                    {lang === 'bn'
                      ? 'আপনার রেফারেল লিঙ্ক দিয়ে যেকোনো বন্ধুকে জয়েন করান। সে যতবার ডিপোজিট করবে বা গেম খেলবে, আপনি নিয়মিত কমিশন পাবেন।'
                      : 'Share your exclusive link. Earn recurring commissions every time your friends deposit or play.'}
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/register?ref=${user?.referralCode || `REF${user?.username.slice(0, 5).toUpperCase() || 'PLAYER'}88`}`}
                      className="flex-1 bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-xs text-[#182620] font-mono"
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
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer shadow-xs"
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
                        className="w-full py-2.5 rounded-xl bg-[#eaf8f0] hover:bg-[#d8f3e3] text-[#00a859] border border-[#cde8d8] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-[#00a859]" />
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
                <h3 className="text-base font-extrabold text-[#182620]">
                  {lang === 'bn' ? 'মিশন ও পুরস্কার' : 'Daily & Weekly Missions'}
                </h3>

                <div className="space-y-3">
                  {centerData.missions.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-white border border-[#dceee3] flex items-center justify-between gap-4 shadow-xs"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-[#182620]">{lang === 'bn' ? m.titleBn : m.title}</h4>
                        <p className="text-[11px] text-[#557063] mt-0.5">
                          {lang === 'bn' ? m.descBn : m.desc}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-28 h-1.5 rounded-full bg-[#e3f5eb] overflow-hidden">
                            <svg className="w-full h-full block" preserveAspectRatio="none">
                              <rect
                                x="0"
                                y="0"
                                width={`${Math.min(100, Math.round((m.progress / Math.max(1, m.target)) * 100))}%`}
                                height="100%"
                                rx="3"
                                fill="#00a859"
                              />
                            </svg>
                          </div>
                          <span className="text-[10px] text-[#557063] font-mono">
                            {m.progress}/{m.target}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaimMission(m.id, m.rewardTk)}
                        disabled={!m.completed || m.claimed}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                          m.claimed
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : m.completed
                            ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white hover:brightness-105 shadow cursor-pointer'
                            : 'bg-[#f4fbf7] border border-[#dceee3] text-[#8ea89a] cursor-not-allowed'
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
                  <h3 className="text-base font-extrabold text-[#182620]">
                    {lang === 'bn' ? 'ইনবক্স বার্তা' : 'Internal Messages'}
                  </h3>
                  {unreadMessagesCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200">
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
                      className={`p-4 rounded-2xl border space-y-1.5 transition cursor-pointer shadow-xs ${
                        msg.read
                          ? 'bg-white border-[#dceee3] opacity-85'
                          : 'bg-[#eaf8f0] border-[#00a859]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {!msg.read && <span className="w-2 h-2 rounded-full bg-[#00a859] animate-pulse" />}
                          <span className="font-bold text-[#00a859]">{msg.sender}</span>
                        </div>
                        <span className="text-[10px] text-[#557063]">{msg.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#182620]">{msg.title}</h4>
                      <p className="text-xs text-[#557063] leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- SUB-DIALOGS FOR SECURITY CONFIGURATION --- */}
      {/* 1. Edit Personal Information Dialog */}
      {editDialog === 'personalInfo' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-[#182620]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5f3eb]">
              <h3 className="text-sm font-black text-[#182620]">Edit Personal Information</h3>
              <button onClick={() => setEditDialog('none')} className="text-[#557063] hover:text-[#182620] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold ${
                  formMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#557063] font-semibold block mb-1">Full Name (পুরো নাম):</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. MD NAYEM ISLAM"
                  className="w-full bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-[#182620] focus:outline-hidden focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="text-[#557063] font-semibold block mb-1">Email (ইমেইল):</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@domain.com"
                  className="w-full bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-[#182620] focus:outline-hidden focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="text-[#557063] font-semibold block mb-1">Date of Birth (জন্মতারিখ):</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-[#182620] focus:outline-hidden focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="text-[#557063] font-semibold block mb-1">Gender (লিঙ্গ):</label>
                <div className="flex gap-4 text-[#182620] font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                      className="accent-[#00a859]"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                      className="accent-[#00a859]"
                    />
                    Female
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSaveProfile({ fullName, email, birthday, gender })}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow hover:brightness-105 transition cursor-pointer"
            >
              Save Information & Update Score (+25 pts)
            </button>
          </div>
        </div>
      )}

      {/* 2. Change Password Dialog */}
      {editDialog === 'password' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-[#182620]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5f3eb]">
              <h3 className="text-sm font-black text-[#182620]">Change Login Password</h3>
              <button onClick={() => setEditDialog('none')} className="text-[#557063] hover:text-[#182620] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold ${
                  formMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#557063] font-semibold block mb-1">New Password (নতুন পাসওয়ার্ড):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-[#182620] focus:outline-hidden focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="text-[#557063] font-semibold block mb-1">Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-[#182620] focus:outline-hidden focus:border-[#00a859]"
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow hover:brightness-105 transition cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* 3. Link E-Wallet Dialog */}
      {editDialog === 'ewallet' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-[#182620]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5f3eb]">
              <h3 className="text-sm font-black text-[#182620]">Link E-wallet for Withdrawals</h3>
              <button onClick={() => setEditDialog('none')} className="text-[#557063] hover:text-[#182620] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold ${
                  formMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#557063] font-semibold block mb-1">Select Provider:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bkash', 'nagad', 'rocket'] as PaymentMethod[]).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setEwalletProvider(prov)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition cursor-pointer ${
                        ewalletProvider === prov
                          ? 'border-[#00a859] bg-[#eaf8f0] text-[#00a859] shadow-xs'
                          : 'border-[#dceee3] bg-[#f4fbf7] text-[#557063] hover:bg-[#eaf8f0]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shadow-xs border border-[#e5f3eb]">
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
                <label className="text-[#557063] font-semibold block mb-1">Wallet Mobile Number:</label>
                <input
                  type="text"
                  value={ewalletNumber}
                  onChange={(e) => setEwalletNumber(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-[#182620] font-mono focus:outline-hidden focus:border-[#00a859]"
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow hover:brightness-105 transition cursor-pointer"
            >
              Save E-wallet & Update Score (+25 pts)
            </button>
          </div>
        </div>
      )}

      {/* 4. Set Transaction Password PIN Dialog */}
      {editDialog === 'transactionPin' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-[#182620]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5f3eb]">
              <h3 className="text-sm font-black text-[#182620]">Set 6-Digit Transaction Password PIN</h3>
              <button onClick={() => setEditDialog('none')} className="text-[#557063] hover:text-[#182620] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold ${
                  formMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-[#557063]">
                Transaction password will be used to verify your identity for any fund related operation (withdrawals & balance security).
              </p>

              <div>
                <label className="text-[#557063] font-semibold block mb-1">Enter 6-Digit PIN:</label>
                <input
                  type="password"
                  maxLength={6}
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full bg-[#f4fbf7] border border-[#cde8d8] rounded-xl px-3 py-2 text-[#182620] font-mono tracking-widest text-center text-lg focus:outline-hidden focus:border-[#00a859]"
                />
              </div>
            </div>

            <button
              onClick={() => handleSaveProfile({ transactionPin })}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow hover:brightness-105 transition cursor-pointer"
            >
              Set PIN & Complete 100% Score (+25 pts)
            </button>
          </div>
        </div>
      )}

      {/* 5. Avatar Picker Dialog */}
      {editDialog === 'avatar' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditDialog('none')} />
          <div className="relative w-full max-w-md bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-[#182620]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5f3eb]">
              <h3 className="text-sm font-black text-[#182620]">Select Avatar</h3>
              <button onClick={() => setEditDialog('none')} className="text-[#557063] hover:text-[#182620] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {CLASSIC_AVATARS.map((av) => (
                <img
                  key={av.id}
                  src={av.src}
                  onClick={() => handleSaveProfile({ avatarUrl: av.src })}
                  alt={av.label}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#dceee3] hover:border-[#00a859] cursor-pointer transition shadow-xs"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
