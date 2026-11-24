/**
 * Official Invite Friends / Affiliate Program Modal
 * Matches Screenshots 3-6 & 10:
 * Tabs: Overview | Rewards | Earnings | Records | Invited List
 * Real server-backed metrics, scannable QR code + download, social links,
 * platform-wide released rewards, live leaderboard, and milestone rewards.
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  X,
  Copy,
  Check,
  HelpCircle,
  Award,
  Coins,
  TrendingUp,
  Users,
  Sparkles,
  Wallet as WalletIcon,
  Calendar,
  ShieldCheck,
  Send,
  Star,
  RefreshCw,
} from 'lucide-react';
import type {
  User,
  Wallet,
  ReferralSummary,
  ReferralAchievementLevel,
  ReferralCommissionRecord,
  ReferralReferee,
} from '../types';
import { safeApiFetch } from '../utils/api';
import { QrCodeMatrix } from './QrCodeMatrix';

interface ReferralModalProps {
  user: User | null;
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshWallet: () => Promise<void> | void;
  onRequireAuth: () => void;
  lang?: 'bn' | 'en';
}

export type ReferralTab = 'overview' | 'rewards' | 'earnings' | 'records' | 'invited';

function formatMoney(val: number): string {
  return Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getBdtDateStr(offsetDays = 0): string {
  const now = new Date(Date.now() + 6 * 3600 * 1000 + offsetDays * 86400 * 1000);
  return now.toISOString().slice(0, 10);
}

export function ReferralModal({
  user,
  isOpen,
  onClose,
  onRefreshWallet,
  onRequireAuth,
  lang = 'bn',
}: ReferralModalProps) {
  const [activeTab, setActiveTab] = useState<ReferralTab>('overview');
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [records, setRecords] = useState<ReferralCommissionRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<ReferralReferee[]>([]);
  const [invitedTierFilter, setInvitedTierFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [onlyToday, setOnlyToday] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReferralData = async () => {
    if (!user?.sessionToken) return;
    setLoading(true);
    try {
      const [sumRes, recRes, teamRes] = await Promise.all([
        safeApiFetch<{ summary: ReferralSummary }>('/api/v1/referral/summary', {
          headers: { Authorization: `Bearer ${user.sessionToken}` },
        }),
        safeApiFetch<{ records: ReferralCommissionRecord[] }>('/api/v1/referral/records', {
          headers: { Authorization: `Bearer ${user.sessionToken}` },
        }),
        safeApiFetch<{ members: ReferralReferee[] }>('/api/v1/referral/team', {
          headers: { Authorization: `Bearer ${user.sessionToken}` },
        }),
      ]);

      if (sumRes.ok && sumRes.data?.summary) setSummary(sumRes.data.summary);
      if (recRes.ok && recRes.data?.records) setRecords(recRes.data.records);
      if (teamRes.ok && teamRes.data?.members) setTeamMembers(teamRes.data.members);
    } catch (e) {
      console.error('Fetch referral data error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!user) {
        onRequireAuth();
        onClose();
        return;
      }
      fetchReferralData();
    }
  }, [isOpen, user?.sessionToken]);

  if (!isOpen || !user) return null;

  const currentReferralCode =
    summary?.referralCode || user.referralCode || `REF${user.username.slice(0, 5).toUpperCase()}88`;
  const shareUrl =
    summary?.referralLink ||
    `${typeof window !== 'undefined' ? window.location.origin : ''}/?referralCode=${currentReferralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleClaimCommission = async () => {
    if (!summary || summary.claimableCommissionPaisa <= 0 || claiming) return;
    setClaiming(true);
    setActionFeedback(null);
    try {
      const res = await safeApiFetch<{ success: boolean; claimedTk: number; message: string }>(
        '/api/v1/referral/claim',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.sessionToken}` },
        }
      );
      if (res.ok && res.data) {
        setActionFeedback({
          type: 'success',
          message: res.data.message || `৳${res.data.claimedTk.toFixed(2)} সফলভাবে মূল ওয়ালেটে যুক্ত হয়েছে!`,
        });
        await onRefreshWallet();
        await fetchReferralData();
      } else {
        setActionFeedback({
          type: 'error',
          message: res.error || 'কমিশন ক্লেইম করতে ব্যর্থ হয়েছে।',
        });
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimAchievement = async (level: number) => {
    if (claiming) return;
    setClaiming(true);
    setActionFeedback(null);
    try {
      const res = await safeApiFetch<{ success: boolean; rewardTk: number; message: string }>(
        '/api/v1/referral/claim-achievement',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.sessionToken}`,
          },
          body: JSON.stringify({ level }),
        }
      );
      if (res.ok && res.data) {
        setActionFeedback({
          type: 'success',
          message: res.data.message || `অভিনন্দন! ৳${res.data.rewardTk} ওয়ালেটে যুক্ত হয়েছে!`,
        });
        await onRefreshWallet();
        await fetchReferralData();
      } else {
        setActionFeedback({
          type: 'error',
          message: res.error || 'টার্গেট পূরণ হয়নি অথবা ইতিমধ্যেই ক্লেইম করা হয়েছে।',
        });
      }
    } finally {
      setClaiming(false);
    }
  };

  const todayIncomeTk = (summary?.todayIncomePaisa ?? summary?.todayCommissionPaisa ?? 0) / 100;
  const yesterdayIncomeTk = (summary?.yesterdayIncomePaisa ?? 0) / 100;
  const totalRegisters = summary?.totalInvited ?? teamMembers.length;
  const validReferrals = summary?.activeFriendsCount ?? 0;
  const claimableTk = (summary?.claimableCommissionPaisa ?? 0) / 100;
  const totalEarnedTk = (summary?.totalCommissionPaisa ?? 0) / 100;

  const platformTotals = summary?.platformTotals || {
    invitationRewardsTk: 0,
    invitationClaimedCount: 0,
    achievementRewardsTk: 0,
    achievementClaimedCount: 0,
    depositRebateTk: 0,
    depositClaimedCount: 0,
    bettingRebateTk: 0,
    bettingClaimedCount: 0,
  };

  const todayStr = getBdtDateStr(0);
  const mmdd = `${todayStr.slice(5, 7)}/${todayStr.slice(8, 10)}`;

  const filteredTeam = teamMembers.filter((m) => {
    if (invitedTierFilter !== 'all' && m.tier !== invitedTierFilter) return false;
    if (onlyToday) {
      const joinedBdt = new Date(new Date(m.joinedAt).getTime() + 6 * 3600 * 1000).toISOString().slice(0, 10);
      if (joinedBdt !== todayStr) return false;
    }
    return true;
  });

  const EmptyPaperPlane = ({ label = 'No data' }: { label?: string }) => (
    <div className="py-14 flex flex-col items-center justify-center text-center gap-2">
      <svg viewBox="0 0 120 100" className="w-28 h-24 text-[#00a859]">
        <rect x="28" y="54" width="64" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M28 54 L36 42 L84 42 L92 54" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M46 66 H74" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M58 46 Q52 34 64 28 Q74 23 70 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        <polygon points="62,12 90,6 76,26 70,18" fill="currentColor" />
      </svg>
      <span className="text-sm font-semibold text-[#00a859]">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#f2f9f5] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[92vh] text-[#182620]">
        {/* Top Emerald Header */}
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] text-white px-4 h-12 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-base">
            {lang === 'bn' ? 'Invite Friends (বন্ধু আমন্ত্রণ)' : 'Invite Friends'}
          </span>
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="p-2 -mr-2 hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Rules"
            title="Affiliate Rules"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="bg-white border-b border-[#dceee3] px-2 flex items-center overflow-x-auto no-scrollbar shrink-0">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'rewards', label: 'Rewards' },
              { id: 'earnings', label: 'Earnings' },
              { id: 'records', label: 'Records' },
              { id: 'invited', label: 'Invited List' },
            ] as const
          ).map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'text-[#00a859] border-[#00a859]'
                    : 'text-[#557063] border-transparent hover:text-[#182620]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Global Action Feedback */}
        {actionFeedback && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 ${
              actionFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            <span>{actionFeedback.message}</span>
            <button type="button" onClick={() => setActionFeedback(null)} className="p-1 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {loading && !summary && (
            <div className="flex items-center justify-center py-6 text-xs text-[#557063] gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00a859]" />
              <span>Loading referral statistics...</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* My Tier Card */}
              <div className="bg-white rounded-2xl border border-[#dceee3] shadow-xs overflow-hidden p-3 space-y-2.5">
                <div className="rounded-xl bg-gradient-to-r from-[#e4f7ec] via-[#d3f2e0] to-[#eafaf1] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#557063]">My Tier</div>
                    <div className="text-xl font-black text-[#182620] mt-0.5">Default</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-xs flex items-center justify-center text-[#00a859] font-black text-lg">
                    ◆
                  </div>
                </div>

                <div className="rounded-xl bg-[#dcfce7] text-[#14532d] py-3 px-4 text-center text-xs font-semibold">
                  This is the highest level.
                </div>

                <div className="grid grid-cols-3 divide-x divide-[#e5f3eb] bg-[#f4fbf7] rounded-xl py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('rewards')}
                    className="flex flex-col items-center gap-1 px-1 cursor-pointer hover:opacity-80"
                  >
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-semibold text-[#182620] leading-tight">
                      Achievement
                      <br />
                      Rewards
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('earnings')}
                    className="flex flex-col items-center gap-1 px-1 cursor-pointer hover:opacity-80"
                  >
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-[11px] font-semibold text-[#182620] leading-tight">
                      Deposit Rebate
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('earnings')}
                    className="flex flex-col items-center gap-1 px-1 cursor-pointer hover:opacity-80"
                  >
                    <TrendingUp className="w-5 h-5 text-[#00a859]" />
                    <span className="text-[11px] font-semibold text-[#182620] leading-tight">
                      Betting Rebate
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Summary Tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-[#2ad17e] to-[#00a859] text-white p-3.5 text-center shadow-sm">
                  <div className="text-xs font-semibold opacity-95">Today&apos;s Income</div>
                  <div className="text-xl font-black mt-1 font-mono tabular-nums">
                    ৳ {formatMoney(todayIncomeTk)}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#34d399] to-[#059669] text-white p-3.5 text-center shadow-sm">
                  <div className="text-xs font-semibold opacity-95">Yesterday&apos;s Income</div>
                  <div className="text-xl font-black mt-1 font-mono tabular-nums">
                    ৳ {formatMoney(yesterdayIncomeTk)}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#38bdf8] to-[#0284c7] text-white p-3.5 text-center shadow-sm">
                  <div className="text-xs font-semibold opacity-95">Registers</div>
                  <div className="text-xl font-black mt-1 font-mono tabular-nums">{totalRegisters}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#d97706] text-white p-3.5 text-center shadow-sm">
                  <div className="text-xs font-semibold opacity-95">Valid Referral</div>
                  <div className="text-xl font-black mt-1 font-mono tabular-nums">{validReferrals}</div>
                </div>
              </div>

              {/* Claimable Commission Quick Bar */}
              <div className="bg-white rounded-2xl border border-[#dceee3] p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="text-[11px] font-semibold text-[#557063]">Claimable Commission (0x Turnover)</div>
                  <div className="text-lg font-black text-[#00a859] font-mono">৳ {formatMoney(claimableTk)}</div>
                </div>
                <button
                  type="button"
                  disabled={claimableTk <= 0 || claiming}
                  onClick={handleClaimCommission}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    claimableTk > 0 && !claiming
                      ? 'bg-[#00a859] hover:bg-[#008f4a] text-white shadow'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {claiming ? 'Claiming...' : 'Claim to Wallet'}
                </button>
              </div>

              {/* Emerald Promo Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#19c36e] via-[#0fb565] to-[#008744] text-white p-4 shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-300/20 border border-amber-200/40 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-amber-200" />
                  </div>
                  <div>
                    <div className="text-sm font-black">Invite friends and earn rewards together</div>
                    <div className="text-[11px] text-emerald-50">
                      Up to ৳39,888 Achievement Prizes + 3-Tier Lifetime Rebates
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(true)}
                  className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white shrink-0 cursor-pointer"
                  title="Commission Rules"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Share With Your Friends (QR Code + Copy Link + Social Links) */}
              <div className="bg-white rounded-2xl border border-[#dceee3] p-4 shadow-xs space-y-3">
                <div className="text-sm font-black text-[#059669]">Share with your friends</div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <QrCodeMatrix value={shareUrl} referralCode={currentReferralCode} size={108} />

                  <div className="flex-1 w-full space-y-3">
                    {/* Link copy bar */}
                    <div className="flex items-center gap-2 bg-[#f4fbf7] border border-[#cde8d8] rounded-full pl-3.5 pr-1.5 py-1.5">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 bg-transparent text-xs font-mono text-[#182620] focus:outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-8 h-8 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center shrink-0 cursor-pointer transition"
                        title="Copy invite link"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Code copy pill */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                      <span className="text-slate-500 font-semibold">Referral Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900">{currentReferralCode}</span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] cursor-pointer"
                        >
                          {copiedCode ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Social Share Icons (Clean <a> links — no window.open) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-black text-sm shadow-xs hover:brightness-110"
                        title="Share on Facebook"
                      >
                        f
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                          'Join and earn rewards!'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-sm shadow-xs hover:brightness-125"
                        title="Share on X"
                      >
                        𝕏
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#0088cc] text-white flex items-center justify-center shadow-xs hover:brightness-110"
                        title="Share on Telegram"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center font-black text-xs shadow-xs hover:brightness-110"
                        title="Share on WhatsApp"
                      >
                        WA
                      </a>
                      <a
                        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#06C755] text-white flex items-center justify-center font-black text-[10px] shadow-xs hover:brightness-110"
                        title="Share on LINE"
                      >
                        LINE
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards Released to Date */}
              <div className="space-y-2.5">
                <h3 className="text-center text-base font-black text-[#182620]">Rewards Released to Date</h3>
                <div className="space-y-2.5">
                  {[
                    {
                      title: 'Invitation Rewards',
                      amount: platformTotals.invitationRewardsTk,
                      count: platformTotals.invitationClaimedCount,
                      icon: '⭐',
                    },
                    {
                      title: 'Achievement Rewards',
                      amount: platformTotals.achievementRewardsTk,
                      count: platformTotals.achievementClaimedCount,
                      icon: '🏅',
                    },
                    {
                      title: 'Deposit Rebate',
                      amount: platformTotals.depositRebateTk,
                      count: platformTotals.depositClaimedCount,
                      icon: '💰',
                    },
                    {
                      title: 'Betting Rebate',
                      amount: platformTotals.bettingRebateTk,
                      count: platformTotals.bettingClaimedCount,
                      icon: '🪙',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="bg-white border border-[#dceee3] rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#eaf8f0] flex items-center justify-center text-2xl shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#557063]">{item.title}</div>
                        <div className="text-lg font-black text-[#182620] font-mono">
                          ৳ {formatMoney(item.amount)}
                        </div>
                        <div className="text-[11px] text-[#557063]">{item.count} claimed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard ("Who received the rewards") */}
              <div className="space-y-2.5 pb-2">
                <h3 className="text-center text-base font-black text-[#182620]">Leaderboard</h3>
                <div className="rounded-2xl bg-gradient-to-br from-[#19c36e] via-[#0fb565] to-[#008744] p-4 shadow-lg text-white space-y-3">
                  <div className="text-center text-base font-black">Who received the rewards</div>
                  {(!summary?.leaderboard || summary.leaderboard.length === 0) ? (
                    <div className="bg-white/95 text-[#557063] rounded-xl py-4 px-3 text-center text-xs font-semibold">
                      No reward claims recorded yet. Invite friends to climb the leaderboard!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {summary.leaderboard.slice(0, 6).map((row, idx) => (
                        <div
                          key={`${row.maskedUsername}-${idx}`}
                          className="bg-white/95 text-[#182620] rounded-full px-4 py-2 flex items-center justify-between text-xs font-bold shadow-xs"
                        >
                          <span className="font-mono text-[#182620] w-28 truncate">{row.maskedUsername}</span>
                          <span className="text-[#557063]">Received</span>
                          <span className="font-mono font-black text-[#00a859]">৳ {formatMoney(row.amountTk)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REWARDS */}
          {activeTab === 'rewards' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#557063] px-1">
                <span>Valid referrals count when invited friends deposit &amp; wager</span>
                <span className="font-semibold">no expiration</span>
              </div>

              {(summary?.achievements || []).map((ach: ReferralAchievementLevel) => {
                const isClaimed = ach.status === 'CLAIMED';
                const isClaimable = ach.status === 'CLAIMABLE';
                const progressPct = Math.min(100, Math.round((validReferrals / ach.targetActiveFriends) * 100));
                const medalColors = ['bg-emerald-500', 'bg-teal-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-rose-500'];
                const badgeBg = medalColors[(ach.level - 1) % medalColors.length];

                return (
                  <div
                    key={ach.level}
                    className="bg-white border border-[#dceee3] rounded-2xl p-3.5 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl ${badgeBg} text-white flex items-center justify-center font-black text-base shadow-sm shrink-0`}
                        >
                          ★
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#182620] truncate">
                            Over {ach.targetActiveFriends} valid referral in total.
                          </div>
                          <div className="text-sm font-black text-[#182620] font-mono mt-0.5 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>{formatMoney(ach.rewardTk)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="text-xs font-mono">
                          <span className="text-[#00a859] font-black text-sm">{validReferrals}</span>
                          <span className="text-[#557063]"> /{ach.targetActiveFriends}</span>
                        </div>
                        <button
                          type="button"
                          disabled={!isClaimable || claiming}
                          onClick={() => handleClaimAchievement(ach.level)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isClaimed
                              ? 'bg-[#00a859] text-white cursor-not-allowed'
                              : isClaimable
                              ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow hover:brightness-105'
                              : 'bg-[#eaf8f0] text-[#557063] cursor-not-allowed'
                          }`}
                        >
                          {isClaimed ? 'Claimed' : isClaimable ? 'Claim' : 'Available'}
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#eaf8f0] overflow-hidden">
                      <svg className="w-full h-full block" preserveAspectRatio="none">
                        <rect x="0" y="0" width={`${progressPct}%`} height="100%" rx="3" fill="#00a859" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#dceee3] p-4 shadow-xs grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[11px] text-[#557063]">Today&apos;s Income</div>
                  <div className="text-base font-black text-[#00a859] font-mono">৳{formatMoney(todayIncomeTk)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#557063]">Claimable</div>
                  <div className="text-base font-black text-emerald-600 font-mono">৳{formatMoney(claimableTk)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#557063]">Lifetime</div>
                  <div className="text-base font-black text-[#182620] font-mono">৳{formatMoney(totalEarnedTk)}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#dceee3] overflow-hidden shadow-xs">
                <div className="bg-[#059669] text-white px-4 py-2.5 text-xs font-black">
                  3-Tier Commission Rates Matrix
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f4fbf7] text-[#557063] font-bold border-b border-[#dceee3]">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-center">Tier 1</th>
                        <th className="py-2.5 px-3 text-center">Tier 2</th>
                        <th className="py-2.5 px-3 text-center">Tier 3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf6f0] font-mono">
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold text-[#182620]">Deposit Rebate</td>
                        <td className="py-2.5 px-3 text-center text-[#00a859] font-bold">1.50%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.80%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.30%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold text-[#182620]">Crash &amp; Fishing</td>
                        <td className="py-2.5 px-3 text-center text-[#00a859] font-bold">0.80%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.40%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.10%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold text-[#182620]">Slots</td>
                        <td className="py-2.5 px-3 text-center text-[#00a859] font-bold">1.00%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.50%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.20%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold text-[#182620]">Live Casino</td>
                        <td className="py-2.5 px-3 text-center text-[#00a859] font-bold">0.50%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.30%</td>
                        <td className="py-2.5 px-3 text-center text-[#557063]">0.10%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                type="button"
                disabled={claimableTk <= 0 || claiming}
                onClick={handleClaimCommission}
                className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  claimableTk > 0 && !claiming
                    ? 'bg-[#00a859] hover:bg-[#008f4a] text-white shadow'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <WalletIcon className="w-4 h-4" />
                <span>{claiming ? 'Processing...' : `Claim ৳${formatMoney(claimableTk)} to Main Wallet`}</span>
              </button>
            </div>
          )}

          {/* TAB 4: RECORDS */}
          {activeTab === 'records' && (
            <div className="bg-white rounded-2xl border border-[#dceee3] overflow-hidden shadow-xs">
              {records.length === 0 ? (
                <EmptyPaperPlane label="No data" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f4fbf7] text-[#557063] font-bold border-b border-[#dceee3]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3 text-center">Tier</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf6f0]">
                      {records.map((r) => (
                        <tr key={r.id}>
                          <td className="py-2.5 px-3 text-[11px] text-[#557063] font-mono">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#182620]">
                            <div>{r.refereeUsername}</div>
                            <div className="text-[10px] text-[#557063]">{r.descriptionBn || r.type}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-[#e6f7ee] text-[#00a859] font-bold text-[10px]">
                              T{r.tier}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00a859]">
                            +৳{(r.amountPaisa / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INVITED LIST */}
          {activeTab === 'invited' && (
            <div className="space-y-4">
              {/* Top Summary Header */}
              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-7 bg-[#eaf8f0] border border-[#cde8d8] rounded-2xl p-3 flex items-center gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2ad17e] to-[#00994d] text-white flex items-center justify-center text-2xl shadow">
                      💎
                    </div>
                    <span className="text-[11px] font-black text-[#182620] mt-1">Default</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-white rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs shadow-xs">
                      <span className="text-[#557063]">Registers</span>
                      <span className="font-black text-[#00a859] font-mono">{totalRegisters}</span>
                    </div>
                    <div className="bg-white rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs shadow-xs">
                      <span className="text-[#557063]">Valid Referral</span>
                      <span className="font-black text-[#00a859] font-mono">{validReferrals}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-5 space-y-1.5">
                  <div className="bg-[#fff7e6] border border-[#fde6b8] rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-amber-700 font-semibold">Today</span>
                    <span className="font-black text-[#182620] font-mono">+{summary?.registersToday ?? 0}</span>
                  </div>
                  <div className="bg-[#fff7e6] border border-[#fde6b8] rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-amber-700 font-semibold">Yesterday</span>
                    <span className="font-black text-[#182620] font-mono">+{summary?.registersYesterday ?? 0}</span>
                  </div>
                  <div className="bg-[#fff7e6] border border-[#fde6b8] rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-amber-700 font-semibold truncate">Current Month</span>
                    <span className="font-black text-[#182620] font-mono">+{summary?.registersMonth ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <select
                    value={invitedTierFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInvitedTierFilter(val === 'all' ? 'all' : (Number(val) as 1 | 2 | 3));
                    }}
                    className="px-3 py-2 rounded-lg bg-white border border-[#cde8d8] text-xs font-semibold text-[#182620]"
                  >
                    <option value="all">All Tiers</option>
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                    <option value="3">Tier 3</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setOnlyToday((v) => !v)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                      onlyToday
                        ? 'bg-[#00a859] text-white border-[#00a859]'
                        : 'bg-white text-[#557063] border-[#cde8d8]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Today</span>
                  </button>
                </div>

                <div className="px-3 py-2 rounded-lg bg-white border border-[#cde8d8] text-xs font-mono text-[#557063] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00a859]" />
                  <span>{mmdd} - {mmdd}</span>
                </div>
              </div>

              {/* Members Table or Empty State */}
              <div className="bg-white rounded-2xl border border-[#dceee3] overflow-hidden shadow-xs">
                {filteredTeam.length === 0 ? (
                  <EmptyPaperPlane label="No data" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#f4fbf7] text-[#557063] font-bold border-b border-[#dceee3]">
                          <th className="py-2.5 px-3">Username</th>
                          <th className="py-2.5 px-3 text-center">Tier</th>
                          <th className="py-2.5 px-3 text-right">Deposit</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf6f0]">
                        {filteredTeam.map((m) => (
                          <tr key={m.userId}>
                            <td className="py-2.5 px-3 font-bold text-[#182620]">{m.username}</td>
                            <td className="py-2.5 px-3 text-center">T{m.tier}</td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              ৳{((m.totalDepositPaisa || 0) / 100).toFixed(0)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  m.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {m.status === 'ACTIVE' ? 'Valid' : 'Registered'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rules Modal Overlay */}
      {showRulesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowRulesModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-white border border-[#cde8d8] rounded-2xl p-5 shadow-2xl text-[#182620] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5f3eb] pb-2">
              <h4 className="font-black text-sm flex items-center gap-2 text-[#00a859]">
                <ShieldCheck className="w-4 h-4" />
                <span>অফিসিয়াল রেফারেল ও কমিশন নীতিমালা</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-[#557063] leading-relaxed">
              <p>১. আপনার রেফারেল লিঙ্ক বা কোডের মাধ্যমে বন্ধু সাইন আপ করলে স্বয়ংক্রিয়ভাবে Tier 1 টিমে যুক্ত হবে।</p>
              <p>২. ভ্যালিড রেফারেল হওয়ার জন্য বন্ধুকে ন্যূনতম ৳৫০০ ডিপোজিট এবং ৳১,০০০ টার্নওভার সম্পন্ন করতে হবে।</p>
              <p>৩. ক্লেইমযোগ্য কমিশন সরাসরি মূল ওয়ালেটে নেওয়া যায় (০x টার্নওভার, তাৎক্ষণিক উইথড্রযোগ্য)।</p>
              <p>৪. একই ডিভাইস/আইপি দিয়ে ভুয়া সেলফ-রেফারেল করলে বোনাস বাতিল করা হবে।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
