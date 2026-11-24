/**
 * Classic Local SVG Portrait Avatars (Zero external URLs)
 * Matches Screenshot 14 Avatar Picker (8 classic illustrated portraits)
 */

function makeAvatarDataUri(
  bgFrom: string,
  bgTo: string,
  skin: string,
  hair: string,
  shirt: string,
  accent: string,
  variant: number
): string {
  const hairPath =
    variant % 2 === 0
      ? `<path d="M22 46 C22 20, 78 20, 78 46 L78 58 Q70 36 50 36 Q30 36 22 58 Z" fill="${hair}"/>`
      : `<path d="M24 44 C24 18, 76 18, 76 44 L79 72 Q65 62 50 64 Q35 62 21 72 Z" fill="${hair}"/>`;

  const hoodOrCollar =
    variant === 5
      ? `<path d="M18 96 C18 68, 82 68, 82 96 Z" fill="#374151"/><path d="M28 40 C28 18, 72 18, 72 40 L76 74 L24 74 Z" fill="#4b5563" opacity="0.88"/>`
      : `<path d="M16 96 C20 70, 80 70, 84 96 Z" fill="${shirt}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g${variant}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgFrom}"/>
        <stop offset="100%" stop-color="${bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g${variant})"/>
    <circle cx="50" cy="50" r="44" fill="${accent}" opacity="0.14"/>
    ${hoodOrCollar}
    <rect x="43" y="56" width="14" height="16" rx="6" fill="${skin}"/>
    <circle cx="50" cy="45" r="19" fill="${skin}"/>
    ${hairPath}
    <circle cx="43" cy="46" r="2.2" fill="#111827"/>
    <circle cx="57" cy="46" r="2.2" fill="#111827"/>
    <path d="M44 54 Q50 59 56 54" stroke="#991b1b" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="38" cy="50" r="3" fill="#fb7185" opacity="0.35"/>
    <circle cx="62" cy="50" r="3" fill="#fb7185" opacity="0.35"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CLASSIC_AVATARS: Array<{ id: string; label: string; src: string }> = [
  { id: 'classic_1', label: 'Crimson Ace', src: makeAvatarDataUri('#fce7f3', '#fbcfe8', '#fde0c8', '#5b3428', '#be123c', '#f43f5e', 0) },
  { id: 'classic_2', label: 'Ruby Striker', src: makeAvatarDataUri('#dc2626', '#991b1b', '#f5cba7', '#3e2723', '#f8fafc', '#fbbf24', 1) },
  { id: 'classic_3', label: 'Emerald Star', src: makeAvatarDataUri('#ecfdf5', '#a7f3d0', '#fde0c8', '#92400e', '#f59e0b', '#10b981', 2) },
  { id: 'classic_4', label: 'Midnight VIP', src: makeAvatarDataUri('#e2e8f0', '#cbd5e1', '#f3c6a5', '#18181b', '#0f172a', '#ef4444', 3) },
  { id: 'classic_5', label: 'Coral Crown', src: makeAvatarDataUri('#fff1f2', '#fecdd3', '#fde6d2', '#7c2d12', '#1e293b', '#fb7185', 4) },
  { id: 'classic_6', label: 'Shadow Pro', src: makeAvatarDataUri('#334155', '#0f172a', '#e2c4a8', '#1e293b', '#374151', '#94a3b8', 5) },
  { id: 'classic_7', label: 'Golden Aura', src: makeAvatarDataUri('#fef3c7', '#fde68a', '#f9d5b7', '#78350f', '#475569', '#f59e0b', 6) },
  { id: 'classic_8', label: 'Mono Legend', src: makeAvatarDataUri('#f1f5f9', '#cbd5e1', '#e5e7eb', '#334155', '#64748b', '#0f172a', 7) },
];

export const DEFAULT_CLASSIC_AVATAR = CLASSIC_AVATARS[5].src;
