/**
 * Fb88baji Official Referral & Affiliate Commission Program Modal
 * Branded 100% for Fb88baji (replaces GV88 entirely)
 * Implements full 3-Tier Multi-Level Commission, 8-Level Achievement Ladder, Real-time Team & Commission Ledger
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  CheckCircle2,
  Lock,
  Sparkles,
  Gift,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Wallet as WalletIcon,
  HelpCircle,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import { User, Wallet, ReferralSummary, ReferralAchievementLevel, ReferralCommissionRecord, ReferralReferee } from '../types';
import { safeApiFetch } from '../utils/api';
import { Fb88BajiLogo } from './Fb88BajiLogo';

interface ReferralModalProps {
  user: User | null;
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshWallet: () => Promise<void> | void;
  onRequireAuth: () => void;
  lang?: 'bn' | 'en';
}

export type ReferralTab = 'overview' | 'achievements' | 'commission_rates' | 'team' | 'rules';

export function ReferralModal({
  user,
  wallet,
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
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [teamSubView, setTeamSubView] = useState<'members' | 'records'>('members');
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [claiming, setClaiming] = useState(false);

  // Fetch Referral Summary
  const fetchReferralData = async () => {
    if (!user?.sessionToken) return;
    setLoading(true);
    try {
      const res = await safeApiFetch<{ summary: ReferralSummary }>('/api/v1/referral/summary', {
        headers: { Authorization: `Bearer ${user.sessionToken}` },
      });
      if (res.ok && res.data?.summary) {
        setSummary(res.data.summary);
      }

      // Fetch records
      const recRes = await safeApiFetch<{ records: ReferralCommissionRecord[] }>('/api/v1/referral/records', {
        headers: { Authorization: `Bearer ${user.sessionToken}` },
      });
      if (recRes.ok && recRes.data?.records) {
        setRecords(recRes.data.records);
      }

      // Fetch team
      const teamRes = await safeApiFetch<{ members: ReferralReferee[] }>('/api/v1/referral/team', {
        headers: { Authorization: `Bearer ${user.sessionToken}` },
      });
      if (teamRes.ok && teamRes.data?.members) {
        setTeamMembers(teamRes.data.members);
      }
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

  const currentReferralCode = summary?.referralCode || user.referralCode || `REF${user.username.slice(0, 5).toUpperCase()}88`;
  const shareUrl = summary?.referralLink || `${window.location.origin}/register?ref=${currentReferralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Claim commission to main wallet
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
          message: res.data.message || `৳${res.data.claimedTk.toFixed(2)} সফলভাবে মূল ওয়ালেটে জমা হয়েছে!`,
        });
        await onRefreshWallet();
        await fetchReferralData();
      } else {
        setActionFeedback({
          type: 'error',
          message: res.error || 'কমিশন ক্লেইম করতে ব্যর্থ হয়েছে।',
        });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'নেটওয়ার্ক এরর।' });
    } finally {
      setClaiming(false);
    }
  };

  // Claim Achievement level
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
          message: res.error || 'অর্জন ক্লেইম করা যায়নি।',
        });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'নেটওয়ার্ক এরর।' });
    } finally {
      setClaiming(false);
    }
  };

  // Filtered team
  const filteredTeam = teamMembers.filter((m) => {
    if (selectedTierFilter === 'all') return true;
    return m.tier === selectedTierFilter;
  });

  const claimableTk = ((summary?.claimableCommissionPaisa || 0) / 100).toFixed(2);
  const totalEarnedTk = ((summary?.totalCommissionPaisa || 0) / 100).toFixed(2);
  const todayEarnedTk = ((summary?.todayCommissionPaisa || 0) / 100).toFixed(2);
  const activeFriends = summary?.activeFriendsCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#520024] border border-[#8a003c] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-100">
        {/* Top Header Bar */}
        <div className="bg-[#40001c] border-b border-[#8a003c] px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Fb88BajiLogo size="xs" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {lang === 'bn' ? 'Fb88baji রেফারেল ও পার্টনার প্রোগ্রাম' : 'Fb88baji Referral & Affiliate Program'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  3-Tier Passive Income
                </span>
              </div>
              <p className="text-xs text-rose-200/80">
                {lang === 'bn'
                  ? 'বন্ধু আমন্ত্রণ করুন, ৩ স্তরের আজীবন কমিশন ও সর্বোচ্চ ৳৩,০০,০০০ নগদ পুরস্কার উপভোগ করুন!'
                  : 'Invite friends, earn 3-tier lifetime commissions & claim up to ৳300,000 cash prizes!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#64002c] hover:bg-[#8a003c] text-rose-200 hover:text-white flex items-center justify-center border border-[#8a003c] transition shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Action Feedback Alert */}
        {actionFeedback && (
          <div
            className={`px-6 py-2.5 flex items-center justify-between text-xs font-bold ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border-b border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionFeedback.message}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-[#40001c]/60 border-b border-[#8a003c] px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 py-2">
          {[
            { id: 'overview', labelBn: 'ওভারভিউ ও শেয়ার', labelEn: 'Overview & Invite', icon: Share2 },
            { id: 'achievements', labelBn: 'আমন্ত্রণ অর্জন পুরস্কার', labelEn: 'Milestone Rewards', icon: Award, badge: '৳300K' },
            { id: 'commission_rates', labelBn: '৩-স্তর কমিশন টেবিল', labelEn: '3-Tier Rates', icon: TrendingUp },
            { id: 'team', labelBn: 'আমার টিম ও রেকর্ড', labelEn: 'My Team & History', icon: Users, count: teamMembers.length },
            { id: 'rules', labelBn: 'নিয়ম ও পলিসি', labelEn: 'Rules & Terms', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReferralTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'text-rose-200/80 hover:text-white hover:bg-[#64002c]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{lang === 'bn' ? tab.labelBn : tab.labelEn}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-[#8a003c] text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW & INVITE (Screenshot_8 & Screenshot_4) */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner Card: Claimable Commission & Quick Action */}
              <div className="rounded-3xl bg-gradient-to-r from-[#40001c] via-[#64002c] to-[#40001c] border-2 border-amber-400/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left: Balances & Stats */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                        {lang === 'bn' ? 'সরাসরি মূল অ্যাকাউন্টে স্থানান্তরযোগ্য' : 'Direct Main Wallet Transferable'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Claimable Balance */}
                      <div className="bg-[#2e0014]/80 border border-[#8a003c] rounded-2xl p-3.5">
                        <span className="text-[11px] text-rose-300 font-medium">
                          {lang === 'bn' ? 'উত্তোলনযোগ্য কমিশন' : 'Claimable Commission'}
                        </span>
                        <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                          ৳{claimableTk}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" /> ০x টার্নওভার (Instant)
                        </span>
                      </div>

                      {/* 2. Today's Commission */}
                      <div className="bg-[#2e0014]/80 border border-[#8a003c] rounded-2xl p-3.5">
                        <span className="text-[11px] text-rose-300 font-medium">
                          {lang === 'bn' ? 'আজকের কমিশন' : "Today's Commission"}
                        </span>
                        <div className="text-xl font-bold text-white font-mono mt-1">
                          ৳{todayEarnedTk}
                        </div>
                        <span className="text-[10px] text-slate-400">প্রতিদিন রাত ১২:০০ টায় সেটেল</span>
                      </div>

                      {/* 3. Total Earned */}
                      <div className="bg-[#2e0014]/80 border border-[#8a003c] rounded-2xl p-3.5">
                        <span className="text-[11px] text-rose-300 font-medium">
                          {lang === 'bn' ? 'সর্বমোট কমিশন' : 'Total Commission'}
                        </span>
                        <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                          ৳{totalEarnedTk}
                        </div>
                        <span className="text-[10px] text-slate-400">আজীবন ৩-স্তর আয়</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Big Claim Button */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#2e0014]/60 rounded-2xl border border-amber-400/20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-slate-950 shadow-md">
                      <WalletIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">
                        {lang === 'bn' ? 'কমিশন ক্লেইম করুন' : 'Claim to Main Wallet'}
                      </h4>
                      <p className="text-[11px] text-rose-200/70 mt-0.5">
                        {lang === 'bn' ? 'সরাসরি bKash/Nagad দিয়ে ক্যাশআউট করুন' : 'Withdrawable via bKash / Nagad'}
                      </p>
                    </div>

                    <button
                      onClick={handleClaimCommission}
                      disabled={Number(claimableTk) <= 0 || claiming}
                      className={`w-full py-3 rounded-xl text-xs font-black shadow-lg transition flex items-center justify-center gap-2 ${
                        Number(claimableTk) > 0 && !claiming
                          ? 'gold-gradient text-slate-950 hover:brightness-110 cursor-pointer active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{claiming ? 'স্থানান্তর হচ্ছে...' : `ওয়ালেটে নিন ৳${claimableTk}`}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Share Box: Exclusive Referral Link & Code */}
              <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      {lang === 'bn' ? 'আপনার এক্সক্লুসিভ আমন্ত্রণ লিঙ্ক ও কোড' : 'Your Exclusive Referral Link & Code'}
                    </h3>
                    <p className="text-xs text-rose-200/70 mt-0.5">
                      {lang === 'bn'
                        ? 'এই লিঙ্কের মাধ্যমে যে কেউ সাইন-আপ করলেই সে আপনার ১ নম্বর টিমে যুক্ত হবে।'
                        : 'Anyone registering through your link is instantly bound to your Tier 1 team.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Referral Link Input */}
                  <div className="md:col-span-8 flex items-center gap-2 bg-[#2e0014] border border-[#8a003c] rounded-xl px-3 py-2">
                    <span className="text-[11px] text-rose-300 font-bold shrink-0">Link:</span>
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-transparent text-xs text-amber-300 font-mono focus:outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg gold-gradient text-slate-950 text-xs font-black flex items-center gap-1.5 shrink-0 hover:brightness-105 active:scale-95 transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'কপি হয়েছে' : 'কপি লিঙ্ক'}</span>
                    </button>
                  </div>

                  {/* Referral Code Input */}
                  <div className="md:col-span-4 flex items-center gap-2 bg-[#2e0014] border border-[#8a003c] rounded-xl px-3 py-2">
                    <span className="text-[11px] text-rose-300 font-bold shrink-0">Code:</span>
                    <span className="flex-1 text-xs text-amber-400 font-mono font-black text-center tracking-wider">
                      {currentReferralCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-lg bg-[#64002c] hover:bg-[#8a003c] text-white border border-[#8a003c] text-xs font-bold flex items-center gap-1 shrink-0 transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'কপি' : 'কপি'}</span>
                    </button>
                  </div>
                </div>

                {/* Social Quick Share Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-rose-200/80 font-bold mr-1">দ্রুত শেয়ার করুন:</span>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Fb88baji-তে অ্যাকাউন্ট খুলে ফ্রি ডিপোজিট বোনাস ও প্রতিদিন বড় ক্যাশ প্রাইজ জিতুন! এখনই যোগ দিন: ${shareUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                      'Fb88baji অফিসিয়াল প্ল্যাটফর্মে জয়েন করে স্পোর্টস ও ক্যাসিনো উপভোগ করুন!'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#0088cc] hover:bg-[#0088cc]/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    Telegram
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2]/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    Facebook
                  </a>
                </div>
              </div>

              {/* Team Statistics Grid: Tier 1, Tier 2, Tier 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl p-4">
                  <span className="text-[11px] text-rose-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Tier 1 (সরাসরি)
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-1.5">
                    {summary?.tier1Count || 0} জন
                  </div>
                  <span className="text-[10px] text-amber-400">১.৫% ডিপোজিট + ১% স্লট</span>
                </div>

                <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl p-4">
                  <span className="text-[11px] text-rose-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    Tier 2 (দ্বিতীয় স্তর)
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-1.5">
                    {summary?.tier2Count || 0} জন
                  </div>
                  <span className="text-[10px] text-sky-400">০.৮% ডিপোজিট + ০.৫% স্লট</span>
                </div>

                <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl p-4">
                  <span className="text-[11px] text-rose-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Tier 3 (তৃতীয় স্তর)
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-1.5">
                    {summary?.tier3Count || 0} জন
                  </div>
                  <span className="text-[10px] text-purple-400">০.৩% ডিপোজিট + ০.২% স্লট</span>
                </div>

                <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl p-4">
                  <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    সক্রিয় মেম্বার (Active)
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1.5">
                    {activeFriends} জন
                  </div>
                  <span className="text-[10px] text-slate-400">মাইলস্টোনে গণনা হয়</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MILESTONE ACHIEVEMENTS LADDER (Screenshot_5) */}
          {/* ======================================================== */}
          {activeTab === 'achievements' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#40001c] border border-[#8a003c] p-4 rounded-2xl">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    {lang === 'bn' ? 'আমন্ত্রণ অর্জন বোনাস ল্যাডার' : 'Referral Milestone Ladder'}
                  </h3>
                  <p className="text-xs text-rose-200/70 mt-0.5">
                    {lang === 'bn'
                      ? 'সক্রিয় বন্ধুর সংখ্যা বৃদ্ধির সাথে সাথে ক্যাশ প্রাইজ আনলক হবে (সর্বোচ্চ ৳৩,০০,০০০)।'
                      : 'Unlock increasing cash bonuses as your active friend network expands (up to ৳300,000).'}
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-[#2e0014] border border-amber-400/30 flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-rose-300 font-bold">বর্তমান সক্রিয় বন্ধু:</span>
                  <span className="text-sm font-black text-amber-400 font-mono">{activeFriends} জন</span>
                </div>
              </div>

              {/* Achievement Level Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(summary?.achievements || []).map((ach: ReferralAchievementLevel) => {
                  const isClaimed = ach.status === 'CLAIMED';
                  const isClaimable = ach.status === 'CLAIMABLE';
                  const isLocked = ach.status === 'LOCKED';
                  const progressPct = Math.min(100, Math.round((activeFriends / ach.targetActiveFriends) * 100));

                  return (
                    <div
                      key={ach.level}
                      className={`p-4 rounded-2xl border transition-all ${
                        isClaimable
                          ? 'bg-[#64002c] border-amber-400 shadow-lg ring-1 ring-amber-400/50'
                          : isClaimed
                          ? 'bg-[#40001c]/70 border-[#8a003c] opacity-80'
                          : 'bg-[#40001c] border-[#8a003c]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              isClaimed
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                                : isClaimable
                                ? 'gold-gradient text-slate-950 shadow'
                                : 'bg-[#2e0014] text-slate-400 border border-[#8a003c]'
                            }`}
                          >
                            {isClaimed ? (
                              <Check className="w-5 h-5" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Gift className="w-5 h-5 text-slate-950" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-white">
                                {lang === 'bn' ? ach.titleBn : ach.title}
                              </h4>
                              {isClaimable && (
                                <span className="px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase animate-pulse">
                                  Claimable!
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-rose-200/70 mt-0.5">
                              টার্গেট: {ach.targetActiveFriends} জন সক্রিয় মেম্বার
                            </p>
                          </div>
                        </div>

                        {/* Reward Amount */}
                        <div className="text-right">
                          <div className="text-base font-black text-amber-400 font-mono">
                            ৳{ach.rewardTk.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-400">ক্যাশ রিওয়ার্ড</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-rose-200/70 font-mono">
                          <span>অগ্রগতি: {activeFriends}/{ach.targetActiveFriends}</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#2e0014] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isClaimed
                                ? 'bg-emerald-500'
                                : isClaimable
                                ? 'bg-amber-400'
                                : 'bg-rose-500/70'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-3 border-t border-[#8a003c]/60 flex items-center justify-between">
                        <span className="text-[10px] text-rose-200/60">
                          {isClaimed
                            ? `ক্লেইম সম্পন্ন: ${ach.claimedAt ? new Date(ach.claimedAt).toLocaleDateString() : 'হয়েছে'}`
                            : isClaimable
                            ? 'সরাসরি ওয়ালেটে জমা নিন'
                            : `আরও ${Math.max(0, ach.targetActiveFriends - activeFriends)} জন সক্রিয় বন্ধু প্রয়োজন`}
                        </span>

                        <button
                          onClick={() => handleClaimAchievement(ach.level)}
                          disabled={!isClaimable || claiming}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                            isClaimed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-not-allowed'
                              : isClaimable
                              ? 'gold-gradient text-slate-950 hover:brightness-110 shadow active:scale-95 cursor-pointer'
                              : 'bg-[#2e0014] text-slate-500 border border-[#8a003c] cursor-not-allowed'
                          }`}
                        >
                          {isClaimed ? 'সংগৃহীত' : isClaimable ? 'দাবি করুন (Claim)' : 'লকড'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: 3-TIER COMMISSION MATRIX (Screenshot_7 & 11) */}
          {/* ======================================================== */}
          {activeTab === 'commission_rates' && (
            <div className="space-y-6">
              <div className="bg-[#40001c] border border-[#8a003c] p-4 sm:p-5 rounded-2xl space-y-2">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  {lang === 'bn' ? 'Fb88baji ৩-স্তর আজীবন কমিশন কাঠামো' : 'Fb88baji 3-Tier Multi-Level Commission Structure'}
                </h3>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনি যখন কোনো বন্ধুকে আমন্ত্রণ করবেন, সে ডিপোজিট ও গেম খেললে আপনি কমিশন পাবেন (Tier 1)। এরপর সে যদি কাউকে আমন্ত্রণ করে (Tier 2), এবং সেই ব্যক্তি আবার কাউকে আমন্ত্রণ করে (Tier 3) — আপনি তিনটি স্তর থেকেই নিয়মিত কমিশন লাভ করবেন!'
                    : 'Earn lifetime recurring commission from Tier 1 (direct friends), Tier 2 (friends invited by your friends), and Tier 3 (their referrals) on every deposit & game turnover!'}
                </p>
              </div>

              {/* The Matrix Table */}
              <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#2e0014] text-amber-300 border-b border-[#8a003c] font-black uppercase text-[11px]">
                      <th className="py-3 px-4">ক্যাটাগরি / গেম ধরন</th>
                      <th className="py-3 px-4 text-center">Tier 1 (সরাসরি)</th>
                      <th className="py-3 px-4 text-center">Tier 2 (দ্বিতীয় স্তর)</th>
                      <th className="py-3 px-4 text-center">Tier 3 (তৃতীয় স্তর)</th>
                      <th className="py-3 px-4 text-right">সেটেলমেন্ট সময়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8a003c]/40 font-mono">
                    <tr className="hover:bg-[#64002c]/30 transition">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        ডিপোজিট রিবেট (Deposit Rebate)
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">১.৫০%</td>
                      <td className="py-3 px-4 text-center text-rose-200">০.৮০%</td>
                      <td className="py-3 px-4 text-center text-rose-300">০.৩০%</td>
                      <td className="py-3 px-4 text-right text-[11px] font-sans text-emerald-400">তাৎক্ষণিক (Real-time)</td>
                    </tr>

                    <tr className="hover:bg-[#64002c]/30 transition">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        স্লট গেমস (Slots Turnover)
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">১.০০%</td>
                      <td className="py-3 px-4 text-center text-rose-200">০.৫০%</td>
                      <td className="py-3 px-4 text-center text-rose-300">০.২০%</td>
                      <td className="py-3 px-4 text-right text-[11px] font-sans text-slate-300">প্রতিদিন রাত ১২:০০</td>
                    </tr>

                    <tr className="hover:bg-[#64002c]/30 transition">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        লাইভ ক্যাসিনো (Live Casino)
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">০.৫০%</td>
                      <td className="py-3 px-4 text-center text-rose-200">০.৩০%</td>
                      <td className="py-3 px-4 text-center text-rose-300">০.১০%</td>
                      <td className="py-3 px-4 text-right text-[11px] font-sans text-slate-300">প্রতিদিন রাত ১২:০০</td>
                    </tr>

                    <tr className="hover:bg-[#64002c]/30 transition">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        স্পোর্টস ও ক্রিকেট (Sports Betting)
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">০.৬০%</td>
                      <td className="py-3 px-4 text-center text-rose-200">০.৩০%</td>
                      <td className="py-3 px-4 text-center text-rose-300">০.১০%</td>
                      <td className="py-3 px-4 text-right text-[11px] font-sans text-slate-300">ম্যাচ সেটেলমেন্টের পর</td>
                    </tr>

                    <tr className="hover:bg-[#64002c]/30 transition">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        ক্র্যাশ ও ফিশিং (Crash & Fishing)
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">০.৮০%</td>
                      <td className="py-3 px-4 text-center text-rose-200">০.৪০%</td>
                      <td className="py-3 px-4 text-center text-rose-300">০.১০%</td>
                      <td className="py-3 px-4 text-right text-[11px] font-sans text-slate-300">প্রতিদিন রাত ১২:০০</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Commission Calculation Example Box */}
              <div className="bg-[#2e0014] border border-amber-400/30 rounded-2xl p-4 sm:p-5 space-y-2">
                <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  উদাহরণ ও উপার্জনের সহজ হিসাব:
                </h4>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  ধরি, আপনার রেফার করা ১০ জন মেম্বার প্রতিদিন মোট ৳১,০০,০০০ স্লট ও ক্যাসিনো খেলে। ১% হারে আপনি প্রতিদিন ৳১,০০০ এবং মাসে ৳৩০,০০০ নিষ্ক্রিয় আয় করবেন! সাথে তাদের ডিপোজিট বোনাস ও অর্জন ল্যাডার থেকে আরও নগদ অর্থ যোগ হবে।
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: MY TEAM & COMMISSION HISTORY */}
          {/* ======================================================== */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Top Controls: Switch Sub-view and Tier Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#40001c] border border-[#8a003c] p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 bg-[#2e0014] p-1 rounded-xl border border-[#8a003c]">
                  <button
                    onClick={() => setTeamSubView('members')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      teamSubView === 'members'
                        ? 'gold-gradient text-slate-950 font-black'
                        : 'text-rose-200 hover:text-white'
                    }`}
                  >
                    টিম মেম্বার ({teamMembers.length})
                  </button>
                  <button
                    onClick={() => setTeamSubView('records')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      teamSubView === 'records'
                        ? 'gold-gradient text-slate-950 font-black'
                        : 'text-rose-200 hover:text-white'
                    }`}
                  >
                    কমিশন হিস্ট্রি ({records.length})
                  </button>
                </div>

                {teamSubView === 'members' && (
                  <div className="flex items-center gap-1 bg-[#2e0014] p-1 rounded-xl border border-[#8a003c]">
                    {(['all', 1, 2, 3] as const).map((t) => (
                      <button
                        key={String(t)}
                        onClick={() => setSelectedTierFilter(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                          selectedTierFilter === t
                            ? 'bg-[#8a003c] text-white'
                            : 'text-rose-300/70 hover:text-white'
                        }`}
                      >
                        {t === 'all' ? 'সকল স্তর' : `Tier ${t}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SUB-VIEW 1: TEAM MEMBERS TABLE */}
              {teamSubView === 'members' && (
                <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl overflow-hidden shadow-lg">
                  {filteredTeam.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <Users className="w-10 h-10 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400">এই স্তরে এখনও কোনো সদস্য যুক্ত হয়নি।</p>
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 rounded-xl gold-gradient text-slate-950 text-xs font-black inline-flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        আমন্ত্রণ লিঙ্ক শেয়ার করুন
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#2e0014] text-amber-300 border-b border-[#8a003c] font-black uppercase text-[10px]">
                            <th className="py-3 px-4">মেম্বার ইউজারনেম</th>
                            <th className="py-3 px-3 text-center">স্তর (Tier)</th>
                            <th className="py-3 px-4 text-center">যোগদানের তারিখ</th>
                            <th className="py-3 px-4 text-right">মোট ডিপোজিট</th>
                            <th className="py-3 px-4 text-right">টার্নওভার</th>
                            <th className="py-3 px-4 text-right">কমিশন আয়</th>
                            <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#8a003c]/40 font-mono">
                          {filteredTeam.map((mem) => (
                            <tr key={mem.userId} className="hover:bg-[#64002c]/30 transition">
                              <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-[10px]">
                                  {mem.username.slice(0, 1).toUpperCase()}
                                </div>
                                <span>{mem.username}</span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    mem.tier === 1
                                      ? 'bg-amber-400 text-slate-950'
                                      : mem.tier === 2
                                      ? 'bg-sky-400 text-slate-950'
                                      : 'bg-purple-400 text-slate-950'
                                  }`}
                                >
                                  Tier {mem.tier}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                                {new Date(mem.joinedAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right text-rose-200">
                                ৳{((mem.totalDepositPaisa || 0) / 100).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right text-rose-200">
                                ৳{((mem.totalTurnoverPaisa || 0) / 100).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                                ৳{((mem.commissionEarnedPaisa || 0) / 100).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    mem.status === 'ACTIVE'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {mem.status === 'ACTIVE' ? 'সক্রিয় (Active)' : 'নিবন্ধিত'}
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

              {/* SUB-VIEW 2: COMMISSION RECORDS TABLE */}
              {teamSubView === 'records' && (
                <div className="bg-[#40001c] border border-[#8a003c] rounded-2xl overflow-hidden shadow-lg">
                  {records.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      এখনও কোনো কমিশন রেকর্ড জমা হয়নি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#2e0014] text-amber-300 border-b border-[#8a003c] font-black uppercase text-[10px]">
                            <th className="py-3 px-4">তারিখ ও সময়</th>
                            <th className="py-3 px-4">বিবরণ</th>
                            <th className="py-3 px-3 text-center">স্তর</th>
                            <th className="py-3 px-4 text-right">কমিশন পরিমাণ</th>
                            <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#8a003c]/40 font-mono">
                          {records.map((rec) => (
                            <tr key={rec.id} className="hover:bg-[#64002c]/30 transition">
                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {new Date(rec.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-sans text-white">
                                <div className="font-bold">{rec.descriptionBn || rec.description}</div>
                                <div className="text-[10px] text-rose-300/70 font-mono">
                                  {rec.refereeUsername} • {rec.type}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-[#64002c] text-rose-200 text-[10px] font-bold">
                                  Tier {rec.tier}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-emerald-400 font-bold text-sm">
                                +৳{(rec.amountPaisa / 100).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-black uppercase">
                                  {rec.status}
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
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: RULES & TERMS POLICY (Fb88baji Official) */}
          {/* ======================================================== */}
          {activeTab === 'rules' && (
            <div className="space-y-4 text-xs text-rose-100/90 leading-relaxed bg-[#40001c] border border-[#8a003c] p-5 sm:p-6 rounded-3xl">
              <div className="border-b border-[#8a003c] pb-3 mb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Fb88baji অফিসিয়াল রেফারেল ও কমিশন নীতিমালা
                </h3>
                <p className="text-[11px] text-rose-200/70 mt-1">
                  সকল মেম্বারদের জন্য প্রযোজ্য সততা, স্বচ্ছতা ও নিরাপত্তার নীতিমালা।
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#2e0014] border border-[#8a003c]">
                  <h4 className="font-black text-amber-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ১. যোগ্যতা ও অংশগ্রহণ (Eligibility):
                  </h4>
                  <p className="mt-1 text-[11px] text-rose-200/80">
                    Fb88baji-তে নিবন্ধিত সকল ভ্যালিড একাউন্টধারী স্বয়ংক্রিয়ভাবে রেফারেল পার্টনার প্রোগ্রামে অন্তর্ভুক্ত। আপনার শেয়ারকৃত ব্যক্তিগত রেফারেল কোড বা লিঙ্কের মাধ্যমে যে কোনো নতুন সদস্য যুক্ত হতে পারবে।
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#2e0014] border border-[#8a003c]">
                  <h4 className="font-black text-amber-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ২. সক্রিয় মেম্বার সংজ্ঞা (Active Referee Criteria):
                  </h4>
                  <p className="mt-1 text-[11px] text-rose-200/80">
                    আমন্ত্রণ মাইলস্টোন ও অর্জন ক্যাশ প্রাইজ (৳৩০০ থেকে ৳৩,০০,০০০) আনলক করার জন্য আমন্ত্রিত বন্ধুকে অবশ্যই সর্বনিম্ন ৳৫০০ সফল ডিপোজিট এবং প্ল্যাটফর্মে সর্বনিম্ন ৳২,০০০ ভ্যালিড টার্নওভার সম্পন্ন করতে হবে।
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#2e0014] border border-[#8a003c]">
                  <h4 className="font-black text-amber-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    ৩. কমিশন হিসাব ও নিষ্পত্তি সময় (Calculation & Settlement):
                  </h4>
                  <p className="mt-1 text-[11px] text-rose-200/80">
                    ডিপোজিট রিবেট তাৎক্ষণিকভাবে হিসাব করা হয়। স্লটস, লাইভ ক্যাসিনো ও ক্র্যাশ গেমসের টার্নওভার কমিশন প্রতিদিন বাংলাদেশ সময় রাত ১২:০০ টায় (00:00 BST) স্বয়ংক্রিয় অডিটের মাধ্যমে আপডেট হয়ে ক্লেইমযোগ্য ব্যালেন্সে যুক্ত হয়।
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#2e0014] border border-[#8a003c]">
                  <h4 className="font-black text-amber-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    ৪. উত্তোলন ও ওয়ালেট স্থানান্তর (Withdrawal Policy):
                  </h4>
                  <p className="mt-1 text-[11px] text-rose-200/80">
                    রেফারেল ব্যালেন্স থেকে "ওয়ালেটে নিন" বাটনে ক্লিক করলেই অর্থ সরাসরি মূল অ্যাকাউন্টে স্থানান্তরিত হয়। মূল অ্যাকাউন্টে স্থানান্তরিত কমিশন অর্থের ওপর কোনো প্রকার অতিরিক্ত জটিল টার্নওভার প্রযোজ্য নেই (০x টার্নওভার), যা bKash, Nagad বা রকেটের মাধ্যমে সরাসরি উইথড্র করা যায়।
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#2e0014] border border-[#8a003c]">
                  <h4 className="font-black text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    ৫. ফেয়ার প্লে ও অ্যান্টি-ফ্রড পলিসি (Anti-Fraud & Fair Play):
                  </h4>
                  <p className="mt-1 text-[11px] text-rose-200/80">
                    একই আইপি এড্রেস (IP Address), ডুপ্লিকেট ডিভাইস আইডি, বা একই ব্যক্তির ভুয়া একাউন্ট তৈরি করে সেলফ-রেফারেল সম্পূর্ণ নিষিদ্ধ। Fb88baji ফ্রড ডিটেকশন সিস্টেম কোনো অনিয়ম পেলে কমিশন ও রিওয়ার্ড বাতিল করার পূর্ণ অধিকার সংরক্ষণ করে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Action Bar */}
        <div className="bg-[#40001c] border-t border-[#8a003c] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-rose-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Fb88baji Affiliate Network Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl gold-gradient text-slate-950 text-xs font-black shadow hover:brightness-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>আমন্ত্রণ লিঙ্ক শেয়ার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
