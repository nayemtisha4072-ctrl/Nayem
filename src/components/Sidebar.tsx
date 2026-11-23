/**
 * Sidebar Component for Banglabaji
 * Matches Screenshot_6 & Screenshot_10:
 * - Rich Magenta background (#820037)
 * - Navigation links with icons:
 *   - Home
 *   - Sports (v)
 *   - Casino (v)
 *   - Slots (v)
 *   - Table (v)
 *   - Crash (v)
 *   - Fishing (v)
 *   - Arcade (v)
 *   - Lotto (v)
 *   - Promotions
 * - Collapsed slim icon strip matches Screenshot_10
 */

import React from 'react';
import {
  Home,
  Trophy,
  Spade,
  Sparkles,
  Gamepad2,
  Rocket,
  Fish,
  Layers,
  CircleDot,
  Gift,
  ChevronDown,
  ChevronRight,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { GameCategory } from '../types';

export type NavTab =
  | GameCategory
  | 'hot'
  | 'table'
  | 'crash'
  | 'arcade'
  | 'lotto';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  expanded: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userRole?: string;
  lang: 'bn' | 'en';
  setLang?: (lang: 'bn' | 'en') => void;
}

interface NavItemDef {
  id: NavTab;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
}

export const NAV_ITEMS: NavItemDef[] = [
  { id: 'hot', title: 'Home', icon: Home },
  { id: 'sports', title: 'Sports', icon: Trophy, hasSubmenu: true },
  { id: 'live', title: 'Casino', icon: Spade, hasSubmenu: true },
  { id: 'slots', title: 'Slots', icon: Sparkles, hasSubmenu: true },
  { id: 'table', title: 'Table', icon: Layers, hasSubmenu: true },
  { id: 'crash', title: 'Crash', icon: Rocket, hasSubmenu: true },
  { id: 'fish', title: 'Fishing', icon: Fish, hasSubmenu: true },
  { id: 'arcade', title: 'Arcade', icon: Gamepad2, hasSubmenu: true },
  { id: 'lotto', title: 'Lotto', icon: CircleDot, hasSubmenu: true },
  { id: 'promotions', title: 'Promotions', icon: Gift },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  expanded,
  mobileOpen,
  setMobileOpen,
  userRole,
  lang,
  setLang,
}) => {
  const handleItemClick = (item: NavItemDef) => {
    setCurrentTab(item.id);
    if (mobileOpen) setMobileOpen(false);
  };

  const renderNavContent = (isDrawer: boolean) => {
    const showLabels = isDrawer || expanded;

    return (
      <div className="flex flex-col h-full justify-between py-2.5">
        {/* Top Nav List */}
        <div className="space-y-1 px-1.5 sm:px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                title={item.title}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer group ${
                  isActive
                    ? 'bg-[#b8004f] text-white shadow-md shadow-black/30 border border-[#e00062]'
                    : 'text-rose-100/90 hover:bg-[#990042] hover:text-white'
                } ${!showLabels ? 'justify-center px-2' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-amber-300'
                        : 'text-rose-200 group-hover:text-amber-300'
                    }`}
                  />
                  {showLabels && <span>{item.title}</span>}
                </div>

                {showLabels && item.hasSubmenu && (
                  <ChevronDown className="w-3.5 h-3.5 text-rose-300/70 group-hover:text-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-[#820037] border-r border-[#9e0046] transition-all duration-200 z-30 sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar shadow-xl ${
          expanded ? 'w-48' : 'w-14'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-64 h-full bg-[#820037] border-r border-[#9e0046] shadow-2xl p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-3 border-b border-[#9e0046]">
              <span className="font-black italic text-white text-base">Fb88baji Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-7 h-7 rounded-full bg-[#990042] text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">{renderNavContent(true)}</div>
          </div>
        </div>
      )}
    </>
  );
};
