/**
 * Fb88Baji Official Brand Logo Component
 * Emerald Green monogram badge with adaptive wordmark for Light (White Header) or Dark (Footer) surfaces.
 */

import React from 'react';

interface Fb88BajiLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark';
}

export const Fb88BajiLogo: React.FC<Fb88BajiLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  variant = 'light',
}) => {
  const sizeStyles = {
    xs: { icon: 'w-6 h-6 text-xs', text: 'text-sm' },
    sm: { icon: 'w-7 h-7 text-xs', text: 'text-base' },
    md: { icon: 'w-8 h-8 text-sm', text: 'text-xl' },
    lg: { icon: 'w-10 h-10 text-base', text: 'text-2xl' },
    xl: { icon: 'w-12 h-12 text-lg', text: 'text-3xl' },
  }[size];

  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 select-none whitespace-nowrap shrink-0 ${className}`}>
      {/* FB Emerald Monogram Badge */}
      <div
        className={`relative ${sizeStyles.icon} rounded-xl bg-gradient-to-br from-[#2ad178] via-[#00a859] to-[#007a3d] border border-[#74e8a8] shadow-md shadow-emerald-900/20 flex items-center justify-center font-black italic text-white tracking-tighter shrink-0 transform -skew-x-6`}
      >
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">FB</span>
        <span className="absolute -top-1.5 -right-1 text-[10px]">👑</span>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col justify-center shrink-0">
        <div className="flex items-center whitespace-nowrap">
          <span
            className={`font-black italic tracking-tight ${sizeStyles.text} ${
              isLight ? 'text-[#0c2d1d]' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
            }`}
            style={{ fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif" }}
          >
            Fb<span className={isLight ? 'text-[#00a859]' : 'text-amber-300'}>88</span>baji
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase -mt-0.5 whitespace-nowrap ${
              isLight ? 'text-[#059669]' : 'text-emerald-200'
            }`}
          >
            Official Gaming Platform
          </span>
        )}
      </div>
    </div>
  );
};
