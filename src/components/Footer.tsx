/**
 * Footer Component for Banglabaji
 * Matches Screenshot_10:
 * - Magenta background (#820038)
 * - Payment Methods row (Bank Deposit, bKash, Rocket, Nagad, Upay, Cryptocurrency, OK Wallet, SureCash, Tap)
 * - Responsible Gaming (GamCare, 18+, Hand) & Community Websites (Facebook, Instagram, Telegram, X)
 * - Navigation links: Responsible Gaming | Privacy Policy | Rules & Regulations | 18+ | About Us | KYC | Terms & Conditions
 * - Gaming License: Gaming Curacao & Anjouan eGaming
 * - Logo & Copyright: "BB Banglabaji - Best Quality Platform © 2026 banglabaji Copyrights. All Rights Reserved"
 * - SEO text: "banglabaji - Top Cricket Betting & Casino App"
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, HeartHandshake, Lock, Phone } from 'lucide-react';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { NavTab } from './Sidebar';
import { PolicySection } from './PolicyModal';
import {
  BkashLogo,
  RocketLogo,
  NagadLogo,
  UpayLogo,
  BankTransferLogo,
  GamCareLogo,
  Age18PlusLogo,
  ResponsibleGamingHandLogo,
  GamingCuracaoLogo,
  AnjouanGamingLogo,
} from './BrandLogos';

interface FooterProps {
  onOpenResponsibleGaming: () => void;
  onOpenPolicy?: (section: PolicySection) => void;
  onOpenTab: (tab: NavTab) => void;
  onOpenAdmin?: () => void;
  lang: 'bn' | 'en';
}

export const Footer: React.FC<FooterProps> = ({
  onOpenResponsibleGaming,
  onOpenPolicy,
  onOpenTab,
  onOpenAdmin,
  lang,
}) => {
  const handleOpen = (sec: PolicySection) => {
    if (onOpenPolicy) onOpenPolicy(sec);
    else if (sec === 'responsible') onOpenResponsibleGaming();
  };
  return (
    <footer className="w-full bg-[#820038] border-t border-[#9e0046] pt-8 pb-20 lg:pb-12 text-rose-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        {/* 1. Payment Methods (Matches Official Brand Logos & Screenshot_10) */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
            Payment Methods
          </h3>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 py-1">
            {/* Bank Transfer (Matches Screenshot) */}
            <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-white shadow-sm border border-cyan-400/40 hover:brightness-105 transition cursor-pointer">
              <BankTransferLogo size="sm" showText={true} />
            </div>

            {/* bKash */}
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-[#E2136E] hover:bg-[#c90f61] text-white text-xs font-black shadow-md transition cursor-pointer">
              <BkashLogo size="sm" showText={true} />
            </div>

            {/* Nagad */}
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#ED1C24] hover:opacity-95 text-white text-xs font-black shadow-md transition cursor-pointer">
              <NagadLogo size="sm" showText={true} />
            </div>

            {/* Rocket */}
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-[#8C3494] hover:bg-[#7a2c82] text-white text-xs font-black shadow-md transition cursor-pointer">
              <RocketLogo size="sm" showText={true} />
            </div>

            {/* Upay */}
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-[#004A97] hover:bg-[#003c7a] text-white text-xs font-black shadow-md transition cursor-pointer">
              <UpayLogo size="sm" showText={true} />
            </div>
          </div>
        </div>

        {/* 2. Responsible Gaming & Community Websites (Matches Official Badges & Screenshot_10) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
          {/* Responsible Gaming */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-white">Responsible Gaming</h4>
            <div className="flex items-center gap-2.5">
              <GamCareLogo size="md" />
              <Age18PlusLogo size="md" />
              <ResponsibleGamingHandLogo size="md" />
            </div>
          </div>

          {/* Community Websites */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-white">Community Websites</h4>
            <div className="flex items-center gap-2.5">
              {['Facebook', 'Instagram', 'Telegram', 'X'].map((platform, idx) => (
                <div
                  key={platform}
                  className="w-8 h-8 rounded-full border border-white/40 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer transition"
                  title={platform}
                >
                  <span className="text-xs font-black">
                    {idx === 0 ? 'f' : idx === 1 ? '📷' : idx === 2 ? '✈' : '𝕏'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Footer Links with vertical bars (Matches Screenshot_10 & Screenshot_13) */}
        <div className="border-t border-[#a30048] pt-4">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-bold text-amber-300">
            <button
              type="button"
              onClick={() => handleOpen('responsible')}
              className="hover:underline cursor-pointer"
            >
              Responsible Gaming
            </button>
            <span className="text-rose-300/60">|</span>
            <button
              type="button"
              onClick={() => handleOpen('privacy')}
              className="hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-rose-300/60">|</span>
            <button
              type="button"
              onClick={() => handleOpen('rules')}
              className="hover:underline cursor-pointer"
            >
              Rules & Regulations
            </button>
            <span className="text-rose-300/60">|</span>
            <button
              type="button"
              onClick={() => handleOpen('18plus')}
              className="hover:underline cursor-pointer"
            >
              18+
            </button>
            <span className="text-rose-300/60">|</span>
            <button
              type="button"
              onClick={() => handleOpen('about')}
              className="hover:underline cursor-pointer"
            >
              About Us
            </button>
            <span className="text-rose-300/60">|</span>
            <button
              type="button"
              onClick={() => handleOpen('kyc')}
              className="hover:underline cursor-pointer"
            >
              KYC
            </button>
            <span className="text-rose-300/60">|</span>
            <button
              type="button"
              onClick={() => handleOpen('terms')}
              className="hover:underline cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>

        {/* 4. Gaming License - Only the 2 brand logos */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
            Gaming License
          </h4>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <GamingCuracaoLogo size="md" />
            <AnjouanGamingLogo size="md" />
          </div>
        </div>

        {/* 5. Brand & Copyright */}
        <div className="pt-3 border-t border-[#a30048] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Fb88BajiLogo size="sm" showTagline={true} />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-rose-200/80 font-mono">
            <span>© 2026 fb88baji Copyrights. All Rights Reserved</span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-2 py-0.5 rounded-md bg-[#4f0022] hover:bg-amber-400 hover:text-slate-950 border border-amber-400/30 text-amber-300 font-bold transition cursor-pointer text-[10px]"
                title="Open Admin Portal"
              >
                ⚙️ {lang === 'bn' ? 'এডমিন প্যানেল' : 'Admin Panel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
