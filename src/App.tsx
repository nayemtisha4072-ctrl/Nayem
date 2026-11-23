/**
 * Banglabaji Main Application
 * Matches Screenshot_6 through Screenshot_11:
 * - Color scheme: Magenta (#64002c / #7d0037), Gold accents (#c49c38), Dark Slate/Teal elements (#162320)
 * - Header with BB Banglabaji logo, Home, collapse toggle, Gold Deposit, Main Wallet balance pill, profile menu with VIP points
 * - Hero banner with referral promotion and Bangladeshi model
 * - Golden marquee announcement bar with speaker icon
 * - Glossy 3D beveled category pill buttons with active indicator triangle
 * - Dynamic Slot Providers Grid rendered only when external slot games are connected
 * - My Wallet Modal matching Screenshot_9 (Deposit & Withdrawal, bKash & Nagad)
 * - Personal Information Modal matching Screenshot_8
 * - Footer matching Screenshot_10 (Payment methods, responsible gaming, community links, licenses)
 * - Floating WhatsApp & Spin Wheel widgets
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Flame,
  Gamepad2,
  Tv,
  Trophy,
  Fish,
  Spade,
  Gift,
  HelpCircle,
  Headphones,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { User, Wallet, GameItem, GameCategory } from './types';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { HeroCarousel } from './components/HeroCarousel';
import { AnnouncementBar } from './components/AnnouncementBar';
import { CategoryNav } from './components/CategoryNav';
import { GameCard } from './components/GameCard';
import { SlotProvidersGrid } from './components/SlotProvidersGrid';
import { GameArenaModal } from './components/GameArenaModal';
import { SportsbookView } from './components/SportsbookView';
import { WalletModal } from './components/WalletModal';
import { AuthModal } from './components/AuthModal';
import { AdminPortal } from './components/AdminPortal';
import { PersonalInformationModal } from './components/PersonalInformationModal';
import { PersonalCenterModal, PersonalCenterTab } from './components/PersonalCenterModal';
import { FloatingWidgets } from './components/FloatingWidgets';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ResponsibleGamingModal } from './components/ResponsibleGamingModal';
import { SupportModal } from './components/SupportModal';
import { PolicyModal, PolicySection } from './components/PolicyModal';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testFirestoreConnection } from './firebase';

function matchesSlotProvider(gameProvider: string, filterKey: string): boolean {
  if (!filterKey || filterKey === 'all') return true;
  const p = (gameProvider || '').trim().toLowerCase();
  const k = filterKey.trim().toLowerCase();
  return p === k || p.includes(k);
}

export default function App() {
  const [lang, setLangState] = useState<'bn' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('fb88_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch (e) {
      // ignore
    }
    return 'bn'; // Default to Bangla!
  });

  const setLang = (newLang: 'bn' | 'en') => {
    setLangState(newLang);
    try {
      localStorage.setItem('fb88_lang', newLang);
    } catch (e) {
      // ignore
    }
  };

  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('hot');
  const [selectedSlotProvider, setSelectedSlotProvider] = useState<string>('all');
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);

  // User & Wallet State
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [balanceCreditNotice, setBalanceCreditNotice] = useState<string | null>(null);

  // Games & CMS State
  const [games, setGames] = useState<GameItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [customAnnouncement, setCustomAnnouncement] = useState<string | null>(null);

  const announcementText = customAnnouncement || (user
    ? (lang === 'bn'
        ? 'বাংলাবাজি প্ল্যাটফর্মে স্বাগতম! বিকাশ, নগদ ও রকেটে ইনস্ট্যান্ট ডিপোজিট করুন এবং পান আকর্ষণীয় বোনাস।'
        : 'Welcome to Banglabaji! Instant deposit with bKash, Nagad & Rocket.')
    : (lang === 'bn'
        ? 'বাংলাবাজি প্ল্যাটফর্মে স্বাগতম! আকর্ষণীয় গেম ও সেরা অফার উপভোগ করতে প্রথমে সাইন আপ ও লগইন করুন।'
        : 'Welcome to Banglabaji! Please sign up and log in to play games and claim offers.'));

  // Modals
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    tab: 'login' | 'register';
    noticeMsg?: string;
  }>({
    open: false,
    tab: 'login',
  });
  const [walletModal, setWalletModal] = useState<{
    open: boolean;
    tab: 'deposit' | 'withdraw';
  }>({
    open: false,
    tab: 'deposit',
  });
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const [personalCenterModalOpen, setPersonalCenterModalOpen] = useState(false);
  const [personalCenterInitialTab, setPersonalCenterInitialTab] = useState<PersonalCenterTab>('account');
  const [activeGameModal, setActiveGameModal] = useState<{
    game: GameItem;
    mode: 'real' | 'demo';
  } | null>(null);
  const [responsibleModalOpen, setResponsibleModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState<{ open: boolean; section: PolicySection }>({
    open: false,
    section: '18plus',
  });

  // URL Route and Key listener for Admin Portal vs Main Site navigation
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('admin') || search.includes('admin') || path.startsWith('/admin')) {
        setIsAdminPortalOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    testFirestoreConnection();

    // Dedicated shortcut listener for platform administrator: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleSecretKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminPortalOpen((prev) => {
          const next = !prev;
          if (next) {
            window.location.hash = 'admin';
          } else {
            window.location.hash = '';
            window.history.replaceState(null, '', '/');
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleSecretKey);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleSecretKey);
    };
  }, []);

  // Restore real player session from localStorage (No demo auto-login)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem('fb88_user_token');
        if (!savedToken) return;
        const res = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (!res.ok) {
          localStorage.removeItem('fb88_user_token');
          return;
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.user && data.user.role === 'user') {
            setUser(data.user);
            fetchWallet(savedToken);
          } else {
            localStorage.removeItem('fb88_user_token');
          }
        }
      } catch (err) {
        console.error('Session restore error:', err);
      }
    };
    restoreSession();
  }, []);

  // Sync Firebase Auth user profile document to Firestore when signed in via Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) return;
      const profilePath = `users/${fbUser.uid}`;
      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            id: fbUser.uid,
            username: fbUser.displayName || fbUser.email?.split('@')[0] || 'player',
            email: fbUser.email || '',
            fullName: fbUser.displayName || '',
            role: 'user',
            kycStatus: 'UNVERIFIED',
            vipLevel: 'Normal',
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, profilePath);
        } catch {
          // Logged cleanly via handleFirestoreError
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Keep Header unread message badge synced with server
  useEffect(() => {
    if (!user?.sessionToken) {
      setUnreadCount(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/v1/user/personal-center', {
          headers: { Authorization: `Bearer ${user.sessionToken}` },
        });
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data.internalMessages)) {
            setUnreadCount(data.internalMessages.filter((m: any) => !m.read).length);
          }
        }
      } catch {
        // ignore network hiccup
      }
    };
    fetchUnread();
  }, [user?.id, user?.sessionToken]);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/v1/games');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.games) setGames(data.games);
      }
    } catch (err) {
      console.error('Fetch games error:', err);
    }
  };

  // Fetch Games & CMS
  useEffect(() => {
    const fetchCms = async () => {
      try {
        const res = await fetch('/api/v1/cms');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data.announcement) setCustomAnnouncement(data.announcement);
        }
      } catch (err) {
        console.error('Fetch CMS error:', err);
      }
    };

    fetchGames();
    fetchCms();
  }, []);

  // Fetch Wallet with balance notification
  const fetchWallet = async (token?: string) => {
    const t = token || user?.sessionToken;
    if (!t) return;
    try {
      const res = await fetch('/api/v1/wallet', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        const updated = data.wallet || (data.availablePaisa !== undefined ? data : null);
        if (updated) {
          setWallet((prev) => {
            if (prev && updated.availablePaisa > prev.availablePaisa) {
              const addedTk = (updated.availablePaisa - prev.availablePaisa) / 100;
              setBalanceCreditNotice(
                `৳${addedTk.toLocaleString()} টাকা আপনার আইডিতে যোগ হয়েছে! বর্তমান ব্যালেন্স: ৳${(updated.availablePaisa / 100).toLocaleString()}`
              );
              setTimeout(() => setBalanceCreditNotice(null), 7000);
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Fetch wallet error:', err);
    }
  };

  // Real-Time Balance Synchronization
  useEffect(() => {
    if (!user) return;
    fetchWallet();

    const pollInterval = setInterval(() => {
      fetchWallet();
    }, 2500);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fb88_wallet_refresh' || e.key === 'deposit_approved') {
        fetchWallet();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleCustomDepositEvent = () => {
      fetchWallet();
    };
    window.addEventListener('deposit_approved', handleCustomDepositEvent);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('deposit_approved', handleCustomDepositEvent);
    };
  }, [user?.id, user?.sessionToken]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('fb88_user_token');
    } catch (e) {
      // ignore
    }
    setUser(null);
    setWallet(null);
  };

  // Filtered games
  const filteredGames = games.filter((g) => {
    const categoryMatch =
      currentTab === 'hot'
        ? g.isHot || g.category === 'slots' || g.category === 'live'
        : currentTab === 'slots'
        ? g.category === 'slots'
        : currentTab === 'crash'
        ? g.category === 'crash' || g.title.toLowerCase().includes('crash') || g.title.toLowerCase().includes('aviator')
        : currentTab === 'live'
        ? g.category === 'live'
        : currentTab === 'table'
        ? g.category === 'table' || g.category === 'poker'
        : currentTab === 'fish'
        ? g.category === 'fish'
        : currentTab === 'arcade'
        ? g.category === 'arcade'
        : currentTab === 'lotto'
        ? (g.category as string) === 'lotto'
        : g.category === currentTab;

    const providerMatch =
      providerFilter === 'all'
        ? selectedSlotProvider === 'all' || currentTab !== 'slots'
          ? true
          : matchesSlotProvider(g.provider, selectedSlotProvider)
        : g.provider === providerFilter;

    const queryMatch =
      searchQuery.trim() === ''
        ? true
        : g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.provider.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && providerMatch && queryMatch;
  });

  // IF ADMIN PORTAL IS OPEN: RENDER DEDICATED ADMIN PORTAL
  if (isAdminPortalOpen) {
    return (
      <AdminPortal
        onBackToMainSite={() => {
          setIsAdminPortalOpen(false);
          setCurrentTab('hot');
          fetchGames();
          window.location.hash = '';
          window.history.replaceState(null, '', '/');
        }}
        lang={lang}
      />
    );
  }

  const categoryTitle =
    currentTab === 'hot'
      ? 'HOT'
      : currentTab === 'slots'
      ? 'SLOTS'
      : currentTab === 'sports'
      ? 'SPORTS'
      : currentTab === 'live'
      ? 'CASINO'
      : currentTab === 'crash'
      ? 'CRASH'
      : currentTab === 'table'
      ? 'TABLE'
      : currentTab === 'fish'
      ? 'FISHING'
      : currentTab === 'arcade'
      ? 'ARCADE'
      : currentTab === 'lotto'
      ? 'LOTTO'
      : 'GAMES';

  // Game Click Handler: If not authenticated, open Sign Up modal naturally
  const handlePlayGame = (game: GameItem, mode: 'real' | 'demo' = 'real') => {
    if (!user) {
      setAuthModal({
        open: true,
        tab: 'register',
      });
      return;
    }
    setActiveGameModal({ game, mode: 'real' });
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#64002c] text-rose-50 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header (Matches Screenshot_6 & Screenshot_7) */}
      <Header
        user={user}
        wallet={wallet}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        onOpenWallet={(tab) => setWalletModal({ open: true, tab })}
        onOpenProfile={() => {
          setPersonalCenterInitialTab('account');
          setPersonalCenterModalOpen(true);
        }}
        onOpenPersonalCenter={(tab = 'account') => {
          setPersonalCenterInitialTab(tab);
          setPersonalCenterModalOpen(true);
        }}
        onOpenLedger={() => {}}
        onLogout={handleLogout}
        onRefreshWallet={() => fetchWallet()}
        onSelectCategory={(cat) => setCurrentTab(cat as NavTab)}
        activeCategory={currentTab}
        unreadCount={unreadCount}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full max-w-full overflow-x-hidden min-h-0">
        {/* Sidebar (Matches Screenshot_6 & Screenshot_10) */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          expanded={sidebarExpanded}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          userRole={user?.role}
          lang={lang}
          setLang={setLang}
        />

        {/* Content View Area */}
        <main className="flex-1 w-full min-w-0 px-2.5 sm:px-6 lg:px-8 py-3 sm:py-5 pb-24 sm:pb-8 space-y-4 max-w-7xl mx-auto overflow-x-hidden">
          {/* Announcement Marquee Bar (Matches Screenshot_6) */}
          <AnnouncementBar text={announcementText} lang={lang} />

          {/* TAB: SPORTSBOOK VIEW */}
          {currentTab === 'sports' && (
            <SportsbookView
              user={user}
              wallet={wallet}
              onRefreshWallet={() => fetchWallet()}
              lang={lang}
            />
          )}

          {/* TAB: PROMOTIONS */}
          {currentTab === 'promotions' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#800038] border border-[#a30048] text-white space-y-2 shadow-xl">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  PROMOTIONS
                </span>
                <h2 className="text-2xl font-black">
                  {lang === 'bn' ? 'আকর্ষণীয় বোনাস ও ক্যাশব্যাক অফার' : 'Exclusive Promotions & Bonuses'}
                </h2>
                <p className="text-xs text-rose-100 max-w-xl">
                  {lang === 'bn'
                    ? 'প্রতিটি ডিপোজিটে ক্যাশব্যাক, নতুন মেম্বারদের জন্য ১০০% ওয়েলকাম বোনাস এবং বন্ধুদের রেফার করে ১০% রেফার বোনাস।'
                    : 'Instant reload bonuses, weekly VIP cashback, and first deposit matching.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    titleBn: '১০০% ওয়েলকাম বোনাস',
                    titleEn: '100% Welcome Bonus',
                    amount: '৳১০,০০০ পর্যন্ত',
                    reqBn: 'নূন্যতম ডিপোজিট ৳৫০০ • ১০x রোলওভার',
                    reqEn: 'Min deposit ৳500 • 10x Rollover',
                    tag: 'NEW MEMBER',
                    color: 'from-[#800038] to-[#4d0022]',
                  },
                  {
                    titleBn: '১০% রেফার বোনাস',
                    titleEn: '10% Referral Bonus',
                    amount: 'আনলিমিটেড আর্নিং',
                    reqBn: 'বন্ধুকে রেফার করে জিতে নিন ১০% রেফারেল কমিশন',
                    reqEn: 'Invite friends and earn 10% cash commission',
                    tag: 'REFERRAL',
                    color: 'from-[#a30048] to-[#590027]',
                  },
                  {
                    titleBn: '১.২% সাপ্তাহিক স্পোর্টস ক্যাশব্যাক',
                    titleEn: '1.2% Sports Cashback',
                    amount: 'আনলিমিটেড ক্যাশব্যাক',
                    reqBn: 'প্রতি সোমবার স্বয়ংক্রিয়ভাবে ওয়ালেটে জমা হয়',
                    reqEn: 'Auto-credited to wallet every Monday',
                    tag: 'CASHBACK',
                    color: 'from-[#820038] to-[#3d001a]',
                  },
                ].map((promo, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl bg-gradient-to-br ${promo.color} border border-[#ba0054]/50 shadow-xl space-y-4 flex flex-col justify-between`}
                  >
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                        {promo.tag}
                      </span>
                      <h3 className="text-lg font-black text-white">
                        {lang === 'bn' ? promo.titleBn : promo.titleEn}
                      </h3>
                      <div className="text-xl font-extrabold text-amber-300 font-mono">
                        {promo.amount}
                      </div>
                      <p className="text-xs text-rose-200">
                        {lang === 'bn' ? promo.reqBn : promo.reqEn}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (!user) {
                          setAuthModal({ open: true, tab: 'register' });
                        } else {
                          setWalletModal({ open: true, tab: 'deposit' });
                        }
                      }}
                      className="w-full py-2.5 rounded-full gold-accent-btn font-black text-xs shadow hover:brightness-110 transition cursor-pointer"
                    >
                      {!user
                        ? (lang === 'bn' ? 'সাইন আপ করে ক্লেইম করুন' : 'Sign Up to Claim')
                        : (lang === 'bn' ? 'অফারটি ক্লেইম করুন' : 'Claim Bonus')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN CASINO / SLOTS / LOBBY VIEW (HOT, SLOTS, LIVE, FISH, POKER, CRASH, TABLE, ARCADE, LOTTO) */}
          {currentTab !== 'sports' && currentTab !== 'promotions' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Hero Banner Carousel (Matches Screenshot_6) */}
              <HeroCarousel
                lang={lang}
                isLoggedIn={!!user}
                onBannerAction={(action) => {
                  if (action === 'deposit') {
                    if (!user) {
                      setAuthModal({ open: true, tab: 'register' });
                    } else {
                      setWalletModal({ open: true, tab: 'deposit' });
                    }
                  } else if (action === 'register') {
                    setAuthModal({ open: true, tab: 'register' });
                  } else if (action === 'sports') {
                    setCurrentTab('sports');
                  } else if (action === 'games') {
                    setCurrentTab('slots');
                  } else if (action === 'referral') {
                    if (!user) {
                      setAuthModal({ open: true, tab: 'register' });
                    } else {
                      setPersonalCenterInitialTab('invite');
                      setPersonalCenterModalOpen(true);
                    }
                  }
                }}
              />

              {/* Horizontal 3D Category Nav (Matches Screenshot_6 & Screenshot_11) */}
              <CategoryNav
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                lang={lang}
              />

              {/* Dynamic Slot Providers Grid (shown only if slot games are imported via API) */}
              {currentTab === 'slots' && (
                <SlotProvidersGrid
                  games={games}
                  selectedProvider={selectedSlotProvider}
                  onSelectProvider={(provId) => {
                    setSelectedSlotProvider(provId);
                  }}
                />
              )}

              {/* Section Header: | HOT / | SLOTS (Matches Screenshot_6) */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-[#ff2b88]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                    {categoryTitle}
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-rose-300/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#520024] border border-[#800038] text-white text-xs placeholder-rose-300/50 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Games Grid (Matches Screenshot_6) */}
              {filteredGames.length === 0 ? (
                searchQuery.trim() !== '' ? (
                  <div className="p-12 text-center bg-[#540026] rounded-3xl border border-[#800038] text-rose-200 space-y-2">
                    <Gamepad2 className="w-10 h-10 mx-auto text-rose-300/40" />
                    <p className="text-xs">
                      {lang === 'bn'
                        ? `"${searchQuery}" এর সাথে কোনো গেম খুঁজে পাওয়া যায়নি।`
                        : `No games match "${searchQuery}".`}
                    </p>
                  </div>
                ) : (
                  <div className="my-6 p-8 text-center bg-[#540026]/90 backdrop-blur-md rounded-3xl border border-amber-400/40 text-rose-100 shadow-xl space-y-4 max-w-lg mx-auto">
                    <Gamepad2 className="w-10 h-10 mx-auto text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      {lang === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো API গেম যুক্ত হয়নি' : 'No API games added in this category yet'}
                    </h3>
                    <p className="text-xs text-rose-200/80 leading-relaxed">
                      {lang === 'bn'
                        ? 'অ্যাডমিন প্যানেল থেকে অনলাইন API সংযুক্ত করে রিয়েল গেম যোগ করা যাবে। এখনই লাইভ অ্যাভিয়েটর ক্র্যাশ গেম খেলতে HOT বা CRASH ট্যাবে যান।'
                        : 'Add real games via Online API in the Admin Portal, or play Live Aviator Crash under HOT / CRASH.'}
                    </p>
                    <button
                      onClick={() => {
                        setCurrentTab('hot');
                        setSelectedSlotProvider('all');
                        setProviderFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-6 py-2.5 rounded-xl gold-gradient text-slate-950 font-black text-xs cursor-pointer shadow hover:brightness-110 active:scale-95"
                    >
                      {lang === 'bn' ? 'লাইভ ক্র্যাশ গেম দেখুন (Aviator)' : 'Go to Live Aviator'}
                    </button>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onPlay={handlePlayGame}
                      lang={lang}
                      isLoggedIn={Boolean(user)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer (Matches Screenshot_10 & Screenshot_13) */}
      <Footer
        onOpenResponsibleGaming={() => setPolicyModal({ open: true, section: 'responsible' })}
        onOpenPolicy={(sec) => setPolicyModal({ open: true, section: sec })}
        onOpenTab={setCurrentTab}
        onOpenAdmin={() => {
          setIsAdminPortalOpen(true);
          window.location.hash = 'admin';
        }}
        lang={lang}
      />

      {/* Floating Action Cluster: WhatsApp & Spin Wheel (Matches Screenshot_6 & Screenshot_10) */}
      <FloatingWidgets
        onOpenSupport={() => setSupportModalOpen(true)}
        onOpenReward={() => {
          setPersonalCenterInitialTab('reward');
          setPersonalCenterModalOpen(true);
        }}
      />

      {/* Mobile Bottom Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isLoggedIn={!!user}
        onOpenDeposit={() => {
          if (user) {
            setWalletModal({ open: true, tab: 'deposit' });
          }
        }}
        onOpenProfile={() => {
          if (!user) {
            setAuthModal({ open: true, tab: 'login' });
          } else {
            setPersonalCenterInitialTab('account');
            setPersonalCenterModalOpen(true);
          }
        }}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        lang={lang}
      />

      {/* Personal Information Modal (Matches Screenshot_8) */}
      {personalInfoModalOpen && (
        <PersonalInformationModal
          user={user}
          onClose={() => setPersonalInfoModalOpen(false)}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
          onLogout={handleLogout}
          onOpenVip={() => {
            setPersonalCenterInitialTab('reward');
            setPersonalCenterModalOpen(true);
          }}
          onOpenSupport={() => setSupportModalOpen(true)}
        />
      )}

      {/* Personal Center Modal (Matches Screenshot_7 records, statements, referral) */}
      {personalCenterModalOpen && (
        <PersonalCenterModal
          user={user}
          wallet={wallet}
          initialTab={personalCenterInitialTab}
          onClose={() => setPersonalCenterModalOpen(false)}
          onRefreshWallet={() => {
            if (user?.sessionToken) fetchWallet(user.sessionToken);
          }}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
          onUnreadCountChange={setUnreadCount}
          onLogout={handleLogout}
          onOpenDeposit={() => setWalletModal({ open: true, tab: 'deposit' })}
          onOpenWithdrawal={() => setWalletModal({ open: true, tab: 'withdraw' })}
          lang={lang}
        />
      )}

      {/* Auth Modal (Matches Screenshot_14 & Screenshot_15) */}
      {authModal.open && (
        <AuthModal
          initialTab={authModal.tab}
          noticeMsg={authModal.noticeMsg}
          onClose={() => setAuthModal({ open: false, tab: 'login' })}
          onSuccess={(u, token) => {
            try {
              localStorage.setItem('fb88_user_token', token);
            } catch (e) {
              // ignore
            }
            setUser(u);
            fetchWallet(token);
          }}
          onOpenTerms={() => setPolicyModal({ open: true, section: 'terms' })}
          lang={lang}
        />
      )}

      {/* Policy & Rules Modal (Matches Screenshot_13) */}
      {policyModal.open && (
        <PolicyModal
          initialSection={policyModal.section}
          onClose={() => setPolicyModal({ open: false, section: '18plus' })}
          lang={lang}
        />
      )}

      {/* Wallet Modal (Matches Screenshot_9) */}
      {walletModal.open && (
        <WalletModal
          initialTab={walletModal.tab}
          user={user}
          wallet={wallet}
          onClose={() => setWalletModal({ open: false, tab: 'deposit' })}
          onRefreshWallet={() => fetchWallet()}
          lang={lang}
        />
      )}

      {/* Interactive Game Arena Modal */}
      {activeGameModal && (
        <GameArenaModal
          game={activeGameModal.game}
          wallet={wallet}
          user={user}
          initialMode={activeGameModal.mode}
          onClose={() => setActiveGameModal(null)}
          onRefreshWallet={() => fetchWallet()}
          onOpenDeposit={() => {
            setActiveGameModal(null);
            setWalletModal({ open: true, tab: 'deposit' });
          }}
          onOpenAuth={(tab) => {
            setActiveGameModal(null);
            setAuthModal({
              open: true,
              tab,
            });
          }}
          lang={lang}
        />
      )}

      {/* Responsible Gaming Modal */}
      {responsibleModalOpen && (
        <ResponsibleGamingModal
          user={user}
          wallet={wallet}
          onClose={() => setResponsibleModalOpen(false)}
          onRefreshUser={() => {
            if (user?.sessionToken) fetchWallet(user.sessionToken);
          }}
          lang={lang}
        />
      )}

      {/* Customer Support Chat Modal */}
      {supportModalOpen && (
        <SupportModal
          user={user}
          onClose={() => setSupportModalOpen(false)}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          lang={lang}
        />
      )}

      {/* Balance Credit Toast */}
      {balanceCreditNotice && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 z-60 p-4 rounded-2xl bg-[#520024] border-2 border-amber-400 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3 max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
            ✓
          </div>
          <div className="text-xs">
            <div className="font-black text-amber-300">ডিপোজিট ব্যালেন্স যুক্ত হয়েছে!</div>
            <div className="text-rose-100 mt-0.5">{balanceCreditNotice}</div>
          </div>
          <button
            onClick={() => setBalanceCreditNotice(null)}
            className="text-rose-300 hover:text-white text-xs p-1 ml-auto"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
