/**
 * Game Card Component for Banglabaji
 * Real Money Play & Free Demo Play Mode
 */

import React, { useState } from 'react';
import { Play, Heart, Flame, ShieldAlert, Sparkles, Gamepad2, Lock } from 'lucide-react';
import { GameItem } from '../types';

interface GameCardProps {
  game: GameItem;
  onPlay: (game: GameItem, mode: 'real' | 'demo') => void;
  lang: 'bn' | 'en';
  isLoggedIn?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, lang, isLoggedIn = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group relative bg-[#7a0033] border border-[#9e0046] rounded-2xl overflow-hidden shadow-lg hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail Area */}
      <div
        onClick={() => game.isAvailable && onPlay(game, 'real')}
        className="relative aspect-4/3 w-full overflow-hidden bg-[#570024] cursor-pointer"
      >
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#570024] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {game.isHot && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e00062] text-white text-[10px] font-extrabold tracking-wider shadow">
                <Flame className="w-3 h-3" />
                HOT
              </span>
            )}
            {game.isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-extrabold tracking-wider shadow animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                LIVE
              </span>
            )}
          </div>

          {/* Favorite Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="pointer-events-auto p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer"
            aria-label="Add to favorites"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
              }`}
            />
          </button>
        </div>

        {/* Hover Action Overlay: Sleek Natural Play Button */}
        {game.isAvailable ? (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 z-20">
            {/* Real Play Button */}
            <button
              onClick={() => onPlay(game, 'real')}
              className="w-full max-w-[140px] py-2.5 rounded-xl gold-accent-btn font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition cursor-pointer text-slate-950"
              title={lang === 'bn' ? 'গেম খেলুন' : 'Play Game'}
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{lang === 'bn' ? 'প্লে করুন' : 'Play Now'}</span>
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
            <ShieldAlert className="w-7 h-7 text-amber-400 mb-1" />
            <span className="text-xs font-bold text-white">
              {lang === 'bn' ? 'সাময়িক স্থগিত' : 'Temporarily Offline'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 leading-tight">
              {game.availabilityReason || 'Compliance review'}
            </span>
          </div>
        )}
      </div>

      {/* Info Card Footer */}
      <div className="p-2.5 sm:p-3 bg-[#69002c] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-rose-200/80 font-medium">
          <span className="truncate max-w-[110px] font-bold text-amber-300/90">{game.provider}</span>
          <span className="text-rose-200 font-mono text-[10px]">RTP {game.rtp}</span>
        </div>

        <h2 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
          {lang === 'bn' ? game.titleBn || game.title : game.title}
        </h2>

        {/* Quick Play Trigger for Mobile Screens */}
        <div className="pt-1 flex items-center sm:hidden">
          <button
            onClick={() => onPlay(game, 'real')}
            className="w-full py-1.5 rounded-lg gold-accent-btn font-black text-xs text-slate-950 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <Play className="w-3 h-3 fill-slate-950 text-slate-950" />
            <span>{lang === 'bn' ? 'প্লে করুন' : 'Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
