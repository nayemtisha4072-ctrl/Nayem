/**
 * Dynamic Slot Providers Grid Component
 * - Renders ONLY providers that actually exist in imported/connected slot games.
 * - Zero hardcoded third-party company names or cards.
 */

import React, { useMemo } from 'react';
import { Gamepad2 } from 'lucide-react';
import { GameItem } from '../types';

interface SlotProvidersGridProps {
  games: GameItem[];
  selectedProvider: string;
  onSelectProvider: (providerId: string) => void;
}

export const SlotProvidersGrid: React.FC<SlotProvidersGridProps> = ({
  games,
  selectedProvider,
  onSelectProvider,
}) => {
  const slotProviders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of games) {
      if (g.category === 'slots' && g.isAvailable !== false && g.provider) {
        const key = g.provider.trim();
        if (key) counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([name, count]) => ({
      id: name.toLowerCase(),
      name,
      count,
    }));
  }, [games]);

  if (slotProviders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-[#ff2b88]" />
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
            SLOTS PROVIDERS
          </h2>
        </div>
        {selectedProvider !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectProvider('all')}
            className="px-3 py-1 rounded-xl bg-[#520024] hover:bg-[#6e0030] text-amber-300 text-xs font-bold transition cursor-pointer"
          >
            সবগুলো দেখুন (View All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {slotProviders.map((provider) => {
          const isSelected = selectedProvider === provider.id;

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onSelectProvider(isSelected ? 'all' : provider.id)}
              className={`flex flex-col items-center justify-center py-5 px-4 rounded-2xl transition-all cursor-pointer transform active:scale-95 border ${
                isSelected
                  ? 'bg-[#c20054] border-[#ff4797] shadow-xl shadow-black/50 scale-[1.02] ring-2 ring-amber-400'
                  : 'bg-[#940040] hover:bg-[#a80048] border-[#cf005c]/70 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="h-9 flex items-center justify-center text-amber-300">
                <Gamepad2 className="w-7 h-7" />
              </div>

              <span className="mt-2 text-xs sm:text-sm font-black text-white tracking-wider flex items-center gap-1">
                {provider.name}
                {isSelected && <span className="text-amber-300 text-[10px]">●</span>}
              </span>
              <span className="text-[10px] text-rose-200/80 font-mono mt-0.5">
                {provider.count} Games
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
