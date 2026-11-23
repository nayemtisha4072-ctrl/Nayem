/**
 * Category Navigation Bar Component for Banglabaji
 * Matches Screenshot_6 & Screenshot_11:
 * - 3D glossy beveled magenta buttons:
 *   - HOT (Fire icon)
 *   - Sports (Soccer ball icon)
 *   - Casino (Spade icon)
 *   - Slots (7 icon)
 *   - Crash (Rocket icon)
 *   - Table (Roulette / Table icon)
 *   - Fishing (Fish icon)
 *   - Arcade (Gamepad icon)
 *   - Lotto (8-ball icon)
 * - Small indicator triangle underneath active category (as seen in Screenshot_11 for Slots)
 */

import React from 'react';
import {
  Flame,
  Trophy,
  Spade,
  Sparkles,
  Rocket,
  Layers,
  Fish,
  Gamepad2,
  CircleDot,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface CategoryNavProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  lang: 'bn' | 'en';
}

interface CategoryDef {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'hot', label: 'HOT', icon: Flame, iconColor: 'text-amber-400' },
  { id: 'sports', label: 'Sports', icon: Trophy, iconColor: 'text-amber-300' },
  { id: 'live', label: 'Casino', icon: Spade, iconColor: 'text-amber-200' },
  { id: 'slots', label: 'Slots', icon: Sparkles, iconColor: 'text-amber-400' },
  { id: 'crash', label: 'Crash', icon: Rocket, iconColor: 'text-amber-300' },
  { id: 'table', label: 'Table', icon: Layers, iconColor: 'text-amber-200' },
  { id: 'fish', label: 'Fishing', icon: Fish, iconColor: 'text-amber-300' },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2, iconColor: 'text-amber-400' },
  { id: 'lotto', label: 'Lotto', icon: CircleDot, iconColor: 'text-amber-300' },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  currentTab,
  setCurrentTab,
  lang,
}) => {
  return (
    <div className="relative w-full py-1">
      {/* Scrollable Container */}
      <div className="w-full overflow-x-auto no-scrollbar py-2 touch-pan-x overscroll-x-contain">
        <div className="flex items-center gap-2 sm:gap-3 min-w-max px-1">
          {CATEGORIES.map((cat) => {
            const isActive = currentTab === cat.id;
            const Icon = cat.icon;

            return (
              <div key={cat.id} className="relative flex flex-col items-center">
                <button
                  onClick={() => setCurrentTab(cat.id)}
                  className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[86px] h-16 sm:h-18 px-3 py-2 rounded-2xl transition-all select-none cursor-pointer transform active:scale-95 ${
                    isActive
                      ? 'bangla-pill-btn-active scale-[1.03] text-white shadow-lg shadow-black/40'
                      : 'bangla-pill-btn text-rose-100/90 hover:brightness-110'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${
                      isActive ? 'text-amber-300 fill-amber-400/20' : cat.iconColor || 'text-rose-200'
                    }`}
                  />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider leading-none">
                    {cat.label}
                  </span>
                </button>

                {/* Active Indicator Triangle Underneath (Matches Screenshot_11) */}
                {isActive && (
                  <div className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#0e2a22] mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
