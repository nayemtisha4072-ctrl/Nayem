/**
 * Announcement Marquee Bar Component for Banglabaji
 * Matches Screenshot_6:
 * - Mustard gold / bronze background (#c49c33)
 * - White megaphone/speaker icon on the left
 * - Scrolling text: "বাংলাবাজি প্ল্যাটফর্মে স্বাগতম"
 */

import React from 'react';
import { Volume2 } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string;
  lang: 'bn' | 'en';
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  text = 'Fb88baji প্ল্যাটফর্মে স্বাগতম! বিকাশ, নগদ ও রকেটে ইনস্ট্যান্ট ডিপোজিট করুন এবং পান আকর্ষণীয় বোনাস।',
  lang,
}) => {
  return (
    <div className="w-full bg-bangla-marquee text-slate-950 font-bold text-xs sm:text-sm py-2 px-3 flex items-center gap-2.5 overflow-hidden shadow-sm select-none border-y border-amber-500/40">
      {/* Left Speaker Icon */}
      <div className="flex items-center gap-1 shrink-0 text-slate-950 pl-1">
        <Volume2 className="w-4 h-4 text-slate-950 fill-slate-950" />
      </div>

      {/* Marquee Text */}
      <div className="flex-1 overflow-hidden whitespace-nowrap relative">
        <div className="animate-marquee inline-block font-bold">
          <span className="mx-4">{text}</span>
          <span className="mx-4">•</span>
          <span className="mx-4">
            {lang === 'bn'
              ? 'নিরাপদ ও নির্ভরযোগ্য গেমিং প্ল্যাটফর্ম — ২৪/৭ কাস্টমার সাপোর্ট এবং দ্রুত ক্যাশআউট।'
              : 'Official Trusted Gaming Partner — 24/7 Live Support and Instant Automated Cashout.'}
          </span>
          <span className="mx-4">•</span>
          <span className="mx-4">{text}</span>
        </div>
      </div>
    </div>
  );
};
