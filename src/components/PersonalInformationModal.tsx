/**
 * Personal Information Modal Component
 * Matches Screenshot_8:
 * - Header: Magenta (#c20054) with "Personal Information" and "✕"
 * - User banner: Username, "Normal" badge, "Date Registered : 2026/09/23"
 * - VIP Card: VIP logo, "0", "My VIP >>" (gold pill)
 * - Verification Alert: "Please complete the verification below before you proceed with the withdrawal request."
 * - Form rows: Full Name [Add], Birthday [Add], Phone Number (8801320962121), Email [Add]
 * - Customer service disclaimer with headset icon
 */

import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Cake,
  Phone,
  Mail,
  ChevronUp,
  Headphones,
  Info,
  Crown,
  Check,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

interface PersonalInformationModalProps {
  user: User | null;
  onClose: () => void;
  onUserUpdate: (updated: User) => void;
  onLogout?: () => void;
  onOpenVip?: () => void;
  onOpenSupport?: () => void;
}

export const PersonalInformationModal: React.FC<PersonalInformationModalProps> = ({
  user,
  onClose,
  onUserUpdate,
  onLogout,
  onOpenVip,
  onOpenSupport,
}) => {
  const [editingField, setEditingField] = useState<'name' | 'birthday' | 'email' | null>(null);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const phone = user?.mobile || '—';
  const vipPoints = ((user?.turnoverPaisa || 0) / 10000).toFixed(2);
  const registeredDate = user?.createdAt
    ? new Date(user.createdAt).toISOString().split('T')[0].replace(/-/g, '/')
    : '—';

  const handleSaveField = async (field: 'name' | 'birthday' | 'email') => {
    if (!user?.sessionToken) return;
    setSaving(true);
    setFeedback(null);

    const payload: Record<string, string> = {};
    if (field === 'name') payload.fullName = fullName.trim();
    if (field === 'birthday') payload.birthday = birthday;
    if (field === 'email') payload.email = email.trim();

    try {
      const res = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update profile.' });
        return;
      }
      if (data.user) {
        onUserUpdate(data.user);
      } else {
        onUserUpdate({
          ...user,
          fullName: field === 'name' ? fullName.trim() : user.fullName,
          birthday: field === 'birthday' ? birthday : user.birthday,
          email: field === 'email' ? email.trim() : user.email,
        });
      }
      setFeedback({ type: 'success', text: data.message || 'Information saved successfully.' });
      setEditingField(null);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#540026] border border-[#a30048] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header (Matches Screenshot_8) */}
        <div className="bg-[#c20054] px-5 py-3.5 flex items-center justify-between border-b border-[#e00062]/40 shadow-sm">
          <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
            Personal Information
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* User Banner (Matches Screenshot_8) */}
          <div className="text-center space-y-1">
            <div className="text-base font-black text-white tracking-tight">
              {user?.username || 'Player'}
            </div>
            <div className="inline-block px-4 py-0.5 rounded-full bg-[#8c8050] text-[#121212] font-black text-xs uppercase tracking-wider shadow-sm">
              {user?.vipLevel || 'Normal'}
            </div>
            <div className="text-[11px] text-slate-300 font-semibold pt-0.5">
              Date Registered : {registeredDate}
            </div>
          </div>

          {/* VIP Card (Matches Screenshot_8) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#800038] border border-[#b80050] shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-amber-300 font-mono">{vipPoints}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenVip) onOpenVip();
              }}
              className="px-3 py-1 rounded-full gold-accent-btn font-black text-xs shadow cursor-pointer hover:brightness-110"
            >
              My VIP &gt;&gt;
            </button>
          </div>

          {feedback && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.type === 'success' && <Check className="w-3.5 h-3.5 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Verification Alert Banner (Matches Screenshot_8) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1a2542] border border-[#2b3d6e] text-xs text-slate-200">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span className="leading-snug">
                Please complete the verification below before you proceed with the withdrawal request.
              </span>
            </div>
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </div>

          {/* Form Card (Matches Screenshot_8) */}
          <div className="bg-[#730030] border border-[#a30048] rounded-2xl p-4 space-y-3.5 shadow-md">
            {/* Full Name */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-200 font-bold">
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span>Full Name</span>
              </div>
              {user?.fullName ? (
                <span className="font-bold text-white">{user.fullName}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('name')}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#ba0050] to-[#e00062] hover:brightness-110 text-white font-black text-xs shadow cursor-pointer transition active:scale-95"
                >
                  Add
                </button>
              )}
            </div>

            {editingField === 'name' && (
              <div className="flex gap-2 animate-in fade-in duration-100">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#42001c] border border-[#940042] text-xs text-white"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveField('name')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            )}

            <div className="border-t border-[#8f003e]/60" />

            {/* Birthday */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-200 font-bold">
                <Cake className="w-4 h-4 text-amber-400" />
                <span>Birthday</span>
              </div>
              {user?.birthday ? (
                <span className="font-bold text-white">{user.birthday}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('birthday')}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#ba0050] to-[#e00062] hover:brightness-110 text-white font-black text-xs shadow cursor-pointer transition active:scale-95"
                >
                  Add
                </button>
              )}
            </div>

            {editingField === 'birthday' && (
              <div className="flex gap-2 animate-in fade-in duration-100">
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#42001c] border border-[#940042] text-xs text-white"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveField('birthday')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            )}

            <div className="border-t border-[#8f003e]/60" />

            {/* Phone Number */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-200 font-bold">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Phone Number</span>
              </div>
              <span className="font-mono font-bold text-white">{phone}</span>
            </div>

            <div className="border-t border-[#8f003e]/60" />

            {/* Email */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-200 font-bold">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Email</span>
              </div>
              {user?.email ? (
                <span className="font-bold text-white">{user.email}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('email')}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#ba0050] to-[#e00062] hover:brightness-110 text-white font-black text-xs shadow cursor-pointer transition active:scale-95"
                >
                  Add
                </button>
              )}
            </div>

            {editingField === 'email' && (
              <div className="flex gap-2 animate-in fade-in duration-100">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#42001c] border border-[#940042] text-xs text-white"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveField('email')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Security Disclaimer with Headset Icon (Matches Screenshot_8) */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#42001c] border border-[#800038] text-[11px] text-rose-200">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Headphones className="w-4 h-4 text-amber-300" />
            </div>
            <p className="leading-snug">
              For privacy and security, Information can't modified after confirmation. Please{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenSupport) onOpenSupport();
                }}
                className="text-amber-300 font-bold underline cursor-pointer"
              >
                contact customer service
              </button>
              .
            </p>
          </div>

          {/* Logout Action Button */}
          {onLogout && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out (লগআউট করুন)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
