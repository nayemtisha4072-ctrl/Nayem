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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#f4fbf7] border border-[#cde8d8] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] px-5 py-3.5 flex items-center justify-between border-b border-emerald-400/30 shadow-sm">
          <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
            Personal Information
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* User Banner */}
          <div className="text-center space-y-1">
            <div className="text-base font-black text-[#182620] tracking-tight">
              {user?.username || 'Player'}
            </div>
            <div className="inline-block px-4 py-0.5 rounded-full bg-[#10b965] text-white font-black text-xs uppercase tracking-wider shadow-xs">
              {user?.vipLevel || 'Default'}
            </div>
            <div className="text-[11px] text-[#517261] font-semibold pt-0.5">
              Date Registered : {registeredDate}
            </div>
          </div>

          {/* VIP Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#eaf8f0] border border-[#bfe6cf] shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#cce9d8] flex items-center justify-center text-amber-500 shadow-2xs">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-[#00a859] font-mono">{vipPoints}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenVip) onOpenVip();
              }}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-black text-xs shadow cursor-pointer hover:brightness-105"
            >
              My VIP &gt;&gt;
            </button>
          </div>

          {feedback && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {feedback.type === 'success' && <Check className="w-3.5 h-3.5 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Verification Alert Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#eef6ff] border border-[#cbe2fc] text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span className="leading-snug">
                Please complete the verification below before you proceed with the withdrawal request.
              </span>
            </div>
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </div>

          {/* Form Card */}
          <div className="bg-white border border-[#dceee3] rounded-2xl p-4 space-y-3.5 shadow-xs">
            {/* Full Name */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-[#182620] font-bold">
                <UserIcon className="w-4 h-4 text-[#00a859]" />
                <span>Full Name</span>
              </div>
              {user?.fullName ? (
                <span className="font-bold text-[#182620]">{user.fullName}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('name')}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-black text-xs shadow cursor-pointer transition active:scale-95"
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
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-xs text-[#182620]"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveField('name')}
                  className="px-3 py-1.5 rounded-xl bg-[#00a859] text-white font-black text-xs disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            )}

            <div className="border-t border-[#ebf5ef]" />

            {/* Birthday */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-[#182620] font-bold">
                <Cake className="w-4 h-4 text-[#00a859]" />
                <span>Birthday</span>
              </div>
              {user?.birthday ? (
                <span className="font-bold text-[#182620]">{user.birthday}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('birthday')}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-black text-xs shadow cursor-pointer transition active:scale-95"
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
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-xs text-[#182620]"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveField('birthday')}
                  className="px-3 py-1.5 rounded-xl bg-[#00a859] text-white font-black text-xs disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            )}

            <div className="border-t border-[#ebf5ef]" />

            {/* Phone Number */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-[#182620] font-bold">
                <Phone className="w-4 h-4 text-[#00a859]" />
                <span>Phone Number</span>
              </div>
              <span className="font-mono font-bold text-[#182620]">{phone}</span>
            </div>

            <div className="border-t border-[#ebf5ef]" />

            {/* Email */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-[#182620] font-bold">
                <Mail className="w-4 h-4 text-[#00a859]" />
                <span>Email</span>
              </div>
              {user?.email ? (
                <span className="font-bold text-[#182620]">{user.email}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('email')}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-black text-xs shadow cursor-pointer transition active:scale-95"
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
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-xs text-[#182620]"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveField('email')}
                  className="px-3 py-1.5 rounded-xl bg-[#00a859] text-white font-black text-xs disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Security Disclaimer with Headset Icon */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-[#dceee3] text-[11px] text-[#4a6b5a]">
            <div className="w-7 h-7 rounded-full bg-[#e6f9ef] flex items-center justify-center shrink-0 mt-0.5">
              <Headphones className="w-4 h-4 text-[#00a859]" />
            </div>
            <p className="leading-snug">
              For privacy and security, Information can't modified after confirmation. Please{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenSupport) onOpenSupport();
                }}
                className="text-[#00a859] font-bold underline cursor-pointer"
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
                className="w-full py-3 rounded-2xl bg-[#ef1a1a] hover:bg-[#d91414] text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
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
