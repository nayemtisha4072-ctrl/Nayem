/**
 * Category Navigation Bar Component
 * Clean white/mint category cards with emerald green active pill states.
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
  { id: 'hot', label: 'HOT', icon: Flame, iconColor: 'text-emerald-600' },
  { id: 'sports', label: 'Sports', icon: Trophy, iconColor: 'text-emerald-600' },
  { id: 'live', label: 'Casino', icon: Spade, iconColor: 'text-emerald-600' },
  { id: 'slots', label: 'Slots', icon: Sparkles, iconColor: 'text-emerald-600' },
  { id: 'crash', label: 'Crash', icon: Rocket, iconColor: 'text-emerald-600' },
  { id: 'table', label: 'Table', icon: Layers, iconColor: 'text-emerald-600' },
  { id: 'fish', label: 'Fishing', icon: Fish, iconColor: 'text-emerald-600' },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2, iconColor: 'text-emerald-600' },
  { id: 'lotto', label: 'Lotto', icon: CircleDot, iconColor: 'text-emerald-600' },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  return (
    <div className="relative w-full py-0.5">
      <div className="w-full overflow-x-auto no-scrollbar py-1.5 touch-pan-x overscroll-x-contain">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-max px-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = currentTab === cat.id;
            const Icon = cat.icon;

            return (
              <div key={cat.id} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setCurrentTab(cat.id)}
                  className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] h-15 sm:h-17 px-3 py-2 rounded-2xl transition-all select-none cursor-pointer transform active:scale-95 ${
                    isActive
                      ? 'bangla-pill-btn-active scale-[1.03] text-white'
                      : 'bangla-pill-btn text-[#182620]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${
                      isActive ? 'text-white' : cat.iconColor || 'text-[#059669]'
                    }`}
                  />
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider leading-none">
                    {cat.label}
                  </span>
                </button>

                {isActive && (
                  <div className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#008f4a] mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
