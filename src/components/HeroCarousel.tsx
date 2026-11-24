/**
 * Hero Carousel Component for Fb88baji
 * Uses newly generated Emerald-Green & Gold promotional artwork with smooth scrims and high-contrast CTA.
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  onBannerAction: (action: string) => void;
  lang: 'bn' | 'en';
  isLoggedIn?: boolean;
}

interface BannerSlide {
  id: string;
  titleTopBn: string;
  titleMidBn: string;
  titleHighlightBn: string;
  domain: string;
  taglineBn: string;
  buttonBn: string;
  action: string;
  image: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onBannerAction, isLoggedIn = false }) => {
  const slides: BannerSlide[] = [
    {
      id: 'referral_bonus',
      titleTopBn: 'বন্ধুকে রেফার করে',
      titleMidBn: 'জিতে নিন',
      titleHighlightBn: '১০% রেফার বোনাস',
      domain: 'www.fb88baji.com',
      taglineBn: 'আপনার বিশ্বস্ত সঙ্গী',
      buttonBn: 'এখনই রেফার করুন >>',
      action: 'referral',
      image: '/src/assets/images/emerald_hero_banner_1795513857403.jpg',
    },
    isLoggedIn
      ? {
          id: 'deposit_bonus',
          titleTopBn: 'প্রথম ডিপোজিটে পান',
          titleMidBn: 'সর্বোচ্চ বোনাস',
          titleHighlightBn: '২০০% মেগা ক্যাশব্যাক',
          domain: 'www.fb88baji.com',
          taglineBn: 'ইনস্ট্যান্ট ডিপোজিট ও উইথড্রয়াল',
          buttonBn: 'এখনই ডিপোজিট করুন >>',
          action: 'deposit',
          image: '/src/assets/images/promo_deposit_emerald_1795513858968.jpg',
        }
      : {
          id: 'welcome_bonus',
          titleTopBn: 'নতুন মেম্বারদের জন্য',
          titleMidBn: 'আকর্ষণীয় অফার',
          titleHighlightBn: '২০০% ওয়েলকাম বোনাস',
          domain: 'www.fb88baji.com',
          taglineBn: 'গেম খেলতে ও অফার পেতে সাইন আপ করুন',
          buttonBn: 'এখনই সাইন আপ করুন >>',
          action: 'register',
          image: '/src/assets/images/promo_vip_emerald_1795513857101.jpg',
        },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-[#c8ebd6] bg-[#04361d] select-none group">
      <div className="relative w-full aspect-[21/9] min-h-[210px] sm:min-h-[270px] md:min-h-[330px] flex items-center overflow-hidden">
        <img
          src={slide.image}
          alt="Fb88baji Promotional Banner"
          className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
        />

        {/* Deep Emerald Scrim for sharp Bengali/English readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#032b18]/92 via-[#064a28]/72 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 py-5 flex flex-col justify-center items-start space-y-1.5 sm:space-y-2.5 max-w-xl md:max-w-2xl">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 text-sm sm:text-base md:text-xl">👑</span>
              <h3 className="text-white text-base sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow">
                {slide.titleTopBn}
              </h3>
            </div>

            <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#86efac] italic tracking-tight drop-shadow">
              {slide.titleMidBn}
            </div>

            <div className="text-2xl sm:text-4xl md:text-5xl font-black text-[#fde047] tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">
              {slide.titleHighlightBn}
            </div>
          </div>

          <div className="space-y-0.5 pt-0.5">
            <div className="text-white font-mono font-black text-xs sm:text-base tracking-wider drop-shadow">
              {slide.domain}
            </div>
            <div className="text-emerald-100 text-[11px] sm:text-sm font-bold drop-shadow">
              {slide.taglineBn}
            </div>
          </div>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => onBannerAction(slide.action)}
              className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#22c55e] to-[#00994d] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg active:scale-95 transition cursor-pointer flex items-center gap-2 border border-white/30"
            >
              <span>{slide.buttonBn}</span>
            </button>
          </div>

          <div className="pt-1 text-[10px] sm:text-xs text-emerald-100/85 font-semibold drop-shadow">
            ১৮+ | দায়িত্বের সাথে খেলুন
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-2 sm:left-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition backdrop-blur-xs opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-2 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition backdrop-blur-xs opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-6 bg-[#4ade80]' : 'w-2 bg-white/45 hover:bg-white/75'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
