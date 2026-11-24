/**
 * Dynamic Slot Providers Grid Component
 * - Renders ONLY providers that actually exist in imported/connected slot games.
 * - Styled in crisp white & emerald green.
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
          <span className="w-1.5 h-4 rounded-full bg-[#00a859]" />
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#182620]">
            SLOTS PROVIDERS
          </h2>
        </div>
        {selectedProvider !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectProvider('all')}
            className="px-3 py-1 rounded-xl bg-[#eaf8f0] hover:bg-[#d8f3e4] text-[#059669] text-xs font-bold transition cursor-pointer"
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
                  ? 'bg-gradient-to-br from-[#19c36e] to-[#00994d] border-[#008f4a] text-white shadow-md scale-[1.02]'
                  : 'bg-white hover:bg-[#f4fbf7] border-[#dceee3] text-[#182620] shadow-xs hover:shadow-sm'
              }`}
            >
              <div className={`h-9 flex items-center justify-center ${isSelected ? 'text-white' : 'text-[#059669]'}`}>
                <Gamepad2 className="w-7 h-7" />
              </div>

              <span className="mt-2 text-xs sm:text-sm font-black tracking-wider flex items-center gap-1">
                {provider.name}
                {isSelected && <span className="text-amber-300 text-[10px]">●</span>}
              </span>
              <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-emerald-50' : 'text-[#527060]'}`}>
                {provider.count} Games
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
