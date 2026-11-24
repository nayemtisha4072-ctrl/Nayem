/**
 * Admin Dashboard Component for fb88baji
 * Oversees financial liabilities, pending payouts, user KYC, sportsbook settlements, and audit logs.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  TrendingDown,
  Trophy,
  AlertTriangle,
  FileText,
  Megaphone,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { User, Withdrawal, AuditLog } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
  onRefreshWallet: () => void;
  lang: 'bn' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onRefreshWallet,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'withdrawals' | 'sports' | 'cms' | 'audit'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [sportsEvents, setSportsEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('MFS account verification mismatch');

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/v1/admin/overview', {
        headers: { Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '' },
      });
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/admin/users', {
        headers: { Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '' },
      });
      const data = await res.json();
      if (data.users) setUsersList(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/v1/payments/withdrawals', {
        headers: { Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '' },
      });
      const data = await res.json();
      if (data.withdrawals) setWithdrawals(data.withdrawals);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/v1/admin/audit-logs', {
        headers: { Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '' },
      });
      const data = await res.json();
      if (data.logs) setAuditLogs(data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCms = async () => {
    try {
      const res = await fetch('/api/v1/admin/cms', {
        headers: { Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '' },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.announcement) setAnnouncementText(data.announcement);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSports = async () => {
    try {
      const res = await fetch('/api/v1/sports/events');
      const data = await res.json();
      if (data.events) setSportsEvents(data.events);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = () => {
    fetchOverview();
    fetchUsers();
    fetchWithdrawals();
    fetchAuditLogs();
    fetchCms();
    fetchSports();
  };

  useEffect(() => {
    refreshAll();
  }, [currentUser]);

  // Approve Withdrawal & Finalize Ledger Payout
  const handleApproveWithdrawal = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: 'উইথড্রয়াল অনুমোদিত ও পেইড সম্পন্ন হয়েছে।' });
        refreshAll();
        onRefreshWallet();
      } else {
        setFeedback({ type: 'error', message: data.error });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Reject Withdrawal & Release Reserved Balance
  const handleRejectWithdrawal = async (id: string, reason: string) => {
    if (!reason.trim()) return;

    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '',
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setRejectingId(null);
        setFeedback({ type: 'success', message: 'উইথড্রয়াল বাতিল ও সংরক্ষিত ব্যালেন্স রিলিজ করা হয়েছে।' });
        refreshAll();
        onRefreshWallet();
      } else {
        setFeedback({ type: 'error', message: data.error });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Toggle User KYC
  const handleToggleKyc = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED';
    try {
      await fetch(`/api/v1/admin/users/${userId}/kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle User Suspension
  const handleToggleSuspend = async (userId: string) => {
    try {
      await fetch(`/api/v1/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '',
        },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Settle Sports Match
  const handleSettleMatch = async (eventId: string, marketId: string, selectionId: string) => {
    try {
      const res = await fetch('/api/v1/admin/sports/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '',
        },
        body: JSON.stringify({ eventId, marketId, winningSelectionId: selectionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        fetchSports();
        onRefreshWallet();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Update CMS
  const handleUpdateCms = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentUser?.sessionToken ? `Bearer ${currentUser.sessionToken}` : '',
        },
        body: JSON.stringify({ announcement: announcementText }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'বিজ্ঞপ্তি সফলভাবে আপডেট করা হয়েছে।' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 text-[#182620]">
      {/* Top Banner */}
      <div className="bg-white border border-[#cde8d8] rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#19c36e] to-[#00994d] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#182620]">
                fb88baji {lang === 'bn' ? 'অ্যাডমিন অপারেশনাল হাব' : 'Admin Hub'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#eaf8f0] border border-[#cde8d8] text-[#00a859] text-[10px] font-bold">
                AUDIT-READY
              </span>
            </div>
            <p className="text-xs text-[#557063] mt-0.5">
              Strict double-entry ledger oversight, verified payout approvals, and sports settlements
            </p>
          </div>
        </div>

        <button
          onClick={refreshAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#eaf8f0] hover:bg-[#d8f3e4] text-[#00a859] text-xs font-bold border border-[#cde8d8] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'রিফ্রেশ ডাটা' : 'Refresh Data'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Admin Module Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-[#cde8d8] shadow-xs">
        {[
          { id: 'overview', labelBn: 'ওভারভিউ ও দায়বদ্ধতা', labelEn: 'Overview', icon: TrendingDown },
          { id: 'users', labelBn: 'ইউজার ও KYC', labelEn: 'Users & KYC', icon: Users },
          { id: 'withdrawals', labelBn: `উইথড্রয়াল কিউ (${withdrawals.filter(w => w.status === 'REQUESTED').length})`, labelEn: 'Payout Queue', icon: CreditCard },
          { id: 'sports', labelBn: 'ম্যাচ সেটেলমেন্ট', labelEn: 'Settlements', icon: Trophy },
          { id: 'cms', labelBn: 'সিএমএস বিজ্ঞপ্তি', labelEn: 'CMS Notice', icon: Megaphone },
          { id: 'audit', labelBn: 'অডিট লগ', labelEn: 'Audit Logs', icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow-sm'
                  : 'text-[#557063] hover:bg-[#eaf8f0] hover:text-[#182620]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{lang === 'bn' ? t.labelBn : t.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-xs space-y-1">
              <span className="text-[11px] text-[#557063] font-medium">মোট সফল ডিপোজিট</span>
              <div className="text-xl font-black text-[#00a859] font-mono">
                ৳{(overview.totalDepositsSucceededPaisa / 100).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#557063]">MFS Clearing Asset Inflows</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-xs space-y-1">
              <span className="text-[11px] text-[#557063] font-medium">পরিশোধিত উইথড্রয়াল</span>
              <div className="text-xl font-black text-[#182620] font-mono">
                ৳{(overview.totalWithdrawalsPaidPaisa / 100).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#557063]">Confirmed Payout Outflows</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-xs space-y-1">
              <span className="text-[11px] text-[#557063] font-medium">প্লেয়ার ব্যালেন্স লাইয়াবিলিটি</span>
              <div className="text-xl font-black text-amber-600 font-mono">
                ৳{(overview.totalUserAvailableLiabilitiesPaisa / 100).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#557063]">Active Customer Claims</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-xs space-y-1">
              <span className="text-[11px] text-[#557063] font-medium">লেজার ব্যালেন্স অডিট স্ট্যাটাস</span>
              <div className="flex items-center gap-1.5 text-base font-black text-[#00a859] font-mono">
                <ShieldCheck className="w-5 h-5 text-[#00a859]" />
                <span>{overview.ledgerAudit?.isBalanced ? 'BALANCED' : 'UNBALANCED'}</span>
              </div>
              <span className="text-[10px] text-[#557063] font-mono">
                Debits == Credits ({overview.ledgerAudit?.count} entries)
              </span>
            </div>
          </div>

          {/* Detailed Ledger Health Box */}
          <div className="p-5 rounded-3xl bg-[#eaf8f0] border border-[#cde8d8] space-y-2">
            <h4 className="text-sm font-extrabold text-[#182620] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00a859]" />
              <span>ডাবল-এন্ট্রি অ্যাকাউন্টিং নিশ্চয়তা (Double-Entry Balance Verification)</span>
            </h4>
            <p className="text-xs text-[#557063] leading-relaxed">
              প্রতিটি লেনদেনে মোট ডেবিট এবং মোট ক্রেডিট সমান রয়েছে (মোট জার্নাল ডেবিট: ৳
              {(overview.ledgerAudit?.totalDebitsPaisa / 100).toLocaleString()}, মোট ক্রেডিট: ৳
              {(overview.ledgerAudit?.totalCreditsPaisa / 100).toLocaleString()})। সিস্টেম কোনো অবস্থাতেই একতরফা ব্যালেন্স পরিবর্তন অনুমোদন করে না।
            </p>
          </div>
        </div>
      )}

      {/* TAB: WITHDRAWALS QUEUE */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white border border-[#cde8d8] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5f3eb]">
            <h3 className="text-sm font-extrabold text-[#182620]">
              পেন্ডিং ও সাম্প্রতিক উইথড্রয়াল রিকোয়েস্ট
            </h3>
            <span className="text-xs text-[#557063] font-mono">
              মোট: {withdrawals.length} টি
            </span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-8 text-center text-[#557063] text-xs">
              কোনো উইথড্রয়াল আবেদন নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#182620] text-base">
                        ৳{(w.amountPaisa / 100).toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#eaf8f0] border border-[#cde8d8] text-[#00a859]">
                        {w.method}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          w.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : w.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#557063]">
                      Destination: <span className="text-[#182620] font-mono font-semibold">{w.payoutDestination}</span> • User: {w.userId}
                    </div>
                    <div className="text-[10px] text-[#557063] font-mono">
                      Ref: {w.providerReference} • {new Date(w.createdAt).toLocaleString()}
                    </div>
                    {w.rejectionReason && (
                      <div className="text-[11px] text-rose-600 font-medium">
                        কারণ: {w.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions if REQUESTED or UNDER_REVIEW */}
                  {(w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW') && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveWithdrawal(w.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow hover:brightness-105 transition cursor-pointer"
                        >
                          অনুমোদন ও পে-আউট
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(w.id);
                            setRejectionReason('MFS account verification mismatch');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-100 transition cursor-pointer"
                        >
                          বাতিল ও অর্থ ফেরত
                        </button>
                      </div>
                      {rejectingId === w.id && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="বাতিলের কারণ..."
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#cde8d8] text-xs text-[#182620]"
                          />
                          <button
                            onClick={() => handleRejectWithdrawal(w.id, rejectionReason)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                          >
                            নিশ্চিত
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-2 py-1 rounded-lg bg-white border border-[#cde8d8] text-[#557063] text-xs cursor-pointer"
                          >
                            বাদ
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: USERS & KYC */}
      {activeTab === 'users' && (
        <div className="bg-white border border-[#cde8d8] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5f3eb]">
            <h3 className="text-sm font-extrabold text-[#182620]">প্লেয়ার একাউন্ট ও KYC ম্যানেজমেন্ট</h3>
            <span className="text-xs text-[#557063]">মোট ইউজার: {usersList.length}</span>
          </div>

          <div className="space-y-3">
            {usersList.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#182620] text-sm">{u.username}</span>
                    <span className="text-xs text-[#557063] font-mono">({u.mobile})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#eaf8f0] text-[#00a859] border border-[#cde8d8] uppercase font-mono font-bold">
                      {u.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#557063]">
                      ব্যালেন্স:{' '}
                      <strong className="text-[#00a859] font-mono">
                        ৳{((u.wallet?.availablePaisa || 0) / 100).toLocaleString()}
                      </strong>
                    </span>
                    <span className="text-[#557063]">
                      KYC: <strong className="text-amber-600">{u.kycStatus}</strong>
                    </span>
                    {u.isSuspended && (
                      <span className="text-rose-600 font-bold">[সাসপেন্ডেড]</span>
                    )}
                    {u.isSelfExcluded && (
                      <span className="text-amber-600 font-bold">[সেলফ-এক্সক্লুডেড]</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleKyc(u.id, u.kycStatus)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#cde8d8] text-[#182620] text-xs font-semibold hover:bg-[#eaf8f0] transition cursor-pointer"
                  >
                    {u.kycStatus === 'VERIFIED' ? 'Revoke KYC' : 'Verify KYC'}
                  </button>
                  <button
                    onClick={() => handleToggleSuspend(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      u.isSuspended
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    }`}
                  >
                    {u.isSuspended ? 'Restore' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SPORTS SETTLEMENT */}
      {activeTab === 'sports' && (
        <div className="bg-white border border-[#cde8d8] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-[#e5f3eb]">
            <h3 className="text-sm font-extrabold text-[#182620]">স্পোর্টস মার্কেট নিষ্পত্তি ও পে-আউট</h3>
            <p className="text-xs text-[#557063] mt-1">
              যেকোনো ফলাফল নির্ধারণ করলে স্বয়ংক্রিয়ভাবে লেজারের মাধ্যমে সকল বিজয়ী বাজির পে-আউট প্রদান করা হবে।
            </p>
          </div>

          <div className="space-y-4">
            {sportsEvents.map((evt) => (
              <div key={evt.id} className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#182620] text-sm">
                    {evt.homeTeam} vs {evt.awayTeam} ({evt.league})
                  </span>
                  <span className="text-xs text-amber-600 uppercase font-mono font-bold">{evt.status}</span>
                </div>

                {evt.markets.map((mkt: any) => (
                  <div key={mkt.id} className="p-3 rounded-xl bg-white border border-[#dceee3] space-y-2">
                    <div className="text-xs text-[#557063] font-semibold">{mkt.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {mkt.selections.map((sel: any) => (
                        <button
                          key={sel.id}
                          onClick={() => handleSettleMatch(evt.id, mkt.id, sel.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow hover:brightness-105 transition flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{sel.name} জয়ী নির্ধারণ করুন</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CMS NOTICE */}
      {activeTab === 'cms' && (
        <form onSubmit={handleUpdateCms} className="bg-white border border-[#cde8d8] rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#182620]">প্ল্যাটফর্ম ঘোষণা ও নোটিশ এডিটর</h3>
          <div className="space-y-1">
            <label className="text-xs text-[#557063] font-semibold">চলমান স্ক্রলিং নোটিশ (বাংলা):</label>
            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] text-[#182620] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a859]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-black text-xs shadow hover:brightness-105 transition cursor-pointer"
          >
            বিজ্ঞপ্তি আপডেট করুন
          </button>
        </form>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#cde8d8] rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-[#182620] pb-2 border-b border-[#e5f3eb]">
            সিস্টেম অডিট ট্রেইল (Immutable Audit Trail)
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#f4fbf7] border border-[#cde8d8] text-xs font-mono flex items-center justify-between"
              >
                <div>
                  <span className="text-[#00a859] font-bold mr-2">[{log.action}]</span>
                  <span className="text-[#182620]">Target: {log.target}</span>
                  <span className="text-[#557063] ml-2">by {log.actor}</span>
                </div>
                <span className="text-[#557063] text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
