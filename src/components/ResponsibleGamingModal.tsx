/**
 * Responsible Gaming & Profile Modal for fb88baji
 * Allows setting daily deposit limits, cooling off periods, and immediate self-exclusion.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Clock,
  Ban,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';
import { User, Wallet } from '../types';

interface ResponsibleGamingModalProps {
  user: User | null;
  wallet: Wallet | null;
  onClose: () => void;
  onRefreshUser: () => void;
  lang: 'bn' | 'en';
}

export const ResponsibleGamingModal: React.FC<ResponsibleGamingModalProps> = ({
  user,
  wallet,
  onClose,
  onRefreshUser,
  lang,
}) => {
  const [dailyDepositLimitTk, setDailyDepositLimitTk] = useState(
    (user?.dailyDepositLimitPaisa || 5000000) / 100
  );
  const [selfExclusionDays, setSelfExclusionDays] = useState(30);
  const [confirmExclude, setConfirmExclude] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/users/limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user?.sessionToken ? `Bearer ${user.sessionToken}` : '',
        },
        body: JSON.stringify({ dailyLimitTk: dailyDepositLimitTk }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          text: lang === 'bn' ? 'ডিপোজিট লিমিট সফলভাবে সংরক্ষিত হয়েছে।' : 'Deposit limits saved.',
        });
        onRefreshUser();
      } else {
        setFeedback({
          type: 'error',
          text: data.error || (lang === 'bn' ? 'লিমিট সংরক্ষণ করা যায়নি।' : 'Failed to update limits.'),
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelfExclude = async () => {
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/users/self-exclude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user?.sessionToken ? `Bearer ${user.sessionToken}` : '',
        },
        body: JSON.stringify({ days: selfExclusionDays }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmExclude(false);
        setFeedback({
          type: 'success',
          text: lang === 'bn' ? 'অ্যাকাউন্ট সফলভাবে সেলফ-এক্সক্লুড করা হয়েছে।' : 'Account self-excluded.',
        });
        onRefreshUser();
        setTimeout(() => onClose(), 1200);
      } else {
        setFeedback({
          type: 'error',
          text: data.error || (lang === 'bn' ? 'অ্যাকাউন্ট স্থগিত করা যায়নি।' : 'Self-exclusion failed.'),
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white border border-[#cde8d8] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#16b864] to-[#00994d] border-b border-emerald-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-white" />
            <h3 className="font-extrabold text-white text-sm">
              {lang === 'bn' ? 'দায়িত্বশীল গেমিং ও অ্যাকাউন্ট সেটিংস' : 'Responsible Gaming Controls'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div
            className={`m-4 p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#00a859] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="p-6 space-y-6 bg-[#f4fbf7]">
          {/* User Profile Summary */}
          <div className="p-4 rounded-2xl bg-white border border-[#dceee3] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#19c36e] to-[#00994d] flex items-center justify-center text-white font-bold">
                {(user?.username || 'PL').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-[#182620]">{user?.username || 'Player'}</div>
                <div className="text-xs text-[#4a6b5a] font-mono">{user?.mobile || '—'}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#e6f9ef] border border-[#bce6ce] text-[#059669] text-[10px] font-bold">
              KYC {user?.kycStatus || 'UNVERIFIED'}
            </span>
          </div>

          {/* Daily Deposit Limit Form */}
          <form onSubmit={handleUpdateLimits} className="space-y-3 bg-white p-4 rounded-2xl border border-[#dceee3] shadow-2xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00a859]" />
              <h4 className="text-xs font-bold text-[#182620] uppercase tracking-wider">
                {lang === 'bn' ? 'দৈনিক ডিপোজিট লিমিট' : 'Daily Deposit Limit'}
              </h4>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#4a6b5a]">সর্বোচ্চ দৈনিক জমা সীমা (৳):</label>
              <input
                type="number"
                value={dailyDepositLimitTk}
                onChange={(e) => setDailyDepositLimitTk(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-full bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a859]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow hover:brightness-105 transition cursor-pointer disabled:opacity-50"
            >
              লিমিট আপডেট করুন
            </button>
          </form>

          {/* Self-Exclusion Tool */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase">
              <Ban className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সেলফ-এক্সক্লুশন (Self-Exclusion)' : 'Self-Exclusion'}</span>
            </div>

            <p className="text-[11px] text-rose-800/80 leading-relaxed">
              যদি আপনি মনে করেন আপনার বিরতি নেওয়া প্রয়োজন, তবে আপনি আপনার অ্যাকাউন্ট নির্দিষ্ট সময়ের জন্য বাজি ও ডিপোজিট থেকে বিরত রাখতে পারেন।
            </p>

            <div className="flex items-center gap-2">
              {[7, 30, 90, 180].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelfExclusionDays(d);
                    setConfirmExclude(false);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selfExclusionDays === d
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {d} দিন
                </button>
              ))}
            </div>

            {!confirmExclude ? (
              <button
                type="button"
                onClick={() => setConfirmExclude(true)}
                className="w-full py-2.5 rounded-full bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 font-bold text-xs transition cursor-pointer"
              >
                {selfExclusionDays} দিনের জন্য অ্যাকাউন্ট স্থগিত করুন
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-white border border-rose-300 space-y-2.5">
                <p className="text-[11px] text-rose-800 font-bold">
                  {lang === 'bn'
                    ? `আপনি কি নিশ্চিত যে আপনি ${selfExclusionDays} দিনের জন্য অ্যাকাউন্ট স্থগিত করতে চান?`
                    : `Confirm self-exclusion for ${selfExclusionDays} days?`}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmExclude(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSelfExclude}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? '...' : lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
