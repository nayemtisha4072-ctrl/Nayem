/**
 * Announcement Marquee Bar Component
 * Soft mint bar with emerald speaker icon and crisp dark-green typography.
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
    <div className="w-full rounded-xl bg-bangla-marquee text-[#0b4f2f] font-bold text-xs sm:text-sm py-2 px-3 flex items-center gap-2.5 overflow-hidden shadow-2xs select-none border border-[#c4ead4]">
      <div className="flex items-center gap-1 shrink-0 text-[#00a859] pl-0.5">
        <Volume2 className="w-4 h-4 text-[#00a859]" />
      </div>

      <div className="flex-1 overflow-hidden whitespace-nowrap relative">
        <div className="animate-marquee inline-block font-bold">
          <span className="mx-4">{text}</span>
          <span className="mx-4 text-[#00a859]">•</span>
          <span className="mx-4">
            {lang === 'bn'
              ? 'নিরাপদ ও নির্ভরযোগ্য গেমিং প্ল্যাটফর্ম — ২৪/৭ কাস্টমার সাপোর্ট এবং দ্রুত ক্যাশআউট।'
              : 'Official Trusted Gaming Partner — 24/7 Live Support and Instant Automated Cashout.'}
          </span>
          <span className="mx-4 text-[#00a859]">•</span>
          <span className="mx-4">{text}</span>
        </div>
      </div>
    </div>
  );
};
