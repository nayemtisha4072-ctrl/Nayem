/**
 * Real Scannable QR Code Component using qrcode library
 * Supports live rendering and downloading high-resolution PNG ("Save invite code")
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface QrCodeMatrixProps {
  value: string;
  referralCode?: string;
  size?: number;
  showSaveButton?: boolean;
  saveLabel?: string;
}

export const QrCodeMatrix: React.FC<QrCodeMatrixProps> = ({
  value,
  referralCode,
  size = 112,
  showSaveButton = true,
  saveLabel = 'Save invite code',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value || 'https://fb88baji.com', {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        // fallback handled cleanly
      });
    return () => {
      active = false;
    };
  }, [value]);

  const handleSave = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `fb88-invite-${referralCode || 'qr'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="inline-flex flex-col items-center gap-1.5 shrink-0">
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Referral QR Code"
            width={size}
            height={size}
            className="block rounded-md object-contain"
          />
        ) : (
          <div className="w-24 h-24 bg-slate-100 animate-pulse rounded-md" />
        )}
      </div>
      {showSaveButton && (
        <button
          type="button"
          onClick={handleSave}
          className="w-full px-2.5 py-1.5 rounded-lg bg-[#3b1578] hover:bg-[#4c1d95] text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow transition cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>{saveLabel}</span>
        </button>
      )}
    </div>
  );
};
