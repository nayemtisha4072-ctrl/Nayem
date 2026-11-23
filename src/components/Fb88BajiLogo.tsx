/**
 * Fb88baji Official Brand Logo Component
 * - "FB" bold italic white monogram in a vibrant crimson-pink rounded badge with golden outline & crown sparkle
 * - Wordmark: "Fb88baji" with "88" in radiant gold
 */

import React from 'react';

interface Fb88BajiLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const Fb88BajiLogo: React.FC<Fb88BajiLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const sizeStyles = {
    xs: { icon: 'w-6 h-6 text-xs', text: 'text-sm' },
    sm: { icon: 'w-7 h-7 text-xs', text: 'text-base' },
    md: { icon: 'w-8 h-8 text-sm', text: 'text-xl' },
    lg: { icon: 'w-10 h-10 text-base', text: 'text-2xl' },
    xl: { icon: 'w-12 h-12 text-lg', text: 'text-3xl' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 select-none whitespace-nowrap shrink-0 ${className}`}>
      {/* FB Monogram Badge */}
      <div
        className={`relative ${sizeStyles.icon} rounded-xl bg-gradient-to-br from-[#e00062] via-[#b8004f] to-[#780033] border border-[#ff4797]/70 shadow-lg shadow-black/40 flex items-center justify-center font-black italic text-white tracking-tighter shrink-0 transform -skew-x-6`}
      >
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">FB</span>
        {/* Golden crown sparkle */}
        <span className="absolute -top-1.5 -right-1 text-[10px] text-amber-300">👑</span>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col justify-center shrink-0">
        <div className="flex items-center whitespace-nowrap">
          <span
            className={`font-black italic tracking-tight text-white ${sizeStyles.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
            style={{ fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif" }}
          >
            Fb<span className="text-amber-300">88</span>baji
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-semibold text-amber-300/90 tracking-wider uppercase -mt-0.5 whitespace-nowrap">
            Official Gaming Platform
          </span>
        )}
      </div>
    </div>
  );
};
