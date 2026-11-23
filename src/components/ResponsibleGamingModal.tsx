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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#47001f] border border-[#940042] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#750035] border-b border-[#940042] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-sm">
              {lang === 'bn' ? 'দায়িত্বশীল গেমিং ও অ্যাকাউন্ট সেটিংস' : 'Responsible Gaming Controls'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[#61002a] hover:bg-[#940042] text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div
            className={`m-4 p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* User Profile Summary */}
          <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full purple-gradient flex items-center justify-center text-white font-bold">
                {(user?.username || 'PL').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{user?.username || 'Player'}</div>
                <div className="text-xs text-slate-400 font-mono">{user?.mobile || '—'}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              KYC {user?.kycStatus || 'UNVERIFIED'}
            </span>
          </div>

          {/* Daily Deposit Limit Form */}
          <form onSubmit={handleUpdateLimits} className="space-y-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'bn' ? 'দৈনিক ডিপোজিট লিমিট' : 'Daily Deposit Limit'}
              </h4>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">সর্বোচ্চ দৈনিক জমা সীমা (৳):</label>
              <input
                type="number"
                value={dailyDepositLimitTk}
                onChange={(e) => setDailyDepositLimitTk(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-full bg-[#940042] text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              লিমিট আপডেট করুন
            </button>
          </form>

          {/* Self-Exclusion Tool */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
              <Ban className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সেলফ-এক্সক্লুশন (Self-Exclusion)' : 'Self-Exclusion'}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
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
                      ? 'bg-rose-500 text-white shadow'
                      : 'bg-[#61002a] text-slate-400 hover:text-white'
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
                className="w-full py-2.5 rounded-full bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500 text-rose-200 font-bold text-xs transition cursor-pointer"
              >
                {selfExclusionDays} দিনের জন্য অ্যাকাউন্ট স্থগিত করুন
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 space-y-2.5">
                <p className="text-[11px] text-rose-200 font-bold">
                  {lang === 'bn'
                    ? `আপনি কি নিশ্চিত যে আপনি ${selfExclusionDays} দিনের জন্য অ্যাকাউন্ট স্থগিত করতে চান?`
                    : `Confirm self-exclusion for ${selfExclusionDays} days?`}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmExclude(false)}
                    className="flex-1 py-2 rounded-xl bg-[#61002a] text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSelfExclude}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer disabled:opacity-50"
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
