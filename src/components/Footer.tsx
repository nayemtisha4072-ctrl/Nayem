/**
 * Footer Component for Fb88baji
 * Deep emerald-green footer (#0a4a2c) harmonized with the fresh Mint/Emerald Green & White design.
 */

import React from 'react';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { NavTab } from './Sidebar';
import { PolicySection } from './PolicyModal';
import {
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
  lang: 'bn' | 'en';
}

export const Footer: React.FC<FooterProps> = ({
  onOpenResponsibleGaming,
  onOpenPolicy,
}) => {
  const handleOpen = (sec: PolicySection) => {
    if (onOpenPolicy) onOpenPolicy(sec);
    else if (sec === 'responsible') onOpenResponsibleGaming();
  };

  return (
    <footer className="w-full bg-[#0a4a2c] border-t border-[#156d42] pt-8 pb-24 lg:pb-12 text-emerald-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
            Payment Methods
          </h3>
          <div className="py-1">
            <div className="w-full max-w-[360px] sm:max-w-[440px] aspect-[1748/284] overflow-hidden rounded-full drop-shadow-md">
              <img
                src="/assets/aistudio/file_00000000b8248211b4bac1780c067b7c_2c37e297.png"
                alt="Payment Methods: bKash, Nagad, Rocket, Upay"
                className="w-full h-full object-cover object-[50%_45.8%]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Responsible Gaming & Community Websites */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="text-xs font-black text-white">Responsible Gaming</h4>
            <div className="flex items-center gap-2.5">
              <GamCareLogo size="md" />
              <Age18PlusLogo size="md" />
              <ResponsibleGamingHandLogo size="md" />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-white">Community Websites</h4>
            <div className="flex items-center gap-2.5">
              {['Facebook', 'Instagram', 'Telegram', 'X'].map((platform, idx) => (
                <div
                  key={platform}
                  className="w-8 h-8 rounded-full border border-emerald-200/40 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer transition"
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

        {/* Footer Policy Links */}
        <div className="border-t border-[#166d43] pt-4">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-bold text-[#86efac]">
            <button type="button" onClick={() => handleOpen('responsible')} className="hover:underline cursor-pointer">
              Responsible Gaming
            </button>
            <span className="text-emerald-400/50">|</span>
            <button type="button" onClick={() => handleOpen('privacy')} className="hover:underline cursor-pointer">
              Privacy Policy
            </button>
            <span className="text-emerald-400/50">|</span>
            <button type="button" onClick={() => handleOpen('rules')} className="hover:underline cursor-pointer">
              Rules &amp; Regulations
            </button>
            <span className="text-emerald-400/50">|</span>
            <button type="button" onClick={() => handleOpen('18plus')} className="hover:underline cursor-pointer">
              18+
            </button>
            <span className="text-emerald-400/50">|</span>
            <button type="button" onClick={() => handleOpen('about')} className="hover:underline cursor-pointer">
              About Us
            </button>
            <span className="text-emerald-400/50">|</span>
            <button type="button" onClick={() => handleOpen('kyc')} className="hover:underline cursor-pointer">
              KYC
            </button>
            <span className="text-emerald-400/50">|</span>
            <button type="button" onClick={() => handleOpen('terms')} className="hover:underline cursor-pointer">
              Terms &amp; Conditions
            </button>
          </div>
        </div>

        {/* Gaming License */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
            Gaming License
          </h4>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <GamingCuracaoLogo size="md" />
            <AnjouanGamingLogo size="md" />
          </div>
        </div>

        {/* Brand & Copyright */}
        <div className="pt-3 border-t border-[#166d43] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Fb88BajiLogo size="sm" variant="dark" showTagline={true} />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-emerald-100/80 font-mono">
            <span>© 2026 fb88baji Copyrights. All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
