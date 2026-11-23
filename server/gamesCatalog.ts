/**
 * Fb88baji Game Catalog
 * Keeps only the real-time multiplayer Aviator Crash game by default.
 * Additional Slots, Live Casino, and Table games can be imported dynamically
 * by connecting any online Casino API in the Admin Portal.
 */

import type { GameItem } from '../src/types/index.ts';

export const AVIATOR_COVER_IMAGE = '/src/assets/images/aviator_crash_cover_1795439157307.jpg';

export const SEEDED_GAMES: GameItem[] = [
  {
    id: 'aviator_crash',
    title: 'Aviator',
    titleBn: 'Aviator',
    category: 'crash',
    provider: 'Crash Live',
    rtp: '97.00%',
    thumbnail: AVIATOR_COVER_IMAGE,
    isLive: true,
    isHot: true,
    isAvailable: true,
    playMode: 'interactive',
    gameCode: 'aviator',
    apiProviderId: 'crash_engine',
    minBetTk: 1,
    maxBetTk: 100000,
  },
];
