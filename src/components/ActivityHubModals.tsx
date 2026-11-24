/**
 * Activity Hub, Reward Center, Rescue Fund, 2-Plan Daily Sign-In,
 * Smash & Win Bonus Vouchers, Promo Code, Suggestion & Avatar Picker Modals
 * Backed strictly by real server endpoints (/api/v1/activity/*, /api/v1/user/*)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Edit2,
  RefreshCw,
  Crown,
  Gift,
  CalendarCheck,
  Coins,
  UserPlus,
  Percent,
  HelpCircle,
  Info,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Send,
  Ticket,
  MessageSquarePlus,
} from 'lucide-react';
import type { User, Wallet } from '../types';
import { CLASSIC_AVATARS, DEFAULT_CLASSIC_AVATAR } from '../utils/avatars';
import { safeApiFetch } from '../utils/api';

export interface ActivityOverviewData {
  todayBdt: string;
  todayDepositsTk: number;
  totalDepositsTk: number;
  todayBetTk: number;
  todayPayoutTk: number;
  todayNetLossTk: number;
  rescueClaimableTk: number;
  rescueClaimedToday: boolean;
  rescueRatePercent: number;
  growthPlan: {
    minDepositTk: number;
    checkedInToday: boolean;
    streak: number;
    totalBonusTk: number;
    claimedDays: number[];
    rewards: number[];
  };
  luckySpinPlan: {
    minDepositTk: number;
    requiredBetTk: number;
    checkedInToday: boolean;
    claimedDays: number[];
    tiers: string[];
  };
  vouchers: Array<{
    id: 'deposit_bonus' | 'lucky_spin_bonus' | 'daily_egg' | 'recharge_30k_egg';
    badgeLabel?: string;
    category?: 'deposit' | 'spin' | 'egg';
    titleBn: string;
    subtitleBn: string;
    dueDateStr: string;
    dueAtIso: string;
    eligible: boolean;
    claimed: boolean;
    currentTk: number;
    requiredTk: number;
    conditionTextBn: string;
  }>;
  availableVouchersCount: number;
  vip: {
    level: string;
    tierNum: number;
    progress: number;
    target: number;
    depositProgressTk: number;
  };
  points: number;
}

function formatMoney(val: number): string {
  return Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function useCountdown(targetIso?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, (targetIso ? new Date(targetIso).getTime() : now) - now);
  const days = Math.floor(diff / 86400000);
  const hrs = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
  const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  return { days, hms: `${hrs}:${mins}:${secs}` };
}

/* ============================================================================
 * 1. REWARD HUB MODAL (Matches Screenshot 7 - /m/reward)
 * ============================================================================ */
interface RewardHubModalProps {
  user: User;
  wallet: Wallet | null;
  overview: ActivityOverviewData | null;
  onClose: () => void;
  onRefresh: () => void;
  onUserUpdate: (u: User) => void;
  onOpenSignIn: () => void;
  onOpenBonus: () => void;
  onOpenRescue: () => void;
  onOpenInvite: () => void;
  onOpenPromoCode: () => void;
  onOpenAvatarPicker: () => void;
  onOpenVipBenefits: () => void;
}

export const RewardHubModal: React.FC<RewardHubModalProps> = ({
  user,
  wallet,
  overview,
  onClose,
  onRefresh,
  onUserUpdate,
  onOpenSignIn,
  onOpenBonus,
  onOpenRescue,
  onOpenInvite,
  onOpenPromoCode,
  onOpenAvatarPicker,
  onOpenVipBenefits,
}) => {
  const [copiedUser, setCopiedUser] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user.nickname || user.username);
  const [savingNick, setSavingNick] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const balanceTk = (wallet?.availablePaisa || 0) / 100;
  const vipProg = overview?.vip?.progress ?? 0;
  const vipTarget = overview?.vip?.target ?? 1;
  const vipPct = Math.min(100, Math.round((vipProg / Math.max(1, vipTarget)) * 100));
  const avatarSrc = user.avatarUrl || DEFAULT_CLASSIC_AVATAR;

  const handleSaveNickname = async () => {
    const clean = nicknameInput.trim();
    if (!clean) return;
    setSavingNick(true);
    try {
      const res = await safeApiFetch<{ user: User }>('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ nickname: clean }),
      });
      if (res.ok && res.data?.user) {
        onUserUpdate(res.data.user);
      }
      setEditingNickname(false);
    } finally {
      setSavingNick(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#f2f9f5] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh]">
        {/* Top Coral-Orange Header Backdrop (Matching Screenshot 2) */}
        <div className="relative bg-gradient-to-br from-[#ff884d] via-[#ff6a4d] to-[#f45046] px-4 pt-4 pb-8 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-black tracking-[0.22em] uppercase text-white/35 select-none">REWARD</span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center text-white cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Translucent VIP Card with Top-Right Red Sign In Ribbon */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#f3d1b7]/90 via-[#e8bda0]/85 to-[#d7a483]/85 text-[#2b1f18] p-4 shadow-xl border border-white/50 overflow-hidden">
            {/* Top-Right Red Sign In > Ribbon */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSignIn();
              }}
              className="absolute top-0 right-0 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3.5 py-1.5 rounded-bl-2xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 pr-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAvatarPicker();
                }}
                className="relative w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0 cursor-pointer"
                title="Change Avatar"
              >
                <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
              </button>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-900 truncate">{user.username}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(user.username);
                      setCopiedUser(true);
                      setTimeout(() => setCopiedUser(false), 1500);
                    }}
                    className="p-1 text-slate-700 hover:text-slate-950 cursor-pointer"
                    title="Copy username"
                  >
                    {copiedUser ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {editingNickname ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="w-28 px-2 py-0.5 text-xs bg-white/95 border border-[#cde8d8] rounded-md text-slate-900"
                    />
                    <button
                      type="button"
                      disabled={savingNick}
                      onClick={handleSaveNickname}
                      className="px-2 py-0.5 bg-[#00a859] text-white text-[10px] font-bold rounded-md cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-slate-700">
                    <span className="truncate">Nickname: {user.nickname || user.username}</span>
                    <button
                      type="button"
                      onClick={() => setEditingNickname(true)}
                      className="p-0.5 hover:text-slate-950 cursor-pointer"
                      aria-label="Edit nickname"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    ৳ {formatMoney(balanceTk)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRefreshing(true);
                      onRefresh();
                      setTimeout(() => setRefreshing(false), 600);
                    }}
                    className="p-1 text-slate-700 hover:text-slate-950 cursor-pointer"
                    title="Refresh balance"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* VIP Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-slate-700" />
                  <span>{overview?.vip?.level || user.vipLevel || 'Default'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVipBenefits();
                  }}
                  className="flex items-center gap-1 text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  <span>Benefits</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/55 overflow-hidden">
                  <svg className="w-full h-full block" preserveAspectRatio="none">
                    <rect x="0" y="0" width={`${vipPct}%`} height="100%" rx="4" fill="#00a859" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-700 font-mono">
                  {vipProg} / {vipTarget}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Vibrant Gradient Activity Tiles (Exact Match to Screenshot 2) */}
        <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBonus();
            }}
            className="relative h-28 rounded-2xl bg-gradient-to-br from-[#5de292] to-[#1ab678] text-white flex flex-col items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            {(overview?.availableVouchersCount || 0) > 0 && (
              <span className="absolute top-2.5 right-6 min-w-5 h-5 px-1.5 rounded-full bg-[#ef4444] text-white text-[11px] font-black flex items-center justify-center shadow">
                {overview?.availableVouchersCount}
              </span>
            )}
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Gift className="w-6 h-6 text-[#1ab678]" />
            </div>
            <span className="text-sm font-bold">Bonus</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSignIn();
            }}
            className="h-28 rounded-2xl bg-gradient-to-br from-[#6ea8fe] to-[#2563eb] text-white flex flex-col items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
              <CalendarCheck className="w-6 h-6 text-[#2563eb]" />
            </div>
            <span className="text-sm font-bold">Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRescue();
            }}
            className="h-28 rounded-2xl bg-gradient-to-br from-[#ffca70] to-[#f99438] text-white flex flex-col items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Coins className="w-6 h-6 text-[#f99438]" />
            </div>
            <span className="text-sm font-bold">Rescue fund</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInvite();
            }}
            className="h-28 rounded-2xl bg-gradient-to-br from-[#ff8f8f] to-[#e94a71] text-white flex flex-col items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
              <UserPlus className="w-6 h-6 text-[#e94a71]" />
            </div>
            <span className="text-sm font-bold">Invite Friends</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPromoCode();
            }}
            className="relative h-28 rounded-2xl bg-gradient-to-br from-[#34d8e8] to-[#0db0cc] text-white flex flex-col items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            <span className="absolute top-2.5 right-6 min-w-5 h-5 px-1.5 rounded-full bg-[#ef4444] text-white text-[11px] font-black flex items-center justify-center shadow">
              1
            </span>
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Percent className="w-6 h-6 text-[#0db0cc]" />
            </div>
            <span className="text-sm font-bold">Promo Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. RESCUE FUND MODAL (Matches Screenshot 1 - /m/activity/rescue)
 * ============================================================================ */
interface RescueFundModalProps {
  user: User;
  overview: ActivityOverviewData | null;
  onClose: () => void;
  onClaimed: () => void;
}

export const RescueFundModal: React.FC<RescueFundModalProps> = ({
  user,
  overview,
  onClose,
  onClaimed,
}) => {
  const [claiming, setClaiming] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showRules, setShowRules] = useState(false);

  const netLoss = overview?.todayNetLossTk ?? 0;
  const claimable = overview?.rescueClaimableTk ?? 0;
  const claimedToday = overview?.rescueClaimedToday ?? false;

  const handleClaim = async () => {
    if (claiming || claimedToday || claimable <= 0) return;
    setClaiming(true);
    setFeedback(null);
    try {
      const res = await safeApiFetch<{ success: boolean; message: string }>('/api/v1/activity/rescue/claim', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.sessionToken}` },
      });
      if (res.ok && res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        onClaimed();
      } else {
        setFeedback({ type: 'error', text: res.error || 'ক্লেইম ব্যর্থ হয়েছে।' });
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#f2f9f5] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] text-[#182620]">
        {/* Emerald Top Header */}
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] text-white px-4 h-12 flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="p-2 -ml-2 cursor-pointer" aria-label="Back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-base">Rescue fund</span>
          <button
            type="button"
            onClick={() => setShowRules((v) => !v)}
            className="p-2 -mr-2 cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Sky-Mint Gift Box Illustration Banner */}
          <div className="bg-gradient-to-b from-[#dcf7e8] via-[#ebf9f1] to-[#f2f9f5] px-4 pt-5 pb-3 text-center relative">
            <svg viewBox="0 0 260 120" className="w-56 h-28 mx-auto drop-shadow-md">
              <defs>
                <linearGradient id="boxBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
                <linearGradient id="goldCoin" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
              {/* Floating coin badges */}
              <circle cx="32" cy="40" r="14" fill="white" fillOpacity="0.45" />
              <circle cx="32" cy="40" r="10" fill="url(#goldCoin)" />
              <circle cx="225" cy="36" r="16" fill="white" fillOpacity="0.45" />
              <circle cx="225" cy="36" r="11" fill="url(#goldCoin)" />
              {/* Open Gift Box */}
              <rect x="78" y="54" width="104" height="58" rx="10" fill="url(#boxBody)" stroke="#bfdbfe" strokeWidth="2" />
              <rect x="122" y="54" width="16" height="58" fill="#818cf8" opacity="0.55" />
              {/* Coins bursting inside */}
              <circle cx="105" cy="54" r="12" fill="url(#goldCoin)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="130" cy="48" r="13" fill="url(#goldCoin)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="154" cy="54" r="12" fill="url(#goldCoin)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="118" cy="64" r="11" fill="url(#goldCoin)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="144" cy="64" r="11" fill="url(#goldCoin)" stroke="#ca8a04" strokeWidth="1.5" />
              {/* Lid tilted open */}
              <g transform="rotate(-14 130 34)">
                <rect x="72" y="18" width="114" height="18" rx="6" fill="#eff6ff" stroke="#93c5fd" strokeWidth="2" />
                <rect x="121" y="18" width="16" height="18" fill="#818cf8" opacity="0.6" />
              </g>
              {/* Heart */}
              <path d="M88 38 C88 32 97 32 97 38 C97 44 88 49 88 49 C88 49 79 44 79 38 C79 32 88 32 88 38 Z" fill="#fb7185" />
            </svg>

            <div className="text-xs font-bold text-slate-700 mt-1">Today</div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-white rounded-xl p-3 shadow-xs border border-[#dceee3]">
                <div className="text-[11px] font-semibold text-[#557063] leading-tight">
                  Accumulated Negative Profit
                </div>
                <div className="text-base font-black text-[#00a859] mt-1 font-mono">
                  ৳ {formatMoney(netLoss)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 shadow-xs border border-[#dceee3]">
                <div className="text-[11px] font-semibold text-[#557063] leading-tight">
                  Claimable Amount
                </div>
                <div className="text-base font-black text-[#00a859] mt-1 font-mono">
                  ৳ {claimable}
                </div>
              </div>
            </div>
          </div>

          {showRules && (
            <div className="mx-4 my-2 p-3 rounded-xl bg-white border border-[#cde8d8] text-xs text-[#182620]">
              দৈনিক গেমিং-এ নেট লস ৳২০০ বা তার বেশি হলে ২% থেকে ৮% পর্যন্ত রেসকিউ ক্যাশব্যাক ক্লেইম করতে পারবেন (দিনে ১ বার)।
            </div>
          )}

          {feedback && (
            <div
              className={`mx-4 my-2 p-3 rounded-xl text-xs font-bold ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Open Safe Vault & Claim CTA */}
          <div className="px-4 py-4 flex flex-col items-center">
            <div className="px-5 py-1.5 rounded-full bg-[#fff5db] border border-amber-200 flex items-center gap-2 shadow-xs mb-3">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">
                ★
              </span>
              <span className="text-sm font-black text-slate-800 font-mono">{formatMoney(claimable)}</span>
            </div>

            {/* Emerald Safe Vault SVG */}
            <svg viewBox="0 0 220 150" className="w-48 h-36">
              <rect x="45" y="16" width="130" height="114" rx="18" fill="#19c36e" />
              <rect x="55" y="26" width="110" height="94" rx="12" fill="#008f4a" />
              <line x1="55" y1="73" x2="165" y2="73" stroke="#6ee7b7" strokeWidth="4" />
              <circle cx="84" cy="62" r="8" fill="#facc15" />
              <circle cx="100" cy="60" r="9" fill="#eab308" />
              <circle cx="116" cy="62" r="8" fill="#facc15" />
              <rect x="130" y="52" width="24" height="14" rx="3" fill="#a855f7" />
              <rect x="92" y="88" width="36" height="28" rx="4" fill="#fb923c" />
              <rect x="106" y="88" width="8" height="28" fill="#f43f5e" />
              <circle cx="32" cy="122" r="9" fill="#facc15" />
              <circle cx="42" cy="126" r="9" fill="#eab308" />
              <circle cx="182" cy="126" r="9" fill="#eab308" />
              <circle cx="192" cy="122" r="9" fill="#facc15" />
            </svg>

            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming || claimedToday || claimable <= 0}
              className={`-mt-2 px-10 py-2.5 rounded-full font-black text-sm shadow-lg transition cursor-pointer ${
                claimedToday
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : claimable > 0
                  ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white hover:brightness-110 active:scale-95'
                  : 'bg-slate-300 text-slate-600 cursor-not-allowed'
              }`}
            >
              {claimedToday ? 'Claimed' : claiming ? 'Claiming...' : 'Claim'}
            </button>
          </div>

          {/* Bottom Tier Table */}
          <div className="px-4 pb-6 space-y-2">
            <div className="text-center text-xs font-bold text-[#182620]">Game type: Crash &amp; Live API</div>
            <div className="text-xs font-bold text-[#00a859]">Reward Cycle</div>
            <div className="rounded-xl overflow-hidden border border-[#cde8d8] bg-white text-[11px] shadow-xs">
              <div className="grid grid-cols-5 bg-[#00a859] text-white font-bold text-center">
                <div className="p-2.5">Deposit Amounts</div>
                <div className="p-2.5 bg-white text-[#182620] font-mono">0.00</div>
                <div className="p-2.5 bg-white text-[#182620] font-mono">0.00</div>
                <div className="p-2.5 bg-white text-[#182620] font-mono">0.00</div>
                <div className="p-2.5 bg-white text-[#182620] font-mono">0.00</div>
              </div>
              <div className="grid grid-cols-5 border-t border-[#e5f3eb] text-center items-center">
                <div className="p-2.5 bg-[#eaf8f0] font-bold text-[#182620]">Net loss ≥</div>
                <div className="p-2 font-mono text-slate-700">≥200.00<br /><span className="text-[9px] text-[#00a859] font-bold">(2%)</span></div>
                <div className="p-2 font-mono text-slate-700">≥1,000.00<br /><span className="text-[9px] text-[#00a859] font-bold">(3%)</span></div>
                <div className="p-2 font-mono text-slate-700">≥5,000.00<br /><span className="text-[9px] text-[#00a859] font-bold">(5%)</span></div>
                <div className="p-2 font-mono text-slate-700">≥10,000.00<br /><span className="text-[9px] text-[#00a859] font-bold">(8%)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. DAILY SIGN IN MODAL (Matches Screenshots 2, 9, 11 - /m/activity/signIn)
 * ============================================================================ */
interface DailySignInModalProps {
  user: User;
  wallet: Wallet | null;
  overview: ActivityOverviewData | null;
  onClose: () => void;
  onCheckedIn: () => void;
  onOpenDeposit: () => void;
}

export const DailySignInModal: React.FC<DailySignInModalProps> = ({
  user,
  wallet,
  overview,
  onClose,
  onCheckedIn,
  onOpenDeposit,
}) => {
  const [planTab, setPlanTab] = useState<'growth' | 'spin'>('growth');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [requirementConfirm, setRequirementConfirm] = useState<{
    currentBetTk: number;
    requiredBetTk: number;
    currentDepositTk: number;
    requiredDepositTk: number;
  } | null>(null);

  const balanceTk = (wallet?.availablePaisa || 0) / 100;
  const avatarSrc = user.avatarUrl || DEFAULT_CLASSIC_AVATAR;
  const growth = overview?.growthPlan || {
    minDepositTk: 200,
    checkedInToday: false,
    streak: 0,
    totalBonusTk: 0,
    claimedDays: [],
    rewards: [1, 2, 5, 8, 12, 18, 30],
  };
  const spin = overview?.luckySpinPlan || {
    minDepositTk: 1000,
    requiredBetTk: 15000,
    checkedInToday: false,
    claimedDays: [],
    tiers: ['ব্রোঞ্জ স্পিন', 'সিলভার স্পিন', 'গোল্ডেন স্পিন', 'প্লাটিনাম স্পিন', 'ডায়মন্ড স্পিন'],
  };

  const handleCheckIn = async (plan: 'growth' | 'spin') => {
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await safeApiFetch<any>('/api/v1/activity/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (res.ok && res.data?.eligible === false) {
        setRequirementConfirm({
          currentBetTk: res.data.currentBetTk || 0,
          requiredBetTk: res.data.requiredBetTk || 0,
          currentDepositTk: res.data.currentDepositTk || 0,
          requiredDepositTk: res.data.requiredDepositTk || 0,
        });
      } else if (res.ok && res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        onCheckedIn();
      } else {
        setFeedback({ type: 'error', text: res.error || res.data?.error || 'সাইন ইন সম্পন্ন করা যায়নি।' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#f2f9f5] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] text-[#182620]">
        {/* Emerald Top Header */}
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] text-white px-4 h-12 flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="p-2 -ml-2 cursor-pointer" aria-label="Back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-base">Sign In</span>
          <span className="w-8" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Emerald Profile Banner */}
          <div className="bg-gradient-to-br from-[#19c36e] via-[#0fb565] to-[#008744] px-4 pt-4 pb-8 text-white">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc}
                alt={user.username}
                className="w-16 h-16 rounded-full border-2 border-white object-cover shadow"
              />
              <div>
                <div className="text-sm font-black">{user.username}</div>
                <div className="text-xl font-black mt-0.5 tabular-nums">৳ {formatMoney(balanceTk)}</div>
              </div>
            </div>
          </div>

          {/* White Floating Stats Pill */}
          <div className="mx-3 -mt-5 bg-white border border-[#dceee3] rounded-2xl shadow-md p-3 grid grid-cols-2 divide-x divide-[#e5f3eb] text-center">
            <div>
              <div className="text-lg font-black text-[#00a859]">{growth.streak}</div>
              <div className="text-[11px] text-[#557063]">Last sign in</div>
            </div>
            <div>
              <div className="text-lg font-black text-amber-600">{growth.totalBonusTk}</div>
              <div className="text-[11px] text-[#557063]">Sign in total bonus</div>
            </div>
          </div>

          {/* 2-Plan Sub Tabs */}
          <div className="bg-white mt-3 border-b border-[#dceee3] grid grid-cols-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setPlanTab('growth');
                setFeedback(null);
              }}
              className={`py-3 px-2 truncate cursor-pointer border-b-2 transition ${
                planTab === 'growth'
                  ? 'text-[#00a859] border-[#00a859]'
                  : 'text-[#557063] border-transparent hover:text-[#182620]'
              }`}
            >
              নতুন সদস্য বৃদ্ধির পরিকল্পনা
            </button>
            <button
              type="button"
              onClick={() => {
                setPlanTab('spin');
                setFeedback(null);
              }}
              className={`py-3 px-2 truncate cursor-pointer border-b-2 transition ${
                planTab === 'spin'
                  ? 'text-[#00a859] border-[#00a859]'
                  : 'text-[#557063] border-transparent hover:text-[#182620]'
              }`}
            >
              iPhone 18 জেতার জন্য ভাগ্যবান স্পিন
            </button>
          </div>

          {feedback && (
            <div
              className={`mx-3 mt-3 p-3 rounded-xl text-xs font-bold ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* TAB 1: GROWTH PLAN (7 Days) */}
          {planTab === 'growth' && (
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#dceee3]">
                <div className="w-10 h-10 rounded-xl bg-[#e6f7ee] text-[#00a859] flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#00a859]">নতুন সদস্য বৃদ্ধির পরিকল্পনা</div>
                  <div className="text-xs font-semibold text-[#557063]">
                    {growth.checkedInToday ? 'Checked in today ✓' : 'Not checked in today'}
                  </div>
                </div>
              </div>

              <div className="bg-[#eaf8f0] border border-[#cde8d8] rounded-xl p-3 text-xs">
                <div className="text-[#557063]">Minimum deposit amount:</div>
                <div className="text-sm font-black text-[#00a859] mt-0.5">৳ {formatMoney(growth.minDepositTk)}</div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {growth.rewards.map((amt, idx) => {
                  const dayNum = idx + 1;
                  const isClaimed = growth.claimedDays.includes(dayNum);
                  const isNextDay = !growth.checkedInToday && dayNum === (growth.claimedDays.length >= 7 ? 1 : growth.claimedDays.length + 1);
                  return (
                    <div
                      key={dayNum}
                      className="bg-white rounded-xl border border-[#dceee3] overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div className="bg-[#00a859] text-white text-center text-[11px] font-bold py-1">
                        Day {dayNum}
                      </div>
                      <div className="p-2 flex flex-col items-center bg-[#f4fbf7]">
                        <div className="flex items-center gap-1 my-1">
                          <span className="px-1.5 py-1 rounded bg-[#00a859] text-white text-[10px] font-black">৳</span>
                          <span className="px-1.5 py-1 rounded bg-amber-500 text-white text-[10px] font-black">★</span>
                        </div>
                        <div className="w-full flex items-center justify-between text-[11px] font-bold mt-1">
                          <span className="text-[#557063]">Bonus</span>
                          <span className="text-[#182620]">৳ {formatMoney(amt)}</span>
                        </div>
                        <div className="text-[10px] text-[#557063] truncate w-full text-center mt-0.5">
                          নতুন সদস্যপদ প্রোগ্রাম
                        </div>
                      </div>
                      <div className="p-1.5 bg-white">
                        <button
                          type="button"
                          disabled={isClaimed || !isNextDay || submitting}
                          onClick={() => handleCheckIn('growth')}
                          className={`w-full py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            isClaimed
                              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                              : isNextDay
                              ? 'bg-[#00a859] hover:bg-[#008f4a] text-white shadow'
                              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isClaimed ? 'Signed in' : 'Sign In'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: IPHONE 18 LUCKY SPIN (5 Days) */}
          {planTab === 'spin' && (
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#dceee3]">
                <div className="w-10 h-10 rounded-xl bg-[#e6f7ee] text-[#00a859] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#00a859]">
                    iPhone 18 জেতার জন্য প্রতিদিন ভাগ্যবান স্পিন
                  </div>
                  <div className="text-xs font-semibold text-[#557063]">
                    {spin.checkedInToday ? 'Checked in today ✓' : 'Not checked in today'}
                  </div>
                </div>
              </div>

              <div className="bg-[#eaf8f0] border border-[#cde8d8] rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[#557063]">Minimum deposit amount:</div>
                  <div className="text-sm font-black text-[#00a859] mt-0.5">৳ {formatMoney(spin.minDepositTk)}</div>
                </div>
                <div>
                  <div className="text-[#557063]">Betting conditions:</div>
                  <div className="text-sm font-black text-[#00a859] mt-0.5">৳ {formatMoney(spin.requiredBetTk)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {spin.tiers.map((tierName, idx) => {
                  const dayNum = idx + 1;
                  const isClaimed = spin.claimedDays.includes(dayNum);
                  const isNextDay = !spin.checkedInToday && dayNum === (spin.claimedDays.length >= 5 ? 1 : spin.claimedDays.length + 1);
                  return (
                    <div
                      key={dayNum}
                      className="bg-white rounded-xl border border-[#dceee3] overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div className="bg-[#00a859] text-white text-center text-[11px] font-bold py-1">
                        Day {dayNum}
                      </div>
                      <div className="p-2 flex flex-col items-center bg-[#f4fbf7]">
                        <svg viewBox="0 0 64 64" className="w-12 h-12 my-1">
                          <circle cx="32" cy="32" r="28" fill="#fbbf24" />
                          <circle cx="32" cy="32" r="23" fill="#00a859" />
                          <path d="M32 9 L32 55 M9 32 L55 32 M16 16 L48 48 M48 16 L16 48" stroke="#6ee7b7" strokeWidth="2" />
                          <circle cx="32" cy="32" r="7" fill="#ef4444" stroke="#fde047" strokeWidth="2" />
                        </svg>
                        <div className="text-[10px] text-[#182620] font-semibold text-center leading-tight line-clamp-2">
                          জিততে প্রতিদিন লগ ইন করুন-{tierName}
                        </div>
                      </div>
                      <div className="p-1.5 bg-white">
                        <button
                          type="button"
                          disabled={isClaimed || !isNextDay || submitting}
                          onClick={() => handleCheckIn('spin')}
                          className={`w-full py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            isClaimed
                              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                              : isNextDay
                              ? 'bg-[#00a859] hover:bg-[#008f4a] text-white shadow'
                              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isClaimed ? 'Signed in' : 'Sign In'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CONFIRMATION REQUIREMENT DIALOG */}
        {requirementConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
            <div className="fixed inset-0 bg-black/60" onClick={() => setRequirementConfirm(null)} />
            <div className="relative z-10 w-full max-w-xs bg-white rounded-xl p-5 shadow-2xl text-slate-900 space-y-3 border border-[#cde8d8]">
              <h3 className="text-lg font-bold text-[#182620]">Confirmation</h3>
              <div className="text-sm text-[#557063] space-y-1 leading-relaxed">
                <p>Complete the requirement to receive the reward</p>
                <p>Current bet amount :{requirementConfirm.currentBetTk}</p>
                <p>Required bet amount :{requirementConfirm.requiredBetTk}</p>
                <p>Current deposit amount :{requirementConfirm.currentDepositTk}</p>
                <p>Required deposit amount :{requirementConfirm.requiredDepositTk.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-end gap-5 pt-2 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setRequirementConfirm(null)}
                  className="text-slate-500 hover:text-slate-800 px-2 py-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequirementConfirm(null);
                    onClose();
                    onOpenDeposit();
                  }}
                  className="text-[#00a859] hover:text-[#008f4a] px-2 py-1 cursor-pointer"
                >
                  GO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. BONUS / RECEIVING CENTER & GOLDEN EGG VOUCHERS (Screenshots 8 & 12)
 * ============================================================================ */
interface BonusReceivingModalProps {
  user: User;
  wallet: Wallet | null;
  overview: ActivityOverviewData | null;
  onClose: () => void;
  onClaimed: () => void;
  onOpenDeposit: () => void;
}

const VoucherCardRow: React.FC<{
  voucher: ActivityOverviewData['vouchers'][number];
  onClaim: (id: ActivityOverviewData['vouchers'][number]['id']) => void;
  onOpenDeposit: () => void;
  claimingId: string | null;
}> = ({ voucher, onClaim, onOpenDeposit, claimingId }) => {
  const { days, hms } = useCountdown(voucher.dueAtIso);
  const [expandedDesc, setExpandedDesc] = useState(false);

  const stubGradient =
    voucher.id === 'deposit_bonus'
      ? 'from-[#19c36e] to-[#008f4a]'
      : voucher.id === 'lucky_spin_bonus'
      ? 'from-[#3b82f6] to-[#1d4ed8]'
      : 'from-[#ff5f3d] to-[#e6162d]';

  const stubLabel =
    voucher.badgeLabel ||
    (voucher.id === 'deposit_bonus'
      ? 'Deposit Bonus'
      : voucher.id === 'lucky_spin_bonus'
      ? 'Lucky Spin'
      : 'Smash & Win');

  return (
    <div className="bg-white rounded-2xl border border-[#cde8d8] p-3 shadow-xs space-y-2">
      <div className="flex items-stretch gap-2.5">
        {/* Colored Voucher Stub */}
        <div className={`w-28 shrink-0 rounded-xl bg-gradient-to-br ${stubGradient} text-white p-2.5 flex flex-col items-center justify-center text-center shadow-sm`}>
          <span className="text-[9px] font-bold tracking-wide uppercase opacity-90">REWARD VOUCHER</span>
          <span className="text-xs font-black mt-0.5 leading-tight">{stubLabel}</span>
          <span className="text-[10px] font-mono mt-1 opacity-90">{voucher.dueDateStr}</span>
        </div>

        {/* Middle Title & Description Toggle */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="text-xs font-black text-[#182620] line-clamp-2">{voucher.titleBn}</div>
            <div className="text-[11px] text-[#557063] mt-0.5 line-clamp-2">
              Reward : {voucher.subtitleBn}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setExpandedDesc((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eaf8f0] hover:bg-[#d7f3e3] text-[#008f4a] text-[10px] font-bold cursor-pointer"
            >
              <span>Description</span>
              <Info className="w-3 h-3" />
            </button>
            {!voucher.claimed && !voucher.eligible && voucher.requiredTk > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Need ৳{voucher.requiredTk.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Right Countdown & Green Claim Button */}
        <div className="w-24 shrink-0 flex flex-col items-center justify-between text-center">
          <div className="text-[10px] text-[#557063]">Due Date</div>
          <div className="font-black text-[#182620] leading-tight">
            <span className="text-lg">{days}</span> <span className="text-[11px] font-bold">Day</span>
            <div className="text-[11px] font-mono font-bold text-[#182620]">{hms}</div>
          </div>
          <button
            type="button"
            disabled={voucher.claimed || claimingId === voucher.id}
            onClick={() => onClaim(voucher.id)}
            className={`w-full py-1.5 rounded-full text-xs font-bold transition cursor-pointer mt-1 ${
              voucher.claimed
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#17c917] hover:bg-[#14b314] text-white shadow'
            }`}
          >
            {voucher.claimed ? 'Claimed' : claimingId === voucher.id ? '...' : 'Claim'}
          </button>
        </div>
      </div>

      {expandedDesc && (
        <div className="p-2.5 rounded-xl bg-[#f4fbf7] border border-[#cde8d8] text-[11px] text-[#182620] flex items-center justify-between gap-2">
          <span className="leading-relaxed">{voucher.conditionTextBn}</span>
          {!voucher.claimed && !voucher.eligible && voucher.requiredTk > 0 && (
            <button
              type="button"
              onClick={onOpenDeposit}
              className="px-2.5 py-1 rounded-lg bg-[#00a859] hover:bg-[#008f4a] text-white text-[10px] font-bold shrink-0 cursor-pointer"
            >
              Deposit
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const BonusReceivingModal: React.FC<BonusReceivingModalProps> = ({
  user,
  wallet,
  overview,
  onClose,
  onClaimed,
  onOpenDeposit,
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string; needsDeposit?: boolean } | null>(null);
  const [filterCat, setFilterCat] = useState<'all' | 'deposit' | 'spin' | 'egg'>('all');

  const balanceTk = (wallet?.availablePaisa || 0) / 100;
  const avatarSrc = user.avatarUrl || DEFAULT_CLASSIC_AVATAR;

  const handleClaimVoucher = async (voucherId: ActivityOverviewData['vouchers'][number]['id']) => {
    setClaimingId(voucherId);
    setFeedback(null);
    try {
      const res = await safeApiFetch<any>('/api/v1/activity/voucher/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ voucherId }),
      });

      if (res.ok && res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        onClaimed();
      } else {
        setFeedback({
          type: 'error',
          text: res.data?.error || res.error || 'ক্লেইম করা যায়নি।',
          needsDeposit: res.data?.eligible === false,
        });
      }
    } finally {
      setClaimingId(null);
    }
  };

  const vouchersList = (overview?.vouchers || []).filter(
    (v) => filterCat === 'all' || v.category === filterCat
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#f2f9f5] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] text-[#182620]">
        {/* Emerald Top Header */}
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] text-white px-4 h-12 flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="p-2 -ml-2 cursor-pointer" aria-label="Back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-base">Bonus</span>
          <Ticket className="w-5 h-5" />
        </div>

        {/* Crisp Emerald-Sky Bonus Wallet Banner (Compact) */}
        <div className="bg-gradient-to-br from-[#19c36e] via-[#0fb565] to-[#008744] px-4 py-4 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatarSrc}
              alt={user.username}
              className="w-12 h-12 rounded-full border-2 border-white object-cover shadow shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-100 truncate">{user.username}</div>
              <div className="text-lg font-black mt-0.5 tabular-nums">৳ {formatMoney(balanceTk)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDeposit();
            }}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#008f4a] text-xs font-black shadow hover:bg-emerald-50 transition cursor-pointer shrink-0"
          >
            + Deposit
          </button>
        </div>

        {/* Bonus Type Filter Pills */}
        <div className="px-3 pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {(
            [
              { id: 'all', label: 'All Bonus' },
              { id: 'deposit', label: 'Deposit Bonus' },
              { id: 'spin', label: 'Lucky Spin' },
              { id: 'egg', label: 'Smash & Win' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCat(tab.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                filterCat === tab.id
                  ? 'bg-[#00a859] text-white shadow-xs'
                  : 'bg-white text-[#557063] border border-[#cde8d8] hover:bg-[#eaf8f0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              <span>{feedback.text}</span>
              {(feedback.type === 'error' || feedback.needsDeposit) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#00a859] text-white text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  Deposit
                </button>
              )}
            </div>
          )}

          {vouchersList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#cde8d8] p-8 text-center text-xs text-[#557063]">
              এই ক্যাটাগরিতে কোনো বোনাস ভাউচার পাওয়া যায়নি।
            </div>
          ) : (
            vouchersList.map((v) => (
              <VoucherCardRow
                key={v.id}
                voucher={v}
                onClaim={handleClaimVoucher}
                onOpenDeposit={() => {
                  onClose();
                  onOpenDeposit();
                }}
                claimingId={claimingId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4B. POST-LOGIN / SITE-ENTRY REWARDS POPUP MODAL (Matches Screenshot 2)
 * ============================================================================ */
const LoginRewardPopupCard: React.FC<{
  voucher: ActivityOverviewData['vouchers'][number];
  onClaim: (id: ActivityOverviewData['vouchers'][number]['id']) => void;
  onOpenDeposit: () => void;
  claimingId: string | null;
}> = ({ voucher, onClaim, onOpenDeposit, claimingId }) => {
  const { days, hms } = useCountdown(voucher.dueAtIso);
  const [expandedCond, setExpandedCond] = useState(false);

  const statusText = voucher.claimed
    ? 'Claimed'
    : voucher.eligible
    ? 'Ready'
    : 'Incomplete';

  return (
    <div className="relative pt-3">
      {/* Floating Golden Egg + Hammer Icon Badge on top-left */}
      <div className="absolute -top-0.5 -left-1.5 z-20 w-10 h-10 drop-shadow-md pointer-events-none select-none">
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="popupEggGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <ellipse cx="26" cy="36" rx="15" ry="20" fill="url(#popupEggGold)" stroke="#fff7ed" strokeWidth="2" />
          <path d="M18 28 Q24 20 28 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
          <g transform="rotate(28 44 26)">
            <rect x="41" y="18" width="5" height="22" rx="2.5" fill="#d97706" />
            <rect x="33" y="10" width="20" height="12" rx="4" fill="#9333ea" stroke="#facc15" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      <div className="rounded-xl overflow-hidden shadow-xl border border-white/30 bg-white">
        {/* Card Gradient Body */}
        <div className="relative bg-gradient-to-br from-[#6d8ba7] via-[#7c94ab] to-[#98aab8] text-white px-3.5 pt-8 pb-3.5">
          {/* Status Ribbon Top-Left */}
          <div
            className={`absolute top-0 left-0 pl-9 pr-4 py-1 text-[11px] font-bold rounded-br-2xl shadow ${
              voucher.claimed
                ? 'bg-slate-600 text-slate-200'
                : voucher.eligible
                ? 'bg-[#00a859] text-white'
                : 'bg-[#19284c] text-white'
            }`}
          >
            {statusText}
          </div>

          {/* Countdown Top-Right */}
          <div className="absolute top-1.5 right-3 text-[11px] font-mono font-bold text-white/95 drop-shadow-xs">
            {days > 0 ? `${days} Day ` : ''}
            {hms}
          </div>

          {/* Bangla Title + ? Help Icon + Claim Button */}
          <div className="flex items-center justify-between gap-2.5 mt-1">
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <p className="text-sm font-black leading-snug text-white drop-shadow-xs line-clamp-3">
                {voucher.titleBn}
              </p>
              <button
                type="button"
                onClick={() => setExpandedCond((v) => !v)}
                className="w-4 h-4 rounded-full bg-white/80 text-slate-700 hover:bg-white flex items-center justify-center text-[10px] font-black shrink-0 cursor-pointer"
                aria-label="Toggle voucher info"
              >
                ?
              </button>
            </div>

            <button
              type="button"
              disabled={voucher.claimed || claimingId === voucher.id}
              onClick={() => onClaim(voucher.id)}
              className={`px-5 py-1.5 rounded-full text-xs font-black shadow-md transition shrink-0 cursor-pointer ${
                voucher.claimed
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#ff4d24] to-[#f93216] hover:brightness-110 text-white active:scale-95'
              }`}
            >
              {voucher.claimed ? 'Claimed' : claimingId === voucher.id ? '...' : 'Claim'}
            </button>
          </div>
        </div>

        {/* Bottom White Accordion Bar: Voucher conditions */}
        <button
          type="button"
          onClick={() => setExpandedCond((v) => !v)}
          className="w-full px-3.5 py-2 bg-white hover:bg-[#f4fbf7] text-[#334155] text-xs font-semibold flex items-center justify-between cursor-pointer transition"
        >
          <span>Voucher conditions</span>
          <ChevronRight
            className={`w-4 h-4 text-slate-500 transition-transform ${
              expandedCond ? '-rotate-90' : 'rotate-90'
            }`}
          />
        </button>

        {expandedCond && (
          <div className="px-3.5 py-2.5 bg-[#f4fbf7] border-t border-[#dceee3] text-[11px] text-[#182620] flex items-center justify-between gap-2">
            <span className="leading-relaxed">{voucher.conditionTextBn}</span>
            {!voucher.claimed && !voucher.eligible && voucher.requiredTk > 0 && (
              <button
                type="button"
                onClick={onOpenDeposit}
                className="px-2.5 py-1 rounded-lg bg-[#00a859] text-white text-[10px] font-bold shrink-0 cursor-pointer"
              >
                Deposit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const LoginRewardsPopupModal: React.FC<{
  user: User;
  overview: ActivityOverviewData | null;
  onClose: () => void;
  onClaimed: () => void;
  onOpenDeposit: () => void;
}> = ({ user, overview, onClose, onClaimed, onOpenDeposit }) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string; needsDeposit?: boolean } | null>(null);

  const handleClaimVoucher = async (voucherId: ActivityOverviewData['vouchers'][number]['id']) => {
    setClaimingId(voucherId);
    setFeedback(null);
    try {
      const res = await safeApiFetch<any>('/api/v1/activity/voucher/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ voucherId }),
      });
      if (res.ok && res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        onClaimed();
      } else {
        setFeedback({
          type: 'error',
          text: res.data?.error || res.error || 'ক্লেইম করা যায়নি।',
          needsDeposit: res.data?.eligible === false,
        });
      }
    } finally {
      setClaimingId(null);
    }
  };

  const vouchers = overview?.vouchers || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Top-Right Circular X Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-0 z-30 w-8 h-8 rounded-full border-2 border-white bg-black/45 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer shadow-lg transition"
          aria-label="Close rewards popup"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Crown + Laurel + Horns + Red Ribbon Header */}
        <div className="relative flex flex-col items-center -mb-2 z-20 select-none pointer-events-none">
          <svg viewBox="0 0 260 88" className="w-60 h-20 drop-shadow-xl">
            <defs>
              <linearGradient id="crownGoldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="ribbonRedGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#ff4d2e" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            {/* Left & Right Trumpets */}
            <path d="M20 56 L68 42 L72 52 L24 64 Z" fill="#f59e0b" />
            <ellipse cx="22" cy="60" rx="5" ry="9" transform="rotate(-15 22 60)" fill="#fbbf24" />
            <path d="M240 56 L192 42 L188 52 L236 64 Z" fill="#f59e0b" />
            <ellipse cx="238" cy="60" rx="5" ry="9" transform="rotate(15 238 60)" fill="#fbbf24" />
            {/* Laurel Leaves */}
            <ellipse cx="80" cy="40" rx="9" ry="5" transform="rotate(-35 80 40)" fill="#fbbf24" />
            <ellipse cx="70" cy="48" rx="8" ry="4" transform="rotate(-25 70 48)" fill="#f59e0b" />
            <ellipse cx="180" cy="40" rx="9" ry="5" transform="rotate(35 180 40)" fill="#fbbf24" />
            <ellipse cx="190" cy="48" rx="8" ry="4" transform="rotate(25 190 48)" fill="#f59e0b" />
            {/* Golden Crown */}
            <path
              d="M92 52 L84 22 L110 34 L130 12 L150 34 L176 22 L168 52 Z"
              fill="url(#crownGoldGrad)"
              stroke="#fef08a"
              strokeWidth="2"
            />
            <circle cx="130" cy="36" r="6" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="84" cy="20" r="4" fill="#fef08a" />
            <circle cx="130" cy="10" r="5" fill="#fef08a" />
            <circle cx="176" cy="20" r="4" fill="#fef08a" />
            {/* Ribbon Banner */}
            <path d="M28 52 L50 52 L44 82 L20 82 L32 67 Z" fill="#b91c1c" />
            <path d="M232 52 L210 52 L216 82 L240 82 L228 67 Z" fill="#b91c1c" />
            <rect x="44" y="48" width="172" height="32" rx="6" fill="url(#ribbonRedGrad)" stroke="#fca5a5" strokeWidth="1.2" />
            <text
              x="130"
              y="70"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="18"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              Rewards
            </text>
          </svg>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`w-full mb-2.5 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-md ${
              feedback.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
            }`}
          >
            <span>{feedback.text}</span>
            {feedback.needsDeposit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#00a859] text-white text-[11px] font-bold shrink-0 cursor-pointer"
              >
                Deposit
              </button>
            )}
          </div>
        )}

        {/* Scrollable Voucher Cards Stack */}
        <div className="w-full max-h-[62vh] overflow-y-auto space-y-3 pr-1 pb-2">
          {vouchers.length === 0 ? (
            <div className="bg-white/95 rounded-2xl p-6 text-center text-xs font-bold text-[#182620]">
              লোড হচ্ছে... আপনার সব বোনাস ভাউচার প্রস্তুত করা হচ্ছে।
            </div>
          ) : (
            vouchers.map((v) => (
              <LoginRewardPopupCard
                key={v.id}
                voucher={v}
                onClaim={handleClaimVoucher}
                onOpenDeposit={() => {
                  onClose();
                  onOpenDeposit();
                }}
                claimingId={claimingId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 5. PROMO CODE REDEEM MODAL
 * ============================================================================ */
export const PromoCodeModal: React.FC<{
  user: User;
  onClose: () => void;
  onRedeemed: () => void;
}> = ({ user, onClose, onRedeemed }) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await safeApiFetch<{ success: boolean; message: string }>('/api/v1/activity/promo/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok && res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        setCode('');
        onRedeemed();
      } else {
        setFeedback({ type: 'error', text: res.error || 'কোডটি ব্যবহার করা যায়নি।' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl text-[#182620] border border-[#cde8d8]">
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] text-white px-4 h-12 flex items-center justify-between">
          <span className="font-bold text-sm flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            <span>Promo Code</span>
          </span>
          <button type="button" onClick={onClose} className="p-1.5 cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleRedeem} className="p-5 space-y-4">
          <p className="text-xs text-[#557063]">
            অফিসিয়াল প্রোমো কোড লিখে তাৎক্ষণিক বোনাস আপনার ওয়ালেটে যুক্ত করুন।
          </p>
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="প্রোমো কোড লিখুন (যেমন: FB88WIN)"
            className="w-full px-4 py-3 rounded-xl bg-[#f4fbf7] border border-[#cde8d8] text-sm font-mono font-bold uppercase text-[#182620] focus:outline-hidden focus:border-[#00a859]"
          />
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-black text-sm shadow transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'যাচাই হচ্ছে...' : 'ক্লেইম করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
 * 6. SUGGESTION MODAL (Player Feedback -> Admin Inbox)
 * ============================================================================ */
export const SuggestionModal: React.FC<{
  user: User;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const [category, setCategory] = useState('Website & UI');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5 || submitting) {
      setFeedback({ type: 'error', text: 'অন্তত ৫ অক্ষরের মতামত লিখুন।' });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await safeApiFetch<{ success: boolean; message: string }>('/api/v1/user/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ category, message: message.trim() }),
      });
      if (res.ok && res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        setMessage('');
      } else {
        setFeedback({ type: 'error', text: res.error || 'মতামত পাঠানো যায়নি।' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl text-[#182620] border border-[#cde8d8]">
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] text-white px-4 h-12 flex items-center justify-between">
          <span className="font-bold text-sm flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4" />
            <span>Suggestion (মতামত ও পরামর্শ)</span>
          </span>
          <button type="button" onClick={onClose} className="p-1.5 cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#557063] block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#f4fbf7] border border-[#cde8d8] text-xs font-semibold text-[#182620]"
            >
              <option value="Website & UI">Website &amp; UI</option>
              <option value="Aviator Crash">Aviator Crash</option>
              <option value="Deposit / Withdrawal">Deposit / Withdrawal</option>
              <option value="Rewards & Bonus">Rewards &amp; Bonus</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#557063] block mb-1">আপনার মতামত</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="আপনার পরামর্শ বা সমস্যার কথা বিস্তারিত লিখুন..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#f4fbf7] border border-[#cde8d8] text-xs text-[#182620] focus:outline-hidden focus:border-[#00a859]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-black text-sm shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'পাঠানো হচ্ছে...' : 'Submit Suggestion'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
 * 7. AVATAR PICKER MODAL
 * ============================================================================ */
export const AvatarPickerModal: React.FC<{
  user: User;
  onClose: () => void;
  onUserUpdate: (u: User) => void;
}> = ({ user, onClose, onUserUpdate }) => {
  const [selectedSrc, setSelectedSrc] = useState<string>(user.avatarUrl || DEFAULT_CLASSIC_AVATAR);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_200_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const res = await safeApiFetch<{ user: User }>('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({ avatarUrl: selectedSrc }),
      });
      if (res.ok && res.data?.user) {
        onUserUpdate(res.data.user);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-gradient-to-b from-[#eaf8f0] via-white to-white border border-[#cde8d8] rounded-2xl p-6 shadow-2xl text-[#182620] space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Uploadable Avatar Circle */}
        <div className="flex flex-col items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#00a859] shadow-lg group cursor-pointer"
            title="Upload your own avatar"
          >
            <img src={selectedSrc} alt="Selected avatar" className="w-full h-full object-cover" />
            <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
              <Upload className="w-5 h-5" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#557063] hover:text-[#182620] cursor-pointer"
          >
            Click the image to upload your own avatar
          </button>
        </div>

        {/* Classic Avatar 2x4 Grid */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-[#182620]">Classic avatar</div>
          <div className="grid grid-cols-4 gap-3 justify-items-center">
            {CLASSIC_AVATARS.map((av) => {
              const isSelected = selectedSrc === av.src;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedSrc(av.src)}
                  className={`w-16 h-16 rounded-full overflow-hidden transition cursor-pointer ${
                    isSelected ? 'ring-3 ring-[#00a859] scale-105 shadow-md' : 'ring-1 ring-[#dceee3] hover:ring-[#00a859]/50'
                  }`}
                >
                  <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-sm font-semibold text-[#557063] pt-1">
            <ChevronLeft className="w-4 h-4 text-slate-300" />
            <span>1 / 1</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="w-full py-3 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-bold text-base shadow-lg active:scale-[0.99] transition cursor-pointer"
        >
          {saving ? 'Saving...' : 'OK'}
        </button>
      </div>
    </div>
  );
};
