/**
 * Authentication Modal (Login & Sign Up) for Fb88baji
 * Accurately matches Screenshot_15 (Login) & Screenshot_14 (Sign Up):
 * - Solid magenta top bar (#ba0050) with centered title ("Login" / "Sign Up") and close "✕" icon
 * - White modal card with rounded corners
 * - Centered dark magenta brand pill badge ("BB Banglabaji")
 * - Login form:
 *   - Pink-bordered card with Username & Password fields + eye toggle
 *   - "Forgot Password?" outline button on the right
 *   - Full-width solid magenta "Login" button
 *   - Footer switch: "Do not have an account? Sign Up"
 * - Sign Up form:
 *   - First card: Username* & Password* with live validation checklist:
 *     (Between 6~20 characters, At least one alphabet, At least one number)
 *   - Second card: Phone Number* with Bangladesh flag 🇧🇩 badge + (+880) prefix + Refer Code
 *   - Checkbox: "I agree and understand the Terms and Condition"
 *   - Full-width solid magenta "Submit" button
 *   - Footer switch: "Already have an account? Login"
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Check,
  Info,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { User } from '../types';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthModalProps {
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  onOpenTerms?: () => void;
  lang: 'bn' | 'en';
  noticeMsg?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialTab = 'login',
  onClose,
  onSuccess,
  onOpenTerms,
  lang,
  noticeMsg,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [referCode, setReferCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot password notice state
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse referral code from URL (?ref=...) and handle Escape key
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setReferCode(refParam.trim().toUpperCase());
      }
    } catch {}
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const res = await fetch('/api/v1/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          referCode: referCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'bn' ? 'Google লগইন ব্যর্থ হয়েছে।' : 'Google sign-in failed.'));
        return;
      }
      onSuccess(data.user, data.sessionToken);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      if (err?.code === 'auth/popup-closed-by-user') return;
      setErrorMsg(err?.message || (lang === 'bn' ? 'Google লগইন ব্যর্থ হয়েছে।' : 'Google sign-in failed.'));
    }
  };

  // Real-time password requirement checks (matches Screenshot_14)
  const isLenValid = regPassword.length >= 6 && regPassword.length <= 20;
  const hasAlphabet = /[a-zA-Z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
        return;
      }

      onSuccess(data.user, data.sessionToken);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Server connection error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (!regUsername || regUsername.trim().length < 3) {
      setIsLoading(false);
      setErrorMsg(lang === 'bn' ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' : 'Username must be at least 3 characters.');
      return;
    }
    if (!isLenValid || !hasAlphabet || !hasNumber) {
      setIsLoading(false);
      setErrorMsg(
        lang === 'bn'
          ? 'পাসওয়ার্ড অবশ্যই ৬-২০ অক্ষর, কমপক্ষে একটি ইংরেজি বর্ণ এবং একটি সংখ্যা থাকতে হবে।'
          : 'Password must be 6-20 characters with at least one letter and one number.'
      );
      return;
    }
    if (!regPhone || regPhone.trim().length < 9) {
      setIsLoading(false);
      setErrorMsg(lang === 'bn' ? 'সঠিক ফোন নম্বর দিন।' : 'Please enter a valid phone number.');
      return;
    }
    if (!agreeTerms) {
      setIsLoading(false);
      setErrorMsg(
        lang === 'bn'
          ? 'শর্তাবলীতে সম্মতি প্রদান করা আবশ্যক।'
          : 'You must agree to the Terms and Conditions.'
      );
      return;
    }

    try {
      // Normalize mobile to +880
      const cleanPhone = regPhone.replace(/\D/g, '');
      const fullMobile = cleanPhone.startsWith('880')
        ? `+${cleanPhone}`
        : cleanPhone.startsWith('0')
        ? `+88${cleanPhone}`
        : `+880${cleanPhone}`;

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          password: regPassword,
          mobile: fullMobile,
          referCode: referCode.trim() || undefined,
          ageVerified: true,
          termsAccepted: true,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' : 'Registration failed.'));
        return;
      }

      onSuccess(data.user, data.sessionToken);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Server connection error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* 400px - 440px Modal Box matching Screenshot_14 & 15 */}
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-[#cde8d8]">
        
        {/* Top Solid Emerald Header Bar */}
        <div className="relative bg-gradient-to-r from-[#16b864] to-[#00994d] px-5 py-3.5 flex items-center justify-center text-white">
          <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
            {tab === 'login' ? (lang === 'bn' ? 'লগইন' : 'Login') : (lang === 'bn' ? 'রেজিস্টার' : 'Sign Up')}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white p-1 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: White background */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          
          {/* Centered Brand Pill Badge */}
          <div className="flex justify-center pb-1">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#0a4a2c] border border-[#177848] shadow-md">
              <Fb88BajiLogo size="sm" variant="dark" />
            </div>
          </div>

          {/* Error Message Toast */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] shrink-0 font-black">
                !
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Forgot Password Notification */}
          {forgotNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
              <div className="font-bold text-amber-800">পাসওয়ার্ড রিসেট নির্দেশনা:</div>
              <div>{forgotNotice}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LOGIN (Matches Screenshot_15) */}
          {/* ======================================================== */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Card Container with subtle mint border */}
              <div className="p-4 rounded-2xl border border-[#cfe9da] bg-[#f7fcfa] space-y-3.5 shadow-xs">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#182620]">
                    {lang === 'bn' ? 'ইউজারনেম' : 'Username'}
                  </label>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={lang === 'bn' ? 'আপনার ইউজারনেম লিখুন' : 'Username'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cde8d8] bg-white text-[#182620] text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#182620]">
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={lang === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Password'}
                      required
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#cde8d8] bg-white text-[#182620] text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Forgot Password Button (Right Aligned Outline, matches Screenshot_15) */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setForgotNotice(
                      lang === 'bn'
                        ? 'আপনার পাসওয়ার্ড ভুলে গেলে কাস্টমার সাপোর্ট লাইভ চ্যাটে যোগাযোগ করুন।'
                        : 'If you forgot your password, please contact our 24/7 Live Support.'
                    )
                  }
                  className="px-3 py-1 rounded-lg border border-amber-500 text-amber-700 text-xs font-bold hover:bg-amber-50 transition cursor-pointer"
                >
                  {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                </button>
              </div>

              {/* Solid Emerald Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-emerald-900/15 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (lang === 'bn' ? 'লগইন হচ্ছে...' : 'Logging in...') : (lang === 'bn' ? 'লগইন করুন' : 'Login')}
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-2.5 text-[11px] font-bold text-slate-400 uppercase">
                  {lang === 'bn' ? 'অথবা' : 'OR'}
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{lang === 'bn' ? 'Google দিয়ে লগইন করুন' : 'Continue with Google'}</span>
              </button>

              {/* Bottom switch: Do not have an account? Sign Up (Matches Screenshot_15) */}
              <div className="text-center pt-2 text-xs text-slate-600">
                <span>{lang === 'bn' ? 'একাউন্ট নেই? ' : 'Do not have an account? '}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setErrorMsg(null);
                    setForgotNotice(null);
                  }}
                  className="text-[#00a859] font-black hover:underline cursor-pointer ml-1"
                >
                  {lang === 'bn' ? 'রেজিস্টার করুন' : 'Sign Up'}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SIGN UP */}
          {/* ======================================================== */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Section 1 Card (Username & Password with requirements) */}
              <div className="p-4 rounded-2xl border border-[#cfe9da] bg-[#f7fcfa] space-y-3 shadow-xs">
                {/* Username* */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#182620]">
                    Username*
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder={lang === 'bn' ? 'ইউজারনেম দিন (৪-১৫ অক্ষর)' : 'Enter username (4-15 chars)'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cde8d8] bg-white text-[#182620] text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition"
                  />
                </div>

                {/* Password* */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#182620]">
                    Password*
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#cde8d8] bg-white text-[#182620] text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist (Matches Screenshot_14) */}
                <div className="pt-1 space-y-1 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 font-medium transition ${
                      isLenValid ? 'text-emerald-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {isLenValid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>Between 6~20 characters.</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 font-medium transition ${
                      hasAlphabet ? 'text-emerald-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {hasAlphabet ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>At least one alphabet.</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 font-medium transition ${
                      hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>At least one number. (Special character, symbols are allowed)</span>
                  </div>
                </div>
              </div>

              {/* Section 2 Card (Phone Number with BD flag & Refer Code) */}
              <div className="p-4 rounded-2xl border border-[#cfe9da] bg-[#f7fcfa] space-y-3 shadow-xs">
                {/* Phone Number* */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#182620]">
                    {lang === 'bn' ? 'ফোন নম্বর*' : 'Phone Number*'}
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-[#cde8d8] focus-within:border-[#00a859] focus-within:ring-1 focus-within:ring-[#00a859] transition">
                    {/* BD Flag Pill in Emerald */}
                    <div className="bg-[#00a859] px-3.5 py-2.5 flex items-center justify-center shrink-0">
                      {/* Bangladesh Flag graphic */}
                      <div className="w-6 h-4 rounded-xs bg-[#006A4E] relative flex items-center justify-center shadow-xs border border-white/30">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F42A41]" />
                      </div>
                    </div>

                    {/* +880 Prefix & Number Input */}
                    <div className="flex-1 flex items-center bg-white">
                      <span className="pl-3 pr-1 text-slate-700 font-bold text-sm select-none">
                        +880
                      </span>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={lang === 'bn' ? '১XXXXXXXXX' : '17XXXXXXXX'}
                        maxLength={11}
                        required
                        className="w-full px-2 py-2.5 bg-transparent text-[#182620] text-sm placeholder-slate-400 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Refer Code */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#182620]">
                    {lang === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Refer Code'}
                  </label>
                  <input
                    type="text"
                    value={referCode}
                    onChange={(e) => setReferCode(e.target.value)}
                    placeholder={lang === 'bn' ? 'রেফারেল কোড থাকলে দিন' : 'Enter if you have one'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cde8d8] bg-white text-[#182620] text-sm placeholder-slate-400 focus:outline-hidden focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition"
                  />
                </div>
              </div>

              {/* Terms and Condition Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-xs select-none">
                <input
                  type="checkbox"
                  id="agreeTermsCheckbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-300 text-[#00a859] focus:ring-[#00a859] accent-[#00a859] cursor-pointer"
                />
                <label htmlFor="agreeTermsCheckbox" className="text-slate-700 cursor-pointer">
                  <span>{lang === 'bn' ? 'আমি সম্মত এবং শর্তাবলী গ্রহণ করছি ' : 'I agree and understand the '}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenTerms) onOpenTerms();
                    }}
                    className="text-[#00a859] font-bold hover:underline cursor-pointer"
                  >
                    {lang === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms and Condition'}
                  </button>
                </label>
              </div>

              {/* Solid Emerald Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-emerald-900/15 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading
                  ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Submitting...')
                  : (lang === 'bn' ? 'রেজিস্টার সম্পন্ন করুন' : 'Submit')}
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-2.5 text-[11px] font-bold text-slate-400 uppercase">
                  {lang === 'bn' ? 'অথবা' : 'OR'}
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{lang === 'bn' ? 'Google দিয়ে দ্রুত সাইন আপ করুন' : 'Sign Up with Google'}</span>
              </button>

              {/* Bottom switch: Already have an account? Login */}
              <div className="text-center pt-2 text-xs text-slate-600">
                <span>{lang === 'bn' ? 'ইতিমধ্যে একাউন্ট আছে? ' : 'Already have an account? '}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg(null);
                  }}
                  className="text-[#00a859] font-black hover:underline cursor-pointer ml-1"
                >
                  {lang === 'bn' ? 'লগইন করুন' : 'Login'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
