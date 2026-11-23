import React from 'react';

// =========================================================================
// Real Official Logos for Bangladesh MFS & Licensed Gaming Operations
// Uses genuine official high-resolution vector and transparent assets
// =========================================================================

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// 1. bKash (বিকাশ) Official Logo
// Uses authentic official bKash PNG / vector asset with strictly formatted 'bKash'
export const BkashLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Official real bKash logo image */}
      <img
        src="/logos/bkash.png"
        alt="bKash"
        className={`${heights} w-auto object-contain shrink-0 filter brightness-110 drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-white text-xs tracking-tight select-none">
          bKash
        </span>
      )}
    </div>
  );
};

// 2. Rocket (রকেট - Dutch-Bangla Bank) Official Logo
// Uses authentic official Dutch-Bangla Bank Rocket asset
export const RocketLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Official real Rocket logo image */}
      <img
        src="/logos/rocket.png"
        alt="Rocket"
        className={`${heights} w-auto object-contain shrink-0 filter drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-white text-xs tracking-tight select-none">
          Rocket
        </span>
      )}
    </div>
  );
};

// 3. Nagad (নগদ - Bangladesh Post Office) Official Logo
// Uses authentic official Nagad swirl logo asset
export const NagadLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Official real Nagad logo image */}
      <img
        src="/logos/nagad.png"
        alt="Nagad"
        className={`${heights} w-auto object-contain shrink-0 filter drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-white text-xs tracking-tight select-none">
          Nagad
        </span>
      )}
    </div>
  );
};

// 4. Upay (উপায় - UCB MFS) Official Logo
// Uses authentic official UCB Upay logo asset
export const UpayLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Official real Upay logo image */}
      <img
        src="/logos/upay.png"
        alt="upay"
        className={`${heights} w-auto object-contain shrink-0 filter drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-white text-xs tracking-tight select-none">
          upay
        </span>
      )}
    </div>
  );
};

// 5. Bank Transfer Official Logo (Matches uploaded screenshot)
export const BankTransferLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <img
        src="/logos/bank-transfer.svg"
        alt="Bank Transfer"
        className={`${heights} w-auto object-contain shrink-0`}
        loading="lazy"
      />
      {showText && (
        <span className="font-black text-white text-[11px] tracking-wider select-none">
          BANK TRANSFER
        </span>
      )}
    </div>
  );
};
export const BankDepositLogo = BankTransferLogo;

// Official 5-Channel Payment Strip (Matches uploaded image payment-channel.ccdb8c2.png)
export const PaymentChannelBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full bg-white rounded-2xl p-2 sm:p-2.5 shadow-md flex items-center justify-center overflow-hidden border border-amber-400/30 ${className}`}>
      <img
        src="/logos/payment-channel.svg"
        alt="Official Payment Channels: Bank Transfer, bKash, Nagad, Rocket, Upay"
        className="w-full max-h-12 sm:max-h-14 object-contain"
        loading="eager"
      />
    </div>
  );
};

// 6. Cryptocurrency (Bitcoin / USDT) Official Logo
// Uses authentic official Bitcoin ₿ vector asset
export const CryptocurrencyLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Official real Bitcoin SVG */}
      <img
        src="/logos/bitcoin.svg"
        alt="Bitcoin Cryptocurrency"
        className={`${heights} w-auto object-contain shrink-0 filter drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-amber-300 text-[11px] tracking-wider select-none">
          CRYPTOCURRENCY
        </span>
      )}
    </div>
  );
};

// 7. OK Wallet (ONE Bank) Official Logo
// Uses authentic official ONE Bank OK Wallet asset
export const OkWalletLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <img
        src="/logos/ok-wallet.png"
        alt="OK Wallet"
        className={`${heights} w-auto object-contain shrink-0 filter drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-white text-[11px] tracking-tight select-none">
          OK Wallet
        </span>
      )}
    </div>
  );
};

// 8. SureCash / Cellfin Official Logo
// Uses authentic official Cellfin / SureCash mobile banking asset
export const SureCashLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <img
        src="/logos/cellfin.png"
        alt="Cellfin SureCash"
        className={`${heights} w-auto object-contain shrink-0 filter drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-emerald-300 text-[11px] tracking-tight select-none">
          SureCash
        </span>
      )}
    </div>
  );
};

// 9. Tap (Trust Axiata Pay) Official Logo
// Uses authentic official Trust Axiata Pay Tap asset
export const TapLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <img
        src="/logos/tap.png"
        alt="TAP"
        className={`${heights} w-auto object-contain shrink-0 filter drop-shadow-sm`}
        loading="lazy"
      />
      {showText && (
        <span className="font-extrabold text-amber-300 text-[11px] tracking-wider select-none">
          TAP
        </span>
      )}
    </div>
  );
};

// 10. GamCare Official Logo
// Uses authentic official GamCare organization badge
export const GamCareLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-7',
  }[size];

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded bg-white text-slate-900 shadow-sm ${className}`}>
      <img
        src="/logos/gamcare.png"
        alt="GamCare Responsible Gaming"
        className={`${heights} w-auto object-contain`}
        loading="lazy"
      />
    </div>
  );
};

// 11. 18+ Responsible Gaming Official Logo
// Uses authentic official 18+ circle badge
export const Age18PlusLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size];

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/logos/18plus.svg"
        alt="18+ Strictly 18 and Over Only"
        className={`${sizes} object-contain rounded-full shadow-sm`}
        loading="lazy"
      />
    </div>
  );
};

// 12. Responsible Gaming Hand Shield Logo
export const ResponsibleGamingHandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black shrink-0 shadow-sm ${sizes} ${className}`}
      title="Play Responsibly"
    >
      <span className="font-mono text-[11px] font-bold">21+</span>
    </div>
  );
};

// 13. Curaçao eGaming / Gaming Curaçao Official Licensing Brand Logo
// Uses authentic official high-resolution logo asset
export const GamingCuracaoLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-white text-slate-950 shadow-md hover:shadow-lg transition cursor-pointer border border-white/20 ${className}`}
      title="Gaming Curaçao Licensed & Regulated Authority"
    >
      <img
        src="/images.png"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logos/gaming-curacao.png';
        }}
        alt="Gaming Curaçao License"
        className={`${heights} w-auto object-contain shrink-0`}
        loading="lazy"
      />
    </div>
  );
};

// 14. Anjouan Gaming Licensing Board Official Brand Logo
// Uses authentic official Anjouan Internet Gaming License asset
export const AnjouanGamingLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-[#002213] border border-emerald-400/40 hover:border-emerald-300 shadow-md transition cursor-pointer ${className}`}
      title="Government of the Autonomous Island of Anjouan Internet Gaming License"
    >
      <img
        src="/images.jpg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logos/anjouan-gaming.svg';
        }}
        alt="Anjouan Gaming License"
        className={`${heights} w-auto object-contain shrink-0`}
        loading="lazy"
      />
    </div>
  );
};
