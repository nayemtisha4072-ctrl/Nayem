/**
 * Comprehensive Policy & Rules Modal for Fb88baji
 * Covers all 7 essential regulatory policies shown in Screenshot_13:
 * 1. Responsible Gaming (দায়িত্বশীল গেমিং)
 * 2. Privacy Policy (গোপনীয়তা নীতি)
 * 3. Rules & Regulations (নিয়ম ও কানুন)
 * 4. 18+ Policy (১৮+ বয়স সীমা ও নিরাপত্তা)
 * 5. About Us (আমাদের সম্পর্কে - Fb88baji)
 * 6. KYC Policy (কেওয়াইসি ভেরিফিকেশন ও এএমএল নীতি)
 * 7. Terms & Conditions (সাধারণ শর্তাবলী ও ব্যবহারকারীর চুক্তি)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Lock,
  FileText,
  HelpCircle,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Fb88BajiLogo } from './Fb88BajiLogo';

export type PolicySection =
  | 'responsible'
  | 'privacy'
  | 'rules'
  | '18plus'
  | 'about'
  | 'kyc'
  | 'terms';

interface PolicyModalProps {
  initialSection?: PolicySection;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  initialSection = '18plus',
  onClose,
  lang: initialLang,
}) => {
  const [activeSection, setActiveSection] = useState<PolicySection>(initialSection);
  const [lang, setLang] = useState<'bn' | 'en'>(initialLang);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const navTabs: { id: PolicySection; labelBn: string; labelEn: string; icon: any }[] = [
    { id: '18plus', labelBn: '১৮+ নীতি (18+)', labelEn: '18+ Policy', icon: ShieldAlert },
    { id: 'responsible', labelBn: 'দায়িত্বশীল গেমিং', labelEn: 'Responsible Gaming', icon: HeartHandshake },
    { id: 'rules', labelBn: 'নিয়ম ও কানুন', labelEn: 'Rules & Regulations', icon: FileText },
    { id: 'kyc', labelBn: 'কেওয়াইসি পলিসি (KYC)', labelEn: 'KYC Policy', icon: ShieldCheck },
    { id: 'terms', labelBn: 'শর্তাবলী (Terms)', labelEn: 'Terms & Conditions', icon: Lock },
    { id: 'privacy', labelBn: 'গোপনীয়তা নীতি', labelEn: 'Privacy Policy', icon: Lock },
    { id: 'about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us', icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#42001c] border border-[#940042] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#6e0030] via-[#520024] to-[#42001c] border-b border-[#940042] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fb88BajiLogo size="sm" />
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'অফিসিয়াল নীতিমালা ও নিয়মাবলী' : 'Official Policies & Regulations'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  VERIFIED
                </span>
              </h2>
              <p className="text-[11px] text-rose-200">Fb88baji Official Regulatory Compliance & Fair Gaming</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Lang switch */}
            <div className="flex bg-black/40 rounded-xl p-0.5 border border-[#940042]">
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  lang === 'bn' ? 'bg-[#940042] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  lang === 'en' ? 'bg-[#940042] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center overflow-x-auto no-scrollbar bg-[#330015] border-b border-[#780036] px-3 py-1.5 gap-1.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#ba0050] text-white shadow-md'
                    : 'text-rose-200/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-rose-300'}`} />
                <span>{lang === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 text-xs sm:text-sm leading-relaxed">
          {/* 1. 18+ POLICY */}
          {activeSection === '18plus' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/70 to-rose-950/70 border border-red-500/40 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-black text-red-300">
                    {lang === 'bn' ? '১৮+ বয়স সীমা ও কঠোর অপ্রাপ্তবয়স্ক সুরক্ষা নীতি' : 'Strict 18+ Age Requirement & Minor Protection'}
                  </h3>
                  <p className="text-xs text-rose-200 mt-1">
                    {lang === 'bn'
                      ? 'Fb88baji প্ল্যাটফর্মে বাজি ধরা বা ক্যাসিনো গেম খেলার জন্য ব্যবহারকারীর বয়স বাধ্যতামূলকভাবে ১৮ বছর বা তার বেশি হতে হবে।'
                      : 'Underage gambling is an offence. You must be at least 18 years old to access and place bets on Fb88baji.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#540026] border border-[#800038] space-y-2">
                  <h4 className="font-bold text-amber-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {lang === 'bn' ? 'বয়স যাচাইকরণ প্রক্রিয়া' : 'Age Verification Procedure'}
                  </h4>
                  <p className="text-xs text-rose-100 leading-relaxed">
                    {lang === 'bn'
                      ? 'প্রতিটি নিবন্ধিত অ্যাকাউন্টকে জাতীয় পরিচয়পত্র (NID), পাসপোর্ট বা ড্রাইভিং লাইসেন্স দিয়ে বয়স প্রমাণ করতে হয়। অপ্রাপ্তবয়স্ক কোনো ব্যক্তির অ্যাকাউন্ট শনাক্ত হলে তা তাৎক্ষণিকভাবে স্থায়ীভাবে বাতিল (Banned) করা হয়।'
                      : 'All players are subject to identity verification. Any account suspected of belonging to an individual under 18 years old will be suspended and permanently terminated.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#540026] border border-[#800038] space-y-2">
                  <h4 className="font-bold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    {lang === 'bn' ? 'অভিভাবকদের জন্য পরামর্শ' : 'Parental Controls Advice'}
                  </h4>
                  <p className="text-xs text-rose-100 leading-relaxed">
                    {lang === 'bn'
                      ? 'যদি আপনার পরিবারের সাথে ডিভাইস শেয়ার করা হয়, তবে Net Nanny বা CyberPatrol এর মতো প্যারেন্টাল কন্ট্রোল সফটওয়্যার ব্যবহার করে অপ্রাপ্তবয়স্কদের অ্যাক্সেস ব্লক করুন এবং আপনার লগইন তথ্য গোপন রাখুন।'
                      : 'We encourage parents to use filtering software such as Net Nanny or CyberPatrol to prevent underage family members from accessing real money gaming sites.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. RESPONSIBLE GAMING */}
          {activeSection === 'responsible' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-3">
                <HeartHandshake className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-black text-emerald-300">
                    {lang === 'bn' ? 'দায়িত্বশীল গেমিং নীতিমালা (Responsible Gaming Policy)' : 'Responsible Gaming & Player Well-Being'}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-1">
                    {lang === 'bn'
                      ? 'গেমিং শুধুমাত্র বিনোদনের জন্য। কখনই জীবিকা অর্জনের উপায় বা ঋণের সমাধান হিসেবে বিবেচনা করবেন না।'
                      : 'Gambling should always be entertaining. Never gamble with money you cannot afford to lose.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-white text-sm">
                  {lang === 'bn' ? 'আমাদের নিয়ন্ত্রিত গেমিং টুলস ও সুরক্ষাসমূহ:' : 'Our Controlled Gaming Tools & Safeguards:'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#540026] border border-[#800038]">
                    <div className="font-bold text-amber-300 text-xs">🔒 সেলফ-এক্সক্লুশন (Self-Exclusion)</div>
                    <div className="text-[11px] text-rose-200 mt-1">
                      {lang === 'bn' ? '২৪ ঘণ্টা থেকে ৬ মাস পর্যন্ত সাময়িকভাবে অ্যাকাউন্ট লক করে গেমিং বিরতি নিন।' : 'Take a break by locking your account temporarily for 24h to 6 months.'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#540026] border border-[#800038]">
                    <div className="font-bold text-amber-300 text-xs">💰 দৈনিক ডিপোজিট লিমিট</div>
                    <div className="text-[11px] text-rose-200 mt-1">
                      {lang === 'bn' ? 'প্রতিদিনের জন্য সর্বোচ্চ জমা করার টাকার পরিমাণ সীমাবদ্ধ করতে পারেন।' : 'Set a maximum daily deposit threshold to budget your spending.'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#540026] border border-[#800038]">
                    <div className="font-bold text-amber-300 text-xs">⏱️ রিয়েলিটি চেক টাইমার</div>
                    <div className="text-[11px] text-rose-200 mt-1">
                      {lang === 'bn' ? 'নির্দিষ্ট সময় অন্তর সেশন নোটিফিকেশন দিয়ে সময় ও ব্যালেন্স ব্যয়ের সতর্কবার্তা।' : 'Regular popup reminders showing time spent and net wagering results.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#2b0012] border border-[#780036] text-xs space-y-1.5">
                <div className="font-bold text-rose-300">সাহায্যের জন্য আন্তর্জাতিক সংস্থা:</div>
                <div className="text-slate-300">GamCare (www.gamcare.org.uk) • Gambling Therapy (www.gamblingtherapy.org) • BeGambleAware</div>
              </div>
            </div>
          )}

          {/* 3. RULES & REGULATIONS */}
          {activeSection === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#540026] border border-[#800038]">
                <h3 className="text-base font-black text-amber-300 mb-2">
                  {lang === 'bn' ? 'গেমিং নিয়ম ও বাজি নীতিমালা (Rules & Regulations)' : 'General Gaming & Wagering Regulations'}
                </h3>
                <p className="text-xs text-rose-100">
                  {lang === 'bn'
                    ? 'Fb88baji-তে অ্যাকাউন্ট পরিচালনা, স্পোর্টস বাজি এবং ক্যাসিনো খেলার জন্য প্রযোজ্য আবশ্যিক নিয়মাবলী।'
                    : 'Mandatory operational rules governing accounts, sports betting, and casino games on Fb88baji.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-black/30 border border-[#780036] space-y-1">
                  <div className="font-bold text-amber-400 text-xs">১. এক ব্যক্তি, এক অ্যাকাউন্ট (Single Account Rule)</div>
                  <p className="text-xs text-slate-300">
                    {lang === 'bn'
                      ? 'প্রতিজন ব্যবহারকারী শুধুমাত্র একটি অ্যাকাউন্ট পরিচালনা করতে পারবেন। একই আইপি, ফোন বা ব্যাংক তথ্যে একাধিক অ্যাকাউন্ট পাওয়া গেলে সব অ্যাকাউন্ট স্থগিত এবং ফান্ড বাতিল করা হবে।'
                      : 'Strictly one account per individual, household, phone number, and IP address. Duplicate accounts will be terminated.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-[#780036] space-y-1">
                  <div className="font-bold text-amber-400 text-xs">২. স্পোর্টস বেটিং সেটেলমেন্ট (Sportsbook Settlement)</div>
                  <p className="text-xs text-slate-300">
                    {lang === 'bn'
                      ? 'অফিসিয়াল ম্যাচ ফলাফলের উপর ভিত্তি করে বাজি নিষ্পত্তি করা হবে। বৃষ্টি বা কোনো কারণে ম্যাচ বাতিল হলে প্রবিধান অনুযায়ী রিফান্ড বা রোলওভার নির্ধারিত হবে।'
                      : 'All bets are settled based on official governing body results. Abandoned or void matches will be handled according to international bookmaking rules.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-[#780036] space-y-1">
                  <div className="font-bold text-amber-400 text-xs">৩. সফটওয়্যার ফেয়ার-প্লে (Fair Play Guarantee)</div>
                  <p className="text-xs text-slate-300">
                    {lang === 'bn'
                      ? 'সকল স্লট এবং লাইভ ক্যাসিনো গেম আন্তর্জাতিকভাবে প্রত্যয়িত সার্টিফাইড RNG (Random Number Generator) দ্বারা পরিচালিত। কোনো বট বা অনৈতিক কৌশল ব্যবহার সম্পূর্ণ নিষিদ্ধ।'
                      : 'All casino games utilize certified RNG technology ensuring completely random, unbiased outcomes. Any use of automated bot software results in immediate permanent ban.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. KYC POLICY */}
          {activeSection === 'kyc' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#540026] border border-[#800038]">
                <h3 className="text-base font-black text-amber-300 mb-2">
                  {lang === 'bn' ? 'কেওয়াইসি ও আইডেন্টিটি ভেরিফিকেশন নীতি (KYC Policy)' : 'Know Your Customer (KYC) & AML Policy'}
                </h3>
                <p className="text-xs text-rose-100">
                  {lang === 'bn'
                    ? 'অর্থপাচার রোধ ও প্লেয়ারদের একাউন্টের নিরঙ্কুশ নিরাপত্তা নিশ্চিতে আন্তর্জাতিক AML আইন মেনে KYC সম্পন্ন করা বাধ্যতামূলক।'
                    : 'To comply with international Anti-Money Laundering (AML) standards and protect player funds, mandatory KYC verification is required.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/30 border border-[#780036] space-y-2">
                  <div className="font-bold text-emerald-400 text-xs">প্রয়োজনীয় ডকুমেন্টসমূহ:</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>জাতীয় পরিচয়পত্র (NID) / স্মার্ট কার্ড এর স্পষ্ট উভয় পাশের ছবি।</li>
                    <li>অথবা বৈধ পাসপোর্ট বা বাংলাদেশ ড্রাইভিং লাইসেন্স।</li>
                    <li>মোবাইল ব্যাংকিং (বিকাশ / নগদ) একাউন্টের মালিকানার প্রমাণ।</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-[#780036] space-y-2">
                  <div className="font-bold text-amber-400 text-xs">ভেরিফিকেশন সম্পন্ন করার নিয়ম:</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>অ্যাকাউন্টের "Personal Information" বা KYC মেনু থেকে ফাইল আপলোড করুন।</li>
                    <li>সাধারণত ১২ থেকে ২৪ ঘণ্টার মধ্যে অ্যাডমিন টিম দ্বারা ভেরিফাই করা হয়।</li>
                    <li>KYC ভেরিফাইড হলে সর্বোচ্চ উইথড্রয়াল লিমিট সুবিধা পাওয়া যায়।</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 5. TERMS & CONDITIONS */}
          {activeSection === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#540026] border border-[#800038]">
                <h3 className="text-base font-black text-amber-300 mb-2">
                  {lang === 'bn' ? 'সাধারণ শর্তাবলী (Terms & Conditions)' : 'General Terms and User Agreement'}
                </h3>
                <p className="text-xs text-rose-100">
                  {lang === 'bn'
                    ? 'Fb88baji-তে নিবন্ধন ও ব্যবহারের মাধ্যমে আপনি নিম্নলিখিত সকল শর্তাবলীতে সম্মতি প্রদান করছেন।'
                    : 'By opening an account and using Fb88baji, you accept and agree to all user terms below.'}
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-200">
                <div className="p-3 rounded-xl bg-black/30 border border-[#780036]">
                  <strong className="text-white">১. ডিপোজিট ও ব্যালেন্স: </strong>
                  {lang === 'bn'
                    ? 'প্লেয়ারকে নিজের নামীয় বিকাশ, নগদ বা রকেট অ্যাকাউন্ট থেকে টাকা পাঠাতে হবে এবং সঠিক ট্রানজেকশন আইডি ও স্লিপ জমা দিতে হবে। ভুয়া TrxID দিলে অ্যাকাউন্ট লক করা হবে।'
                    : 'Deposits must be made from personal mobile wallets. Fraudulent Transaction IDs will lead to instant ID suspension.'}
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-[#780036]">
                  <strong className="text-white">২. উইথড্রয়াল নীতি: </strong>
                  {lang === 'bn'
                    ? 'ডিপোজিটকৃত টাকার ন্যূনতম ১x টার্নওভার সম্পন্ন করতে হবে। প্লেয়ারের ওয়ালেটে নূন্যতম ৫০০ টাকা থাকলে উইথড্র আবেদন গ্রহণ করা হয়।'
                    : 'Deposited funds require a minimum 1x turnover before withdrawal can be processed.'}
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-[#780036]">
                  <strong className="text-white">৩. প্রচারমূলক বোনাস: </strong>
                  {lang === 'bn'
                    ? 'যেকোনো বোনাসের সাথে সম্পর্কিত রোলওভার বা ওয়াগারিং পূরণ সাপেক্ষে উইথড্র করা যাবে। বোনাস জালিয়াতি সনাক্ত হলে অ্যাডমিন বোনাস প্রত্যাহার করার অধিকার রাখে।'
                    : 'Promotions and bonuses have strict rollover criteria. Bonus abuse will result in forfeiture of winnings.'}
                </div>
              </div>
            </div>
          )}

          {/* 6. PRIVACY POLICY */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#540026] border border-[#800038]">
                <h3 className="text-base font-black text-amber-300 mb-2">
                  {lang === 'bn' ? 'গোপনীয়তা ও ডেটা সুরক্ষা নীতি (Privacy Policy)' : 'Privacy Policy & Data Protection'}
                </h3>
                <p className="text-xs text-rose-100">
                  {lang === 'bn'
                    ? 'আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের সর্বোচ্চ অগ্রাধিকার। আমরা কীভাবে আপনার ডেটা সংগ্রহ ও সুরক্ষিত রাখি।'
                    : 'We are committed to safeguarding your personal data with high-grade cryptographic security.'}
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-200">
                <p>
                  {lang === 'bn'
                    ? '• তথ্য এনক্রিপশন: সমস্ত ট্রানজেকশন এবং পাসওয়ার্ড আন্তর্জাতিক মানের ২৫৬-বিট SSL এনক্রিপশন দ্বারা সুরক্ষিত।'
                    : '• Encryption: All user communications and financial data are secured using 256-bit SSL encryption.'}
                </p>
                <p>
                  {lang === 'bn'
                    ? '• তৃতীয় পক্ষের সাথে সুরক্ষা: Fb88baji কোনো অবস্থাতেই ব্যবহারকারীর তথ্য বিজ্ঞাপনদাতা বা কোনো থার্ড পার্টির কাছে বিক্রি বা হস্তান্তর করে না।'
                    : '• Non-Disclosure: We never sell or distribute your personal contact details to third-party advertisers.'}
                </p>
                <p>
                  {lang === 'bn'
                    ? '• তথ্যের পরিবর্তন ও অধিকার: আপনি যেকোনো সময় আপনার প্রোফাইল তথ্য সংশোধন করতে পারবেন অথবা সহায়তা দলের সাথে যোগাযোগ করে অ্যাকাউন্ট নিষ্পত্তির অনুরোধ করতে পারবেন।'
                    : '• User Rights: You hold full access rights to review and update your registered account details at any time.'}
                </p>
              </div>
            </div>
          )}

          {/* 7. ABOUT US */}
          {activeSection === 'about' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#6e0030] to-[#42001c] border border-[#940042] space-y-3">
                <div className="flex items-center gap-3">
                  <Fb88BajiLogo size="md" />
                  <div>
                    <h3 className="text-base font-black text-white">Fb88baji - Best Quality Platform</h3>
                    <p className="text-xs text-amber-300 font-semibold">বাংলাদেশের বিশ্বস্ত স্পোর্টস ও অনলাইন ক্যাসিনো গেমিং</p>
                  </div>
                </div>
                <p className="text-xs text-rose-100 leading-relaxed">
                  {lang === 'bn'
                    ? 'Fb88baji হলো বাংলাদেশের অন্যতম শীর্ষস্থানীয় স্পোর্টস বেটিং ও অনলাইন ক্যাসিনো এন্টারটেইনমেন্ট প্ল্যাটফর্ম। আমরা ক্রিকেট, ফুটবল, লাইভ ক্যাসিনো, স্লট ও ক্র্যাশ গেমসের বিশাল সমাহার নিয়ে এসেছি সম্পূর্ণ সুরক্ষিত ও ফেয়ার এনভায়রনমেন্টে।'
                    : 'Fb88baji is the premier sports betting and online casino destination in Bangladesh, offering cricket exchanges, live dealer rooms, slots, and crash games with instant payouts.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-black/30 border border-[#780036] space-y-1">
                  <div className="font-bold text-amber-300">⚡ দ্রুততম লেনদেন</div>
                  <div className="text-slate-300 text-[11px]">বিকাশ, নগদ ও রকেটে ৫-১০ মিনিটের মধ্যে ইনস্ট্যান্ট ডিপোজিট ও উইথড্রয়াল।</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/30 border border-[#780036] space-y-1">
                  <div className="font-bold text-emerald-400">🛡️ লাইসেন্সপ্রাপ্ত ও সার্টিফাইড</div>
                  <div className="text-slate-300 text-[11px]">Gaming Curacao ও Anjouan eGaming এর আন্তর্জাতিক নিয়ন্ত্রক সনদপ্রাপ্ত।</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/30 border border-[#780036] space-y-1">
                  <div className="font-bold text-teal-300">🎧 ২৪/৭ লাইভ সাপোর্ট</div>
                  <div className="text-slate-300 text-[11px]">যেকোনো প্রয়োজনে ২৪ ঘণ্টা সার্বক্ষণিক বাংলা কাস্টমার কেয়ার সার্ভিস।</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#330015] border-t border-[#780036] flex items-center justify-between">
          <div className="text-[11px] text-rose-300 font-medium">
            © 2026 Fb88baji. All Rights Reserved. Gaming Curacao License No. 365/JAZ.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl gold-accent-btn font-black text-xs shadow transition active:scale-95 cursor-pointer"
          >
            {lang === 'bn' ? 'বুঝেছি (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
