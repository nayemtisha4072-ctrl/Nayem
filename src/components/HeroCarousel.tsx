/**
 * Hero Carousel Component for Banglabaji
 * Matches Screenshot_6:
 * - High-res luxury promotional banner with model in pink traditional dress, gold coins, playing cards & dice
 * - "বন্ধুকে রেফার করে জিতে নিন ১০% রেফার বোনাস"
 * - "www.banglabaji77.com" & "আপনার বিশ্বস্ত সঙ্গী"
 * - Golden pill CTA button: "এখনই রেফার করুন >>"
 * - Legal disclaimer: "১৮+ | দায়িত্বের সাথে খেলুন"
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';

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

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onBannerAction, lang, isLoggedIn = false }) => {
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
      image: '/src/assets/images/banglabaji_hero_banner_1790153363623.jpg',
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
          image: '/src/assets/images/banglabaji_hero_banner_1790153363623.jpg',
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
          image: '/src/assets/images/banglabaji_hero_banner_1790153363623.jpg',
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
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-[#940040] bg-[#42001c] select-none">
      {/* Banner Container */}
      <div className="relative w-full aspect-[21/9] min-h-[220px] sm:min-h-[280px] md:min-h-[340px] flex items-center overflow-hidden">
        {/* Background Image */}
        <img
          src={slide.image}
          alt="Banglabaji Banner"
          className="absolute inset-0 w-full h-full object-cover object-right sm:object-center transform transition-transform duration-700 hover:scale-105"
        />

        {/* Darkening & Magenta Overlay to ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4d0023]/95 via-[#5c0029]/75 to-transparent pointer-events-none" />

        {/* Text Content Overlay (Matches Screenshot_6) */}
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 py-6 flex flex-col justify-center items-start space-y-2 sm:space-y-3 max-w-xl md:max-w-2xl">
          {/* Headline cluster */}
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-sm sm:text-base md:text-xl">👑</span>
              <h3 className="text-white text-base sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {slide.titleTopBn}
              </h3>
            </div>

            <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-amber-300 italic tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {slide.titleMidBn}
            </div>

            <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#FFDF6D] tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]">
              {slide.titleHighlightBn}
            </div>
          </div>

          {/* Domain & Tagline */}
          <div className="space-y-0.5 pt-1">
            <div className="text-white font-mono font-black text-xs sm:text-base md:text-lg tracking-wider drop-shadow">
              {slide.domain}
            </div>
            <div className="text-rose-200 text-[11px] sm:text-sm font-bold drop-shadow">
              {slide.taglineBn}
            </div>
          </div>

          {/* CTA Gold Button (Matches Screenshot_6) */}
          <div className="pt-2">
            <button
              onClick={() => onBannerAction(slide.action)}
              className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full gold-accent-btn font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2 border border-amber-300"
            >
              <span>{slide.buttonBn}</span>
            </button>
          </div>

          {/* Responsible Gaming Badge at bottom of banner */}
          <div className="pt-2 text-[10px] sm:text-xs text-rose-200/80 font-semibold drop-shadow">
            ১৮+ | দায়িত্বের সাথে খেলুন
          </div>
        </div>

        {/* Left / Right Arrow Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-2 sm:left-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-xs opacity-0 hover:opacity-100 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-2 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-xs opacity-0 hover:opacity-100 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots / Bars (Matches Screenshot_6) */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
