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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
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
import { ReferralModal } from './components/ReferralModal';
import {
  RewardHubModal,
  RescueFundModal,
  DailySignInModal,
  BonusReceivingModal,
  LoginRewardsPopupModal,
  PromoCodeModal,
  SuggestionModal,
  AvatarPickerModal,
  ActivityOverviewData,
} from './components/ActivityHubModals';
import promoDepositBanner from './assets/images/promo_deposit_emerald_1795513858968.jpg';
import promoVipBanner from './assets/images/promo_vip_emerald_1795513857101.jpg';
import promoInviteBanner from './assets/images/promo_invite_emerald_1795513857378.jpg';
import heroEmeraldBanner from './assets/images/emerald_hero_banner_1795513857403.jpg';
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
  const [activityOverview, setActivityOverview] = useState<ActivityOverviewData | null>(null);
  const [rewardHubOpen, setRewardHubOpen] = useState(false);
  const [rescueFundOpen, setRescueFundOpen] = useState(false);
  const [dailySignInOpen, setDailySignInOpen] = useState(false);
  const [bonusCenterOpen, setBonusCenterOpen] = useState(false);
  const [loginRewardsPopupOpen, setLoginRewardsPopupOpen] = useState(false);
  const [promoCodeOpen, setPromoCodeOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [promoCategoryFilter, setPromoCategoryFilter] = useState<'all' | 'bonus' | 'vip' | 'referral'>('all');
  const [expandedPromoId, setExpandedPromoId] = useState<string | null>(null);

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
            fetchActivityOverview(savedToken);
            try {
              if (!sessionStorage.getItem('fb88_rewards_popup_shown')) {
                sessionStorage.setItem('fb88_rewards_popup_shown', '1');
                setLoginRewardsPopupOpen(true);
              }
            } catch {
              setLoginRewardsPopupOpen(true);
            }
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

  const fetchActivityOverview = async (token?: string) => {
    const t = token || user?.sessionToken;
    if (!t) {
      setActivityOverview(null);
      return;
    }
    try {
      const res = await fetch('/api/v1/activity/overview', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setActivityOverview(data);
      }
    } catch {
      // ignore network error
    }
  };

  // Real-Time Balance Synchronization
  useEffect(() => {
    if (!user) {
      setActivityOverview(null);
      return;
    }
    fetchWallet();
    fetchActivityOverview(user.sessionToken);

    const pollInterval = setInterval(() => {
      fetchWallet();
    }, 2500);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fb88_wallet_refresh' || e.key === 'deposit_approved') {
        fetchWallet();
        fetchActivityOverview();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleCustomDepositEvent = () => {
      fetchWallet();
      fetchActivityOverview();
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
      sessionStorage.removeItem('fb88_rewards_popup_shown');
    } catch (e) {
      // ignore
    }
    setLoginRewardsPopupOpen(false);
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
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f2f9f5] text-[#182620] flex flex-col font-sans selection:bg-[#00a859] selection:text-white">
      {/* Top Header */}
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
        onOpenBonus={() => setBonusCenterOpen(true)}
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
        {/* Sidebar & White Slide-Out Drawer */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          expanded={sidebarExpanded}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          userRole={user?.role}
          user={user}
          wallet={wallet}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={(tab) => setWalletModal({ open: true, tab })}
          onOpenPersonalCenter={(tab = 'account') => {
            setPersonalCenterInitialTab(tab);
            setPersonalCenterModalOpen(true);
          }}
          onOpenRewardHub={() => {
            if (!user) {
              setAuthModal({ open: true, tab: 'login' });
            } else {
              setRewardHubOpen(true);
            }
          }}
          onOpenSupport={() => setSupportModalOpen(true)}
          onLogout={handleLogout}
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

          {/* TAB: PROMOTIONS (Mint/White Screenshot 5 Layout) */}
          {currentTab === 'promotions' && (
            <div className="space-y-4">
              {/* Top < PROMOTION Title Bar */}
              <div className="flex items-center justify-between bg-white border border-[#dceee3] rounded-2xl px-3.5 py-2.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrentTab('hot')}
                  className="w-8 h-8 rounded-full bg-[#e3f5eb] hover:bg-[#cdebd9] text-[#00a859] flex items-center justify-center cursor-pointer transition"
                  aria-label="Back to Home"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm sm:text-base font-black tracking-wider text-[#182620]">PROMOTION</h2>
                <span className="w-8" />
              </div>

              {/* Top Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'bonus', label: 'Welcome & Bonus' },
                    { id: 'vip', label: 'VIP & Cashback' },
                    { id: 'referral', label: 'Invite & Spin' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPromoCategoryFilter(cat.id)}
                    className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                      promoCategoryFilter === cat.id
                        ? 'bg-[#00a859] text-white shadow-sm'
                        : 'bg-white text-[#182620] border border-[#dceee3] hover:bg-[#eaf8f0]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Promotion Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'reg_19',
                    cat: 'bonus',
                    titleBn: '৳১৯ ফ্রি বোনাস রেজিস্ট্রেশনেই পাবেন...',
                    highlight: '৳১৯ ফ্রি',
                    subHighlight: 'উত্তোলন ৳৩০০ পর্যন্ত',
                    date: '2026/08/24-Long term',
                    detailsBn: 'নতুন সদস্য হিসেবে একাউন্ট খোলার পর বোনাস সেন্টার ও প্রোমো কোড থেকে ফ্রি বোনাস ক্লেইম করুন।',
                    action: 'bonus' as const,
                    badge: 'FREE',
                    bannerImg: promoDepositBanner,
                  },
                  {
                    id: 'app_59',
                    cat: 'bonus',
                    titleBn: 'FB88 APP বোনাস ৳৫৯ ডাউনলোড করুন...',
                    highlight: 'APP বোনাস ৫৯',
                    subHighlight: 'মোবাইল অ্যাপ ডাউনলোড অফার',
                    date: '2026/08/24-Long term',
                    detailsBn: 'হোম স্ক্রিনে অ্যাপ ইনস্টল করুন এবং প্রোমো কোড বা বোনাস সেন্টার থেকে রিওয়ার্ড গ্রহণ করুন।',
                    action: 'promo_code' as const,
                    badge: 'APP',
                    bannerImg: heroEmeraldBanner,
                  },
                  {
                    id: 'first_deposit_299',
                    cat: 'bonus',
                    titleBn: 'নতুন সদস্যদের প্রথম জমা বোনাস সর্বোচ্চ ২৯৯...',
                    highlight: 'সর্বোচ্চ ২৯৯% / ৳২৯৯',
                    subHighlight: 'প্রথম ডিপোজিটে তাৎক্ষণিক বোনাস',
                    date: '2026/08/24-Long term',
                    detailsBn: 'প্রথমবার ন্যূনতম ৳২০০ ডিপোজিট করলে স্বয়ংক্রিয় বোনাস এবং দৈনিক রিওয়ার্ড সুবিধা খুলে যাবে।',
                    action: 'deposit_or_register' as const,
                    badge: '1ST DEPOSIT',
                    bannerImg: promoDepositBanner,
                  },
                  {
                    id: 'golden_egg',
                    cat: 'bonus',
                    titleBn: 'সোনার ডিম ভাঙতে প্রতিদিন লগইন করুন ৯,৯৯৯,৯৯৯...',
                    highlight: '৯,৯৯৯,৯৯৯ জিতুন',
                    subHighlight: 'Smash & Win Golden Egg',
                    date: '2026/08/25-Long term',
                    detailsBn: 'প্রতিদিন লগইন করে ও রিচার্জ টার্গেট পূরণ করে Smash & Win ভাউচার দিয়ে সোনার ডিম ভাঙুন।',
                    action: 'bonus' as const,
                    badge: 'SMASH',
                    bannerImg: heroEmeraldBanner,
                  },
                  {
                    id: 'invite_1999',
                    cat: 'referral',
                    titleBn: '১ জনকে আমন্ত্রণ করুন পান ৳১,৯৯৯ সহজেই লাখপতি হন...',
                    highlight: '৳১,৯৯৯ + ৳৩৯,৮৮৮',
                    subHighlight: '৩-স্তর আজীবন রেফারেল কমিশন',
                    date: '2026/08/25-Long term',
                    detailsBn: 'আপনার কিউআর কোড বা রেফারেল লিঙ্ক শেয়ার করে প্রতিটি ভ্যালিড রেফারেলে কমিশন ও মাইলস্টোন বোনাস পান।',
                    action: 'invite' as const,
                    badge: 'INVITE',
                    bannerImg: promoInviteBanner,
                  },
                  {
                    id: 'vip_4_benefits',
                    cat: 'vip',
                    titleBn: 'FB88 VIP উপভোগ করুন ৪ টি সুবিধা বোনাস...',
                    highlight: 'VIP ৪টি সুবিধা',
                    subHighlight: 'উচ্চতর উত্তোলন সীমা ও সাপ্তাহিক বোনাস',
                    date: '2026/08/25-Long term',
                    detailsBn: 'টার্নওভার বাড়ার সাথে সাথে স্বয়ংক্রিয়ভাবে VIP লেভেল উন্নত হয় ও বিশেষ বোনাস আনলক হয়।',
                    action: 'reward_hub' as const,
                    badge: 'VIP',
                    bannerImg: promoVipBanner,
                  },
                  {
                    id: 'rebate_3pct',
                    cat: 'vip',
                    titleBn: 'রিয়েল-টাইম বেটিং রিবেট ৩% পর্যন্ত & রেসকিউ ফান্ড...',
                    highlight: '৩% - ৮% ক্যাশব্যাক',
                    subHighlight: 'রিয়েল-টাইম রিবেট ও রেসকিউ ফান্ড',
                    date: '2026/08/25-Long term',
                    detailsBn: 'দৈনিক নেট লস ৳২০০+ হলে রেসকিউ ফান্ড থেকে তাৎক্ষণিক ২% থেকে ৮% পর্যন্ত ক্যাশব্যাক ক্লেইম করুন।',
                    action: 'rescue' as const,
                    badge: 'REBATE',
                    bannerImg: promoVipBanner,
                  },
                  {
                    id: 'red_envelope_12',
                    cat: 'bonus',
                    titleBn: 'ভাগ্যবান লাল খাম বৃষ্টি প্রতিদিন ১২ বার...',
                    highlight: 'প্রতিদিন ১২ বার',
                    subHighlight: 'লাকি লাল খাম ও বোনাস ভাউচার',
                    date: '2026/08/25-Long term',
                    detailsBn: 'অ্যাক্টিভ খেলোয়াড়দের জন্য বোনাস সেন্টারে প্রতিদিন ১২ বার পর্যন্ত লাল খাম ও স্পিন পুরস্কার।',
                    action: 'bonus' as const,
                    badge: 'LUCKY',
                    bannerImg: promoInviteBanner,
                  },
                ]
                  .filter((p) => promoCategoryFilter === 'all' || p.cat === promoCategoryFilter)
                  .map((promo) => {
                    const isExpanded = expandedPromoId === promo.id;
                    const handlePromoClick = () => {
                      if (!user) {
                        setAuthModal({ open: true, tab: 'register' });
                        return;
                      }
                      if (promo.action === 'bonus') setBonusCenterOpen(true);
                      else if (promo.action === 'promo_code') setPromoCodeOpen(true);
                      else if (promo.action === 'invite') setReferralModalOpen(true);
                      else if (promo.action === 'reward_hub') setRewardHubOpen(true);
                      else if (promo.action === 'rescue') setRescueFundOpen(true);
                      else if (promo.action === 'deposit_or_register') setWalletModal({ open: true, tab: 'deposit' });
                    };

                    return (
                      <div
                        key={promo.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-xs border border-[#dceee3] text-[#182620] flex flex-col justify-between hover:border-[#00a859]/50 transition"
                      >
                        <div className="p-3.5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-black text-[#182620] truncate">{promo.titleBn}</h3>
                            <button
                              type="button"
                              onClick={() => setExpandedPromoId(isExpanded ? null : promo.id)}
                              className="px-2.5 py-1 rounded-full bg-[#eaf8f0] border border-[#cde8d8] text-[#00a859] text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer hover:bg-[#d8f3e3] transition"
                              aria-label="Toggle details"
                            >
                              <span>Details</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </div>

                          {/* Emerald Artwork Banner */}
                          <button
                            type="button"
                            onClick={handlePromoClick}
                            className="w-full text-left rounded-xl overflow-hidden relative cursor-pointer group border border-[#dceee3] block"
                          >
                            <img
                              src={promo.bannerImg}
                              alt={promo.highlight}
                              className="w-full h-32 sm:h-36 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#064e2b]/85 via-[#064e2b]/45 to-transparent p-3.5 flex flex-col justify-center">
                              <span className="inline-block self-start px-2 py-0.5 rounded-md bg-[#00a859] text-white text-[10px] font-black tracking-wider shadow-xs">
                                FB88 • {promo.badge}
                              </span>
                              <div className="text-lg font-black text-white leading-tight mt-1.5 drop-shadow">
                                {promo.highlight}
                              </div>
                              <div className="text-[11px] font-semibold text-emerald-100 mt-0.5 drop-shadow">
                                {promo.subHighlight}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 rounded-xl bg-[#f4fbf7] border border-[#cde8d8] text-xs text-[#182620] space-y-2.5">
                              <p className="text-[#557063] leading-relaxed">{promo.detailsBn}</p>
                              <button
                                type="button"
                                onClick={handlePromoClick}
                                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 text-white font-bold text-xs cursor-pointer shadow-xs transition"
                              >
                                {!user
                                  ? lang === 'bn'
                                    ? 'সাইন আপ করে অংশগ্রহণ করুন'
                                    : 'Sign Up to Join'
                                  : lang === 'bn'
                                  ? 'এখনই সংগ্রহ করুন'
                                  : 'Claim / Open Now'}
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-[#557063] pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#00a859]" />
                              <span>{promo.date}</span>
                            </div>
                            <button
                              type="button"
                              onClick={handlePromoClick}
                              className="text-[#00a859] font-bold hover:underline cursor-pointer"
                            >
                              {lang === 'bn' ? 'অফার নিন →' : 'Join →'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      setReferralModalOpen(true);
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

              {/* Section Header: | HOT / | SLOTS */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-[#00a859]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#182620]">
                    {categoryTitle}
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#557063] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#cde8d8] text-[#182620] text-xs placeholder-[#8ea89a] focus:outline-hidden focus:border-[#00a859] shadow-xs"
                  />
                </div>
              </div>

              {/* Games Grid */}
              {filteredGames.length === 0 ? (
                searchQuery.trim() !== '' ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-[#dceee3] text-[#557063] space-y-2 shadow-xs">
                    <Gamepad2 className="w-10 h-10 mx-auto text-[#8ea89a]" />
                    <p className="text-xs">
                      {lang === 'bn'
                        ? `"${searchQuery}" এর সাথে কোনো গেম খুঁজে পাওয়া যায়নি।`
                        : `No games match "${searchQuery}".`}
                    </p>
                  </div>
                ) : (
                  <div className="my-6 p-8 text-center bg-white rounded-3xl border border-[#cde8d8] text-[#182620] shadow-sm space-y-4 max-w-lg mx-auto">
                    <Gamepad2 className="w-10 h-10 mx-auto text-[#00a859]" />
                    <h3 className="text-base font-bold text-[#182620]">
                      {lang === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো API গেম যুক্ত হয়নি' : 'No API games added in this category yet'}
                    </h3>
                    <p className="text-xs text-[#557063] leading-relaxed">
                      {lang === 'bn'
                        ? 'এই ক্যাটাগরিতে এখনো কোনো লাইভ API গেম যুক্ত হয়নি। এখনই লাইভ অ্যাভিয়েটর ক্র্যাশ গেম খেলতে HOT বা CRASH ট্যাবে যান।'
                        : 'No external API games are live in this category yet. Play Live Aviator Crash under HOT / CRASH.'}
                    </p>
                    <button
                      onClick={() => {
                        setCurrentTab('hot');
                        setSelectedSlotProvider('all');
                        setProviderFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-black text-xs cursor-pointer shadow hover:brightness-105 active:scale-95 transition"
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
        lang={lang}
      />

      {/* Floating Action Cluster: WhatsApp & Spin Wheel (Matches Screenshot_6 & Screenshot_10) */}
      <FloatingWidgets
        onOpenSupport={() => setSupportModalOpen(true)}
        onOpenReward={() => {
          if (!user) {
            setAuthModal({ open: true, tab: 'login' });
          } else {
            setRewardHubOpen(true);
          }
        }}
      />

      {/* Mobile Bottom Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isLoggedIn={!!user}
        onOpenProfile={() => {
          if (!user) {
            setAuthModal({ open: true, tab: 'login' });
          } else {
            setPersonalCenterInitialTab('account');
            setPersonalCenterModalOpen(true);
          }
        }}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        onOpenInvite={() => {
          if (!user) {
            setAuthModal({ open: true, tab: 'register' });
          } else {
            setReferralModalOpen(true);
          }
        }}
        onOpenReward={() => {
          if (!user) {
            setAuthModal({ open: true, tab: 'login' });
          } else {
            setRewardHubOpen(true);
          }
        }}
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
            setRewardHubOpen(true);
          }}
          onOpenSupport={() => setSupportModalOpen(true)}
        />
      )}

      {/* Personal Center / MEMBER Modal */}
      {personalCenterModalOpen && (
        <PersonalCenterModal
          user={user}
          wallet={wallet}
          initialTab={personalCenterInitialTab}
          onClose={() => setPersonalCenterModalOpen(false)}
          onRefreshWallet={() => {
            if (user?.sessionToken) {
              fetchWallet(user.sessionToken);
              fetchActivityOverview(user.sessionToken);
            }
          }}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
          onUnreadCountChange={setUnreadCount}
          onLogout={handleLogout}
          onOpenDeposit={() => setWalletModal({ open: true, tab: 'deposit' })}
          onOpenWithdrawal={() => setWalletModal({ open: true, tab: 'withdraw' })}
          onOpenReferral={() => setReferralModalOpen(true)}
          onOpenAvatarPicker={() => setAvatarPickerOpen(true)}
          onOpenSupport={() => setSupportModalOpen(true)}
          onOpenBonus={() => setBonusCenterOpen(true)}
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
              sessionStorage.setItem('fb88_rewards_popup_shown', '1');
            } catch (e) {
              // ignore
            }
            setUser(u);
            fetchWallet(token);
            fetchActivityOverview(token);
            setLoginRewardsPopupOpen(true);
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

      {/* Invite Friends / Affiliate Program Modal */}
      {referralModalOpen && (
        <ReferralModal
          user={user}
          wallet={wallet}
          isOpen={referralModalOpen}
          onClose={() => setReferralModalOpen(false)}
          onRefreshWallet={() => {
            if (user?.sessionToken) {
              fetchWallet(user.sessionToken);
              fetchActivityOverview(user.sessionToken);
            }
          }}
          onRequireAuth={() => setAuthModal({ open: true, tab: 'register' })}
          lang={lang}
        />
      )}

      {/* Activity & Rewards Modals */}
      {user && rewardHubOpen && (
        <RewardHubModal
          user={user}
          wallet={wallet}
          overview={activityOverview}
          onClose={() => setRewardHubOpen(false)}
          onRefresh={() => {
            fetchWallet(user.sessionToken);
            fetchActivityOverview(user.sessionToken);
          }}
          onUserUpdate={(updated) => setUser(updated)}
          onOpenBonus={() => setBonusCenterOpen(true)}
          onOpenSignIn={() => setDailySignInOpen(true)}
          onOpenRescue={() => setRescueFundOpen(true)}
          onOpenInvite={() => setReferralModalOpen(true)}
          onOpenPromoCode={() => setPromoCodeOpen(true)}
          onOpenAvatarPicker={() => setAvatarPickerOpen(true)}
          onOpenVipBenefits={() => {
            setPersonalCenterInitialTab('reward');
            setPersonalCenterModalOpen(true);
          }}
        />
      )}

      {user && dailySignInOpen && (
        <DailySignInModal
          user={user}
          wallet={wallet}
          overview={activityOverview}
          onClose={() => setDailySignInOpen(false)}
          onCheckedIn={() => {
            fetchWallet(user.sessionToken);
            fetchActivityOverview(user.sessionToken);
          }}
          onOpenDeposit={() => setWalletModal({ open: true, tab: 'deposit' })}
        />
      )}

      {user && rescueFundOpen && (
        <RescueFundModal
          user={user}
          overview={activityOverview}
          onClose={() => setRescueFundOpen(false)}
          onClaimed={() => {
            fetchWallet(user.sessionToken);
            fetchActivityOverview(user.sessionToken);
          }}
        />
      )}

      {user && bonusCenterOpen && (
        <BonusReceivingModal
          user={user}
          wallet={wallet}
          overview={activityOverview}
          onClose={() => setBonusCenterOpen(false)}
          onClaimed={() => {
            fetchWallet(user.sessionToken);
            fetchActivityOverview(user.sessionToken);
          }}
          onOpenDeposit={() => setWalletModal({ open: true, tab: 'deposit' })}
        />
      )}

      {user && loginRewardsPopupOpen && (
        <LoginRewardsPopupModal
          user={user}
          overview={activityOverview}
          onClose={() => setLoginRewardsPopupOpen(false)}
          onClaimed={() => {
            fetchWallet(user.sessionToken);
            fetchActivityOverview(user.sessionToken);
          }}
          onOpenDeposit={() => setWalletModal({ open: true, tab: 'deposit' })}
        />
      )}

      {user && promoCodeOpen && (
        <PromoCodeModal
          user={user}
          onClose={() => setPromoCodeOpen(false)}
          onRedeemed={() => {
            fetchWallet(user.sessionToken);
            fetchActivityOverview(user.sessionToken);
          }}
        />
      )}

      {user && suggestionOpen && (
        <SuggestionModal user={user} onClose={() => setSuggestionOpen(false)} />
      )}

      {user && avatarPickerOpen && (
        <AvatarPickerModal
          user={user}
          onClose={() => setAvatarPickerOpen(false)}
          onUserUpdate={(updated) => setUser(updated)}
        />
      )}

      {/* Balance Credit Toast */}
      {balanceCreditNotice && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 z-60 p-4 rounded-2xl bg-white border-2 border-[#00a859] text-[#182620] shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3 max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-[#eaf8f0] text-[#00a859] flex items-center justify-center font-bold text-lg shrink-0">
            ✓
          </div>
          <div className="text-xs">
            <div className="font-black text-[#00a859]">ডিপোজিট ব্যালেন্স যুক্ত হয়েছে!</div>
            <div className="text-[#557063] mt-0.5">{balanceCreditNotice}</div>
          </div>
          <button
            onClick={() => setBalanceCreditNotice(null)}
            className="text-[#557063] hover:text-[#182620] text-xs p-1 ml-auto cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
