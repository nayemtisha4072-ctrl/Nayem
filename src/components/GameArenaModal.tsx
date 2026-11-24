/**
 * Fb88baji Official Game Arena Modal
 * - For Aviator Crash: Renders the Launch Card -> Full Real-Time WebSocket AviatorCrashGame
 * - For Online API-Imported / Admin-Added Real Games: Launches the verified external provider iframe
 * - Strictly requires authenticated real player session
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Coins,
  ShieldCheck,
  Loader2,
  PlusCircle,
  Lock,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { GameItem, Wallet, User } from '../types';
import { AviatorCrashGame } from './AviatorCrashGame';

interface GameArenaModalProps {
  game: GameItem;
  wallet: Wallet | null;
  user: User | null;
  initialMode?: 'real' | 'demo';
  onClose: () => void;
  onRefreshWallet: (updatedWallet?: Wallet) => void;
  onOpenDeposit?: () => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  lang: 'bn' | 'en';
}

export const GameArenaModal: React.FC<GameArenaModalProps> = ({
  game,
  wallet,
  user,
  onClose,
  onRefreshWallet,
  onOpenDeposit,
  onOpenAuth,
  lang,
}) => {
  const isAviatorCrash =
    game.id === 'aviator_crash' ||
    game.id === 'dst_spribe_aviator' ||
    (game.category === 'crash' && !game.realLaunchUrl);

  // For Aviator, show launch sheet first unless external launchUrl iframe is forced
  const [aviatorLaunched, setAviatorLaunched] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [launchUrl, setLaunchUrl] = useState<string>(game.realLaunchUrl || '');
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(!isAviatorCrash);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || isAviatorCrash) {
      setIsLoadingSession(false);
      return;
    }

    let isMounted = true;
    setIsLoadingSession(true);
    setSessionError(null);

    const initExternalSession = async () => {
      try {
        const token = user?.sessionToken || localStorage.getItem('fb88_user_token');
        const res = await fetch('/api/v1/games/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            gameId: game.id,
            playMode: 'real',
            lang,
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (!res.ok) {
          setSessionError(data.error || 'Failed to start external game session');
        } else {
          const resolvedUrl = data.launchUrl || game.realLaunchUrl || '';
          setLaunchUrl(resolvedUrl);
          if (!resolvedUrl && data.externalLaunchError) {
            setSessionError(data.externalLaunchError);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setSessionError(err?.message || 'Network error launching external game');
        }
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    };

    initExternalSession();
    return () => {
      isMounted = false;
    };
  }, [game.id, game.realLaunchUrl, isAviatorCrash, user, lang]);

  // Strict Authentication Guard
  if (!user) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white border border-[#cde8d8] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#eaf8f0] hover:bg-[#d5f2e1] text-[#059669] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#eaf8f0] border-2 border-[#00a859] mx-auto flex items-center justify-center text-[#00a859] shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-[#182620]">
              {lang === 'bn' ? 'সাইন আপ ও লগইন আবশ্যক' : 'Sign Up & Login Required'}
            </h3>
            <p className="text-xs sm:text-sm text-[#4a6b5a] leading-relaxed">
              {lang === 'bn'
                ? 'গেম খেলতে ও আসল বাজি ধরতে অনুগ্রহ করে প্রথমে সাইন আপ করে লগইন করুন।'
                : 'Please sign up or log in to launch games.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] font-black text-white text-xs shadow-md active:scale-95 transition cursor-pointer"
            >
              {lang === 'bn' ? 'রেজিস্ট্রেশন করুন' : 'Register Now'}
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth?.('login')}
              className="flex-1 py-3 rounded-xl bg-[#f4fbf7] hover:bg-[#eaf8f0] border border-[#bde6cf] font-bold text-[#059669] text-xs shadow-2xs active:scale-95 transition cursor-pointer"
            >
              {lang === 'bn' ? 'লগইন করুন' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Aviator Launch Sheet (Screenshot 1) -> Full Real-Time WebSocket AviatorCrashGame (Screenshots 2, 3, 4)
  if (isAviatorCrash) {
    if (aviatorLaunched) {
      return (
        <AviatorCrashGame
          user={user}
          wallet={wallet}
          onRefreshWallet={onRefreshWallet}
          onOpenDeposit={onOpenDeposit}
          onClose={onClose}
          lang={lang}
        />
      );
    }

    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-md bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 pt-6 relative animate-in slide-in-from-bottom-6 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top-right Circular Close Button (Matching Screenshot 1) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-3.5 right-4 w-9 h-9 rounded-full bg-[#3f371a] hover:bg-[#2a2410] border-2 border-white text-white shadow-lg flex items-center justify-center cursor-pointer transition"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Game Thumbnail + Title */}
          <div className="flex items-start gap-4 mb-6">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-28 h-28 sm:w-32 sm:h-32 -mt-12 rounded-2xl object-cover border-2 border-[#00a859]/80 shadow-2xl bg-[#111]"
            />
            <div className="pt-0.5 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-[#182620] leading-tight">
                {game.provider || 'Crash Live'}
              </div>
              <div className="text-sm sm:text-base font-medium text-[#4a6b5a] mt-0.5">
                {game.title}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] bg-[#eaf8f0] border border-[#bce6ce] px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00a859]" />
                <span>Real-Time Multiplayer • BDT</span>
              </div>
            </div>
          </div>

          {/* Full-Width Bright Emerald "Play" Button */}
          <button
            type="button"
            onClick={() => setAviatorLaunched(true)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 active:scale-[0.99] text-white font-bold text-base sm:text-lg shadow-md shadow-emerald-900/15 transition cursor-pointer"
          >
            Play
          </button>
        </div>
      </div>
    );
  }

  // External Online API / Admin-Added Real Game Iframe Container
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const realBalanceTk = wallet ? (wallet.availablePaisa / 100).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-3 bg-black/90 backdrop-blur-md">
      <div
        ref={containerRef}
        className="w-full h-full sm:h-[94vh] sm:max-w-6xl bg-[#111] sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-3 sm:px-4 py-2 bg-[#1b1c1d] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-8 h-8 rounded-lg object-cover border border-white/15 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-white truncate">{game.title}</div>
              <div className="text-[10px] text-emerald-400 font-medium">{game.provider} • Live API</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-[#28a909]">৳{realBalanceTk}</span>
              {onOpenDeposit && (
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="p-0.5 rounded bg-amber-400 text-slate-950 cursor-pointer"
                  title="Deposit"
                >
                  <PlusCircle className="w-3 h-3" />
                </button>
              )}
            </div>

            {launchUrl && (
              <a
                href={launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title={lang === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open in New Tab'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন ট্যাব' : 'New Tab'}</span>
              </a>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-black relative flex flex-col">
          {isLoadingSession ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              <p className="text-sm text-zinc-300 font-medium">
                {lang === 'bn' ? 'রিয়েল API গেম সেশন চালু হচ্ছে...' : 'Connecting to real provider API...'}
              </p>
            </div>
          ) : sessionError || !launchUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <h4 className="text-base font-bold text-white">
                {lang === 'bn' ? 'প্রোভাইডার লঞ্চ URL প্রয়োজন' : 'Provider Launch URL Required'}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {sessionError ||
                  (lang === 'bn'
                    ? 'এই গেমটির জন্য লাইভ প্রোভাইডার Launch URL / API সংযোগ কনফিগার করা প্রয়োজন।'
                    : 'A valid external provider Launch URL or API endpoint is required to launch this game.')}
              </p>
            </div>
          ) : (
            <iframe
              src={launchUrl}
              title={game.title}
              className="w-full h-full border-0 flex-1 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            />
          )}
        </div>
      </div>
    </div>
  );
};
