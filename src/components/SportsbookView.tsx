/**
 * Sportsbook View Component for fb88baji
 * Live events, real-time markets, and interactive bet slip with odds fluctuation protection
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  Sliders,
  Shield,
} from 'lucide-react';
import { SportsEvent, Bet, User, Wallet } from '../types';

interface SportsbookViewProps {
  user: User | null;
  wallet: Wallet | null;
  onRefreshWallet: () => void;
  lang: 'bn' | 'en';
}

export const SportsbookView: React.FC<SportsbookViewProps> = ({
  user,
  wallet,
  onRefreshWallet,
  lang,
}) => {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedSport, setSelectedSport] = useState<'all' | 'cricket' | 'football' | 'tennis'>('all');
  const [activeTab, setActiveTab] = useState<'fixtures' | 'history'>('fixtures');

  // Bet Slip selection
  const [selectedBet, setSelectedBet] = useState<{
    event: SportsEvent;
    marketId: string;
    marketName: string;
    selectionId: string;
    selectionName: string;
    odds: number;
  } | null>(null);

  const [stakeTk, setStakeTk] = useState<number>(200);
  const [oddsChangedConsent, setOddsChangedConsent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [slipFeedback, setSlipFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/v1/sports/events');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBets = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/v1/sports/bets', {
        headers: { Authorization: user.sessionToken ? `Bearer ${user.sessionToken}` : '' },
      });
      const data = await res.json();
      if (data.bets) setBets(data.bets);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchBets();
    const interval = setInterval(fetchEvents, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredEvents = events.filter((e) =>
    selectedSport === 'all' ? true : e.sport === selectedSport
  );

  const handleSelectOdd = (
    event: SportsEvent,
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    odds: number
  ) => {
    setSelectedBet({
      event,
      marketId,
      marketName,
      selectionId,
      selectionName,
      odds,
    });
    setSlipFeedback(null);
  };

  const handlePlaceBet = async () => {
    if (!user) {
      setSlipFeedback({
        type: 'error',
        message: lang === 'bn' ? 'বাজি ধরতে অনুগ্রহ করে প্রথমে লগইন করুন।' : 'Please log in first to place a bet.',
      });
      return;
    }
    if (!selectedBet) return;

    setSubmitting(true);
    setSlipFeedback(null);

    try {
      const res = await fetch('/api/v1/sports/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.sessionToken ? `Bearer ${user.sessionToken}` : '',
        },
        body: JSON.stringify({
          eventId: selectedBet.event.id,
          marketId: selectedBet.marketId,
          selectionId: selectedBet.selectionId,
          stakeTk,
          submittedOdds: selectedBet.odds,
          oddsChangedConsent,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setSlipFeedback({ type: 'error', message: data.error || 'Failed to place bet' });
        if (data.currentOdds) {
          setSelectedBet({ ...selectedBet, odds: data.currentOdds });
        }
        return;
      }

      setSlipFeedback({
        type: 'success',
        message: lang === 'bn' ? 'বাজি নিশ্চিত করা হয়েছে!' : 'Bet placed successfully!',
      });
      onRefreshWallet();
      fetchBets();
    } catch (err: any) {
      setSubmitting(false);
      setSlipFeedback({ type: 'error', message: err.message });
    }
  };

  const availableTk = (wallet?.availablePaisa || 0) / 100;
  const potentialReturnTk = selectedBet ? Math.round(stakeTk * selectedBet.odds) : 0;

  return (
    <div className="space-y-6">
      {/* Top Sports Navigation & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#dceee3] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto touch-pan-x pb-1 sm:pb-0">
          {(['all', 'cricket', 'football', 'tennis'] as const).map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                selectedSport === sport
                  ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow'
                  : 'bg-[#f4fbf7] hover:bg-[#eaf8f0] text-[#182620] border border-[#dceee3]'
              }`}
            >
              {sport === 'all'
                ? lang === 'bn'
                  ? 'সব ম্যাচ'
                  : 'All Sports'
                : sport === 'cricket'
                ? '🏏 ক্রিকেট'
                : sport === 'football'
                ? '⚽ ফুটবল'
                : '🎾 টেনিস'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'fixtures'
                ? 'bg-[#00a859] text-white'
                : 'text-[#4a6b5a] hover:bg-[#eaf8f0]'
            }`}
          >
            {lang === 'bn' ? 'লাইভ ও আপকামিং' : 'Live & Upcoming'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#00a859] text-white'
                : 'text-[#4a6b5a] hover:bg-[#eaf8f0]'
            }`}
          >
            {lang === 'bn' ? `বাজির ইতিহাস (${bets.length})` : `My Bets (${bets.length})`}
          </button>
        </div>
      </div>

      {/* Main Layout: Match List + Right Bet Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Match Fixtures or Bet History */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'fixtures' ? (
            filteredEvents.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#dceee3] rounded-2xl space-y-2 shadow-xs">
                <Trophy className="w-10 h-10 mx-auto text-[#00a859]" />
                <h3 className="text-sm font-black text-[#182620]">
                  {lang === 'bn'
                    ? 'কোনো স্পোর্টস ইভেন্ট বা API এখনো যুক্ত করা হয়নি'
                    : 'No Sports Events Connected Yet'}
                </h3>
                <p className="text-xs text-[#4a6b5a] max-w-md mx-auto">
                  {lang === 'bn'
                    ? 'লাইভ স্পোর্টস API সংযুক্ত হলে এখানে রিয়েল-টাইম ম্যাচ এবং অডস প্রদর্শিত হবে।'
                    : 'Live matches and odds will appear here once external sports feeds are connected.'}
                </p>
              </div>
            ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white border border-[#dceee3] rounded-2xl overflow-hidden shadow-xs hover:border-[#00a859]/50 transition"
              >
                {/* Event Header */}
                <div className="p-3 sm:p-4 bg-[#f4fbf7] border-b border-[#e5f3eb] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#059669] uppercase tracking-wider">
                      {evt.league}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {evt.status === 'LIVE' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-extrabold animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        LIVE ({evt.currentOverOrMin})
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#4a6b5a] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {evt.startTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Teams & Live Score */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base font-extrabold text-[#182620] flex items-center gap-2">
                        <span>{evt.homeTeam}</span>
                        {evt.scoreHome && (
                          <span className="text-xs font-mono text-[#059669] bg-[#eaf8f0] px-2 py-0.5 rounded">
                            {evt.scoreHome}
                          </span>
                        )}
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#182620] flex items-center gap-2">
                        <span>{evt.awayTeam}</span>
                        {evt.scoreAway && (
                          <span className="text-xs font-mono text-[#059669] bg-[#eaf8f0] px-2 py-0.5 rounded">
                            {evt.scoreAway}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Markets and Selections */}
                  <div className="space-y-3 pt-2">
                    {evt.markets.map((mkt) => (
                      <div key={mkt.id} className="space-y-1.5">
                        <div className="text-xs text-[#4a6b5a] font-medium flex items-center justify-between">
                          <span>{mkt.name}</span>
                          <span className="text-[10px] text-[#618270] uppercase">{mkt.status}</span>
                        </div>

                        {/* Odds Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {mkt.selections.map((sel) => {
                            const isSelected =
                              selectedBet?.event.id === evt.id &&
                              selectedBet?.marketId === mkt.id &&
                              selectedBet?.selectionId === sel.id;

                            return (
                              <button
                                key={sel.id}
                                onClick={() =>
                                  handleSelectOdd(
                                    evt,
                                    mkt.id,
                                    mkt.name,
                                    sel.id,
                                    sel.name,
                                    sel.odds
                                  )
                                }
                                className={`p-2 rounded-xl flex items-center justify-between border transition text-left cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#00a859] text-white font-bold border-[#00994d] shadow-md'
                                    : 'bg-[#f4fbf7] hover:bg-[#e5f6ec] text-[#182620] border-[#cde8d8]'
                                }`}
                              >
                                <span className="text-xs truncate mr-1">{sel.name}</span>
                                <span
                                  className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                    isSelected
                                      ? 'bg-white text-[#059669]'
                                      : 'bg-white text-[#00a859] border border-[#dceee3]'
                                  }`}
                                >
                                  {sel.odds.toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
            )
          ) : (
            /* Bets History View */
            <div className="space-y-3">
              {bets.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#dceee3] text-[#4a6b5a] text-xs">
                  কোনো বাজি খুঁজে পাওয়া যায়নি (No placed bets yet).
                </div>
              ) : (
                bets.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white border border-[#dceee3] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="text-xs text-[#059669] font-bold">{b.eventName}</div>
                      <div className="text-sm font-extrabold text-[#182620] mt-0.5">
                        {b.selectionName} ({b.marketName})
                      </div>
                      <div className="text-[11px] text-[#4a6b5a] font-mono mt-1">
                        Odds: {b.acceptedOdds.toFixed(2)} • Placed:{' '}
                        {new Date(b.placedAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          b.status === 'WON'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'LOST'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                      <div className="text-xs text-[#4a6b5a]">
                        Stake: <span className="font-bold text-[#182620]">৳{b.stakePaisa / 100}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Interactive Bet Slip */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-[#dceee3] rounded-3xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8f4ed]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#00a859]" />
                <h3 className="font-extrabold text-sm text-[#182620]">
                  {lang === 'bn' ? 'বেট স্লিপ (Bet Slip)' : 'Bet Slip'}
                </h3>
              </div>
              {selectedBet && (
                <button
                  onClick={() => setSelectedBet(null)}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  {lang === 'bn' ? 'মুছে ফেলুন' : 'Clear'}
                </button>
              )}
            </div>

            {selectedBet ? (
              <div className="space-y-4">
                {/* Selected Match Card */}
                <div className="p-3 rounded-2xl bg-[#f4fbf7] border border-[#dceee3] space-y-1">
                  <div className="text-[11px] text-[#4a6b5a] truncate">
                    {selectedBet.event.homeTeam} vs {selectedBet.event.awayTeam}
                  </div>
                  <div className="text-xs font-bold text-[#182620] flex items-center justify-between">
                    <span>{selectedBet.selectionName}</span>
                    <span className="font-mono text-[#00a859] font-extrabold text-sm">
                      {selectedBet.odds.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#618270]">{selectedBet.marketName}</div>
                </div>

                {/* Stake Presets & Input */}
                <div className="space-y-2">
                  <label className="text-xs text-[#4a6b5a] block font-medium">
                    {lang === 'bn' ? 'স্টেক (বাজির পরিমাণ ৳):' : 'Stake Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={stakeTk}
                    onChange={(e) => setStakeTk(Math.max(10, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-full bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] font-mono font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a859]"
                  />

                  {/* Quick Stake Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[100, 200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setStakeTk(amt)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          stakeTk === amt
                            ? 'bg-[#00a859] text-white'
                            : 'bg-[#f4fbf7] border border-[#dceee3] text-[#4a6b5a] hover:text-[#182620]'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Potential Return Display */}
                <div className="p-3 rounded-2xl bg-[#eaf8f0] border border-[#bce6ce] flex items-center justify-between text-xs">
                  <span className="text-[#4a6b5a]">{lang === 'bn' ? 'সম্ভাব্য রিটার্ন:' : 'Potential Return:'}</span>
                  <span className="font-extrabold font-mono text-[#059669] text-sm">
                    ৳{potentialReturnTk.toLocaleString()}
                  </span>
                </div>

                {/* Odds Fluctuations Auto-Accept Consent Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="oddsConsent"
                    checked={oddsChangedConsent}
                    onChange={(e) => setOddsChangedConsent(e.target.checked)}
                    className="mt-0.5 rounded border-emerald-300 text-[#00a859] focus:ring-[#00a859] accent-[#00a859]"
                  />
                  <label htmlFor="oddsConsent" className="text-[11px] text-[#4a6b5a] leading-tight">
                    {lang === 'bn'
                      ? 'অডস পরিবর্তন হলে স্বয়ংক্রিয়ভাবে গ্রহণ করুন (Accept odds changes automatically)'
                      : 'Accept odds changes automatically'}
                  </label>
                </div>

                {/* Submit Feedback Message */}
                {slipFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      slipFeedback.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-700'
                    }`}
                  >
                    {slipFeedback.message}
                  </div>
                )}

                {/* Place Bet CTA */}
                <button
                  onClick={handlePlaceBet}
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-black text-sm shadow-lg shadow-emerald-900/15 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? lang === 'bn'
                        ? 'সাবমিট হচ্ছে...'
                        : 'Submitting...'
                      : lang === 'bn'
                      ? `বাজি নিশ্চিত করুন (৳${stakeTk})`
                      : `Place Bet (৳${stakeTk})`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-[#618270] space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-[#9dcab2]" />
                <p className="text-xs">
                  {lang === 'bn'
                    ? 'কোনো বাজি নির্বাচিত হয়নি। ম্যাচের যেকোনো অডস নির্বাচন করে স্লিপে যুক্ত করুন।'
                    : 'Select odds from any match to add to your bet slip.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
