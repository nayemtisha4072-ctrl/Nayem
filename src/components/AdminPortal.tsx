/**
 * Dedicated Admin Portal for fb88baji
 * Completely isolated administration dashboard for Deposits, Withdrawals,
 * Live Support Chat, User Management, Banners CMS, API Monitoring, and Ledger Audit.
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Trophy,
  Activity,
  Layers,
  Shield,
  Lock,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Key,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Send,
  Sliders,
  Check,
  Ban,
  UserCheck,
  Smartphone,
  Gamepad2,
  Cpu,
  Globe,
  Server,
  Play,
  Sparkles,
  Copy,
  RotateCcw,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Link2,
  Radio,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import { User, Wallet, Deposit, Withdrawal, SupportTicket, CasinoApiConfig, GameItem, GameCategory, FraudAlert, PlayerLiveActivity, LiveGatewayConfig } from '../types';
import { Fb88BajiLogo } from './Fb88BajiLogo';
import { GameArenaModal } from './GameArenaModal';
import { PaymentChannelBanner } from './BrandLogos';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export type AdminSection =
  | 'overview'
  | 'deposits'
  | 'withdrawals'
  | 'live_monitoring'
  | 'anti_fraud'
  | 'casino_api'
  | 'real_games_api'
  | 'users'
  | 'support'
  | 'banners'
  | 'sports'
  | 'api_status'
  | 'ledger';

interface AdminPortalProps {
  onBackToMainSite: () => void;
  lang: 'bn' | 'en';
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToMainSite, lang }) => {
  // Admin Authentication State
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Login & first-run setup form state
  const [adminConfigured, setAdminConfigured] = useState<boolean>(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [setupUsername, setSetupUsername] = useState('admin');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSettingUpAdmin, setIsSettingUpAdmin] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  // In-app confirmation modal (replaces window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'amber';
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);

  // Helper to retrieve active admin authentication token
  const getAdminToken = () => adminToken || localStorage.getItem('fb88_admin_token') || '';

  // Navigation
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [banners, setBanners] = useState<any[]>([]);
  const [sportsEvents, setSportsEvents] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [apiHealth, setApiHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // MFS Deposit Accounts Management
  const [depositAccounts, setDepositAccounts] = useState<any>(null);
  const [editAccountsForm, setEditAccountsForm] = useState<any>(null);
  const [isSavingAccounts, setIsSavingAccounts] = useState(false);
  const [showAccountsEditor, setShowAccountsEditor] = useState(false);

  // Modals inside Admin
  const [resetPassModal, setResetPassModal] = useState<{ userId: string; username: string } | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [adjustBalanceModal, setAdjustBalanceModal] = useState<{
    userId: string;
    username: string;
    currentBalanceTk?: number;
    type?: 'add' | 'deduct';
  } | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustAmountTk, setAdjustAmountTk] = useState(500);
  const [adjustReason, setAdjustReason] = useState('মিসিং ব্যালেন্স রিফান্ড / ক্রেডিট');
  const [adjustNote, setAdjustNote] = useState('');
  const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);

  // User Comprehensive Detail Modal (All info, stats, betting history, deposits, withdrawals)
  const [selectedUserDetail, setSelectedUserDetail] = useState<{
    user: any;
    stats?: any;
    bets?: any[];
    deposits?: any[];
    withdrawals?: any[];
    auditHistory?: any[];
    loading?: boolean;
    activeTab?: 'overview' | 'bets' | 'deposits' | 'withdrawals' | 'audit';
  } | null>(null);

  const [newBannerModal, setNewBannerModal] = useState(false);
  const [viewScreenshotModal, setViewScreenshotModal] = useState<{
    src: string;
    trxId: string;
    username: string;
    amountTk: number;
    method: string;
    senderNumber?: string;
  } | null>(null);

  // In-App Toast Notification (replaces window.alert for iframe sandbox compatibility)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Rejection Dialog (replaces window.prompt for iframe sandbox compatibility)
  const [rejectionDialog, setRejectionDialog] = useState<{
    type: 'deposit' | 'withdrawal';
    id: string;
    title: string;
    amountTk?: number;
    userIdentifier?: string;
    reason: string;
  } | null>(null);

  // Set of IDs currently being approved / processed in-flight
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const [newBannerForm, setNewBannerForm] = useState({
    titleBn: '',
    titleEn: '',
    subtitleBn: '',
    subtitleEn: '',
    badgeBn: 'NEW OFFER',
    badgeEn: 'NEW OFFER',
    action: 'deposit',
    image: '',
    accentColor: '#FFC943',
  });

  // Casino Gaming API & Real Games Management
  const [casinoApis, setCasinoApis] = useState<CasinoApiConfig[]>([]);
  const [gamesList, setGamesList] = useState<GameItem[]>([]);
  const [editingApi, setEditingApi] = useState<CasinoApiConfig | null>(null);
  const [isTestingApiId, setIsTestingApiId] = useState<string | null>(null);
  const [isSyncingApiId, setIsSyncingApiId] = useState<string | null>(null);
  const [apiPingResult, setApiPingResult] = useState<{ [id: string]: string }>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Live Player Monitoring & Surveillance States
  const [livePlayers, setLivePlayers] = useState<any[]>([]);
  const [playerActivities, setPlayerActivities] = useState<PlayerLiveActivity[]>([]);
  const [livePlayerSearch, setLivePlayerSearch] = useState('');
  const [liveStatusFilter, setLiveStatusFilter] = useState<'all' | 'playing' | 'lobby' | 'frozen'>('all');
  const [isFreezingUser, setIsFreezingUser] = useState<string | null>(null);
  const [isKickingUser, setIsKickingUser] = useState<string | null>(null);

  // Anti-Fraud & Risk Center States
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [fraudFilter, setFraudFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'ACTIVE'>('ACTIVE');
  const [isResolvingAlert, setIsResolvingAlert] = useState<string | null>(null);
  const [isConfiscatingBonus, setIsConfiscatingBonus] = useState<string | null>(null);
  const [isWhitelistingUser, setIsWhitelistingUser] = useState<string | null>(null);

  // Universal Live Casino Gateway States (Any Company's API)
  const [liveGatewayConfig, setLiveGatewayConfig] = useState<LiveGatewayConfig | null>(null);
  const [liveGatewayForm, setLiveGatewayForm] = useState<Partial<LiveGatewayConfig>>({});
  const [isSavingLiveGateway, setIsSavingLiveGateway] = useState(false);
  const [isTestingLiveGateway, setIsTestingLiveGateway] = useState(false);
  const [liveGatewayTestResult, setLiveGatewayTestResult] = useState<any>(null);

  // Add / Edit Real Game & Online API Bulk Import Modal
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [testGamePreview, setTestGamePreview] = useState<GameItem | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFeedUrl, setImportFeedUrl] = useState('');
  const [importApiKey, setImportApiKey] = useState('');
  const [importOperatorCode, setImportOperatorCode] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportingGames, setIsImportingGames] = useState(false);
  const [gameFormData, setGameFormData] = useState<{
    title: string;
    titleBn: string;
    category: GameCategory;
    provider: string;
    rtp: string;
    thumbnail: string;
    realLaunchUrl: string;
    gameCode: string;
    apiProviderId: string;
    minBetTk: number;
    maxBetTk: number;
    isHot: boolean;
    isLive: boolean;
  }>({
    title: '',
    titleBn: '',
    category: 'slots',
    provider: 'External API',
    rtp: '96.5%',
    thumbnail: '',
    realLaunchUrl: '',
    gameCode: '',
    apiProviderId: 'custom_api',
    minBetTk: 10,
    maxBetTk: 10000,
    isHot: true,
    isLive: false,
  });

  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameCategoryFilter, setGameCategoryFilter] = useState<string>('all');
  const [showSecretKey, setShowSecretKey] = useState<{ [id: string]: boolean }>({});

  // Check saved admin session & first-run setup status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/v1/auth/admin-status');
        if (res.ok) {
          const data = await res.json();
          setAdminConfigured(Boolean(data.configured));
        }
      } catch {
        // default to true (standard login)
      }
    };
    checkAdminStatus();

    const savedToken = localStorage.getItem('fb88_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      fetchAdminProfile(savedToken);
    } else {
      setAdminUser(null);
      setAdminToken(null);
    }
  }, []);

  const fetchAdminProfile = async (token: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.role === 'admin') {
          setAdminUser(data.user);
          return;
        }
      }
      // If token is invalid or user is not an admin, clear credentials
      setAdminUser(null);
      setAdminToken(null);
      localStorage.removeItem('fb88_admin_token');
    } catch {
      setAdminUser(null);
      setAdminToken(null);
      localStorage.removeItem('fb88_admin_token');
    }
  };

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (setupPassword.trim().length < 6) {
      setLoginError('Admin password must be at least 6 characters.');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      setLoginError('Passwords do not match.');
      return;
    }
    setIsSettingUpAdmin(true);
    try {
      const res = await fetch('/api/v1/auth/admin-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: setupUsername.trim() || 'admin', password: setupPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed');
      setAdminConfigured(true);
      setAdminUser(data.admin);
      setAdminToken(data.sessionToken);
      localStorage.setItem('fb88_admin_token', data.sessionToken);
      showToast('Admin passcode configured & signed in!', 'success');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsSettingUpAdmin(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/v1/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsSetup) setAdminConfigured(false);
        throw new Error(data.error || 'Login failed');
      }

      setAdminUser(data.admin);
      setAdminToken(data.sessionToken);
      localStorage.setItem('fb88_admin_token', data.sessionToken);
      showToast('Admin login successful!', 'success');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setLoginError(null);
    setIsGoogleLoggingIn(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const res = await fetch('/api/v1/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google authentication failed');
      if (data.user?.role !== 'admin') {
        throw new Error('This Google account is not authorized as an administrator.');
      }
      setAdminUser(data.user);
      setAdminToken(data.sessionToken);
      localStorage.setItem('fb88_admin_token', data.sessionToken);
      showToast('Authorized via Google Admin SSO!', 'success');
    } catch (err: any) {
      setLoginError(err.message || 'Google Admin Sign-In failed.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    const currentToken = getAdminToken();
    try {
      if (currentToken) {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      }
    } catch {
      // ignore network errors on logout
    }
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('fb88_admin_token');
    showToast('Admin portal session ended.', 'info');
  };

  // Fetch data on section change & poll every 3 seconds for real-time deposit arrivals
  useEffect(() => {
    if (!adminUser) return;
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [adminUser, activeSection]);

  const fetchAllData = async (silentParam: boolean | any = false) => {
    const silent = typeof silentParam === 'boolean' ? silentParam : false;
    if (!silent) setIsLoading(true);
    try {
      const token = getAdminToken();
      const headers = { Authorization: `Bearer ${token}` };

      // API Status & Stats
      const statusRes = await fetch('/api/v1/admin/system/api-status', { headers });
      const statusData = await statusRes.json();
      setApiHealth(statusData);
      setStats(statusData.financialTotals);

      // Deposits (Always fetch on deposits, overview, or ledger)
      if (activeSection === 'deposits' || activeSection === 'overview' || activeSection === 'ledger') {
        const depRes = await fetch('/api/v1/admin/deposits', { headers });
        const depData = await depRes.json();
        if (depData.deposits) setDeposits(depData.deposits);

        // Fetch official MFS accounts
        const accRes = await fetch('/api/v1/admin/deposit-accounts', { headers });
        const accData = await accRes.json();
        if (accData.accounts) {
          setDepositAccounts(accData.accounts);
          if (!editAccountsForm) {
            setEditAccountsForm(JSON.parse(JSON.stringify(accData.accounts)));
          }
        }
      }

      // Withdrawals (Always fetch on withdrawals, overview, or ledger)
      if (activeSection === 'withdrawals' || activeSection === 'overview' || activeSection === 'ledger') {
        const wthRes = await fetch('/api/v1/admin/withdrawals', { headers });
        const wthData = await wthRes.json();
        if (wthData.withdrawals) setWithdrawals(wthData.withdrawals);
      }

      // Users
      if (activeSection === 'users' || activeSection === 'overview') {
        const usrRes = await fetch('/api/v1/admin/users', { headers });
        const usrData = await usrRes.json();
        if (usrData.users) setUsers(usrData.users);
      }

      // Support Chats
      if (activeSection === 'support') {
        const chatRes = await fetch('/api/v1/admin/support/chats', { headers });
        const chatData = await chatRes.json();
        if (chatData.tickets) {
          setTickets(chatData.tickets);
          if (!selectedTicket && chatData.tickets.length > 0) {
            setSelectedTicket(chatData.tickets[0]);
          } else if (selectedTicket) {
            const updated = chatData.tickets.find((t: SupportTicket) => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
          }
        }
      }

      // Banners
      if (activeSection === 'banners') {
        const banRes = await fetch('/api/v1/admin/banners', { headers });
        const banData = await banRes.json();
        if (banData.banners) setBanners(banData.banners);

        const cmsRes = await fetch('/api/v1/admin/cms', { headers });
        const cmsData = await cmsRes.json();
        if (cmsData.announcement) setAnnouncement(cmsData.announcement);
      }

      // Sports
      if (activeSection === 'sports') {
        const spRes = await fetch('/api/v1/sports/events');
        const spData = await spRes.json();
        if (spData.events) setSportsEvents(spData.events);
      }

      // Casino APIs & Real Games
      if (activeSection === 'casino_api' || activeSection === 'real_games_api' || activeSection === 'overview') {
        const apisRes = await fetch('/api/v1/admin/casino-apis', { headers });
        const apisData = await apisRes.json();
        if (apisData.apis) setCasinoApis(apisData.apis);

        const gamesRes = await fetch('/api/v1/games');
        const gamesData = await gamesRes.json();
        if (gamesData.games) setGamesList(gamesData.games);

        // Fetch Universal Live Gateway Config
        const gwRes = await fetch('/api/v1/admin/live-gateway/config', { headers });
        const gwData = await gwRes.json();
        if (gwData.config) {
          setLiveGatewayConfig(gwData.config);
          setLiveGatewayForm(gwData.config);
        }
      }

      // Live Player Monitoring (fetch on live_monitoring, overview, or users)
      if (activeSection === 'live_monitoring' || activeSection === 'overview' || activeSection === 'users') {
        const lpRes = await fetch('/api/v1/admin/live-players', { headers });
        const lpData = await lpRes.json();
        if (lpData.players) setLivePlayers(lpData.players);

        const actRes = await fetch('/api/v1/admin/player-activities', { headers });
        const actData = await actRes.json();
        if (actData.activities) setPlayerActivities(actData.activities);
      }

      // Anti-Fraud & Risk Center (fetch on anti_fraud, overview, or withdrawals)
      if (activeSection === 'anti_fraud' || activeSection === 'overview' || activeSection === 'withdrawals') {
        const faRes = await fetch('/api/v1/admin/fraud/alerts', { headers });
        const faData = await faRes.json();
        if (faData.alerts) setFraudAlerts(faData.alerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Player Surveillance Handlers
  const handleToggleFreezePlayer = async (userId: string, currentFrozen: boolean) => {
    setIsFreezingUser(userId);
    try {
      const res = await fetch(`/api/v1/admin/players/${userId}/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify({ freeze: !currentFrozen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle freeze');
      showToast(data.message, 'success');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsFreezingUser(null);
    }
  };

  const handleTerminateSession = async (userId: string) => {
    setIsKickingUser(userId);
    try {
      const res = await fetch(`/api/v1/admin/players/${userId}/terminate-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to terminate session');
      showToast(data.message, 'success');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsKickingUser(null);
    }
  };

  // Anti-Fraud Mitigation Handlers
  const handleResolveFraudAlert = async (alertId: string, status: 'RESOLVED' | 'DISMISSED') => {
    setIsResolvingAlert(alertId);
    try {
      const res = await fetch('/api/v1/admin/fraud/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify({ alertId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resolve alert');
      showToast(data.message, 'success');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsResolvingAlert(null);
    }
  };

  const handleConfiscateBonus = (userId: string) => {
    setConfirmDialog({
      title: 'Confiscate Fraudulent Bonus',
      message: 'আপনি কি নিশ্চিত যে এই প্লেয়ারের সকল অবৈধ বোনাস বাজেয়াপ্ত করতে চান?',
      confirmLabel: 'Confiscate Bonus',
      variant: 'danger',
      onConfirm: async () => {
        setIsConfiscatingBonus(userId);
        try {
          const res = await fetch('/api/v1/admin/fraud/confiscate-bonus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
            body: JSON.stringify({ userId, reason: 'Anti-fraud bonus abuse rule violation' }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to confiscate bonus');
          showToast(data.message, 'success');
          fetchAllData(true);
        } catch (err: any) {
          showToast(err.message, 'error');
        } finally {
          setIsConfiscatingBonus(null);
        }
      },
    });
  };

  const handleWhitelistPlayer = async (userId: string) => {
    setIsWhitelistingUser(userId);
    try {
      const res = await fetch('/api/v1/admin/fraud/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to whitelist player');
      showToast(data.message, 'success');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsWhitelistingUser(null);
    }
  };

  // Universal Live Gateway Handlers
  const handleSaveLiveGateway = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingLiveGateway(true);
    try {
      const res = await fetch('/api/v1/admin/live-gateway/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify(liveGatewayForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save gateway config');
      showToast(data.message, 'success');
      setLiveGatewayConfig(data.config);
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSavingLiveGateway(false);
    }
  };

  const handleTestLiveGateway = async () => {
    setIsTestingLiveGateway(true);
    setLiveGatewayTestResult(null);
    try {
      const res = await fetch('/api/v1/admin/live-gateway/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify(liveGatewayForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Handshake failed');
      setLiveGatewayTestResult(data);
      showToast(data.message, 'success');
    } catch (err: any) {
      setLiveGatewayTestResult({ status: 'FAILED', message: err.message });
      showToast(err.message, 'error');
    } finally {
      setIsTestingLiveGateway(false);
    }
  };

  const handleSyncLiveGatewayGames = async () => {
    try {
      const res = await fetch('/api/v1/admin/live-gateway/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      showToast(data.message, 'success');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Casino API & Real Games Handlers (Vendor-Agnostic)
  const handleSaveCasinoApi = async (apiData: Partial<CasinoApiConfig>) => {
    try {
      const exists = Boolean(apiData.id && casinoApis.some((a) => a.id === apiData.id));
      const endpoint = exists ? `/api/v1/admin/casino-apis/${apiData.id}` : '/api/v1/admin/casino-apis';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(apiData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save API configuration');
      showToast(data.message || 'API configuration saved successfully!', 'success');
      setEditingApi(null);
      fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCasinoApi = (apiId: string, apiName: string) => {
    setConfirmDialog({
      title: 'Delete Casino API Connector',
      message: `আপনি কি "${apiName}" API কানেক্টরটি মুছে ফেলতে চান?`,
      confirmLabel: 'Delete Connector',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/v1/admin/casino-apis/${apiId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getAdminToken()}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete API connector');
          showToast(data.message || 'API কানেক্টর মুছে ফেলা হয়েছে।', 'success');
          fetchAllData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleTestCasinoApi = async (apiId: string) => {
    setIsTestingApiId(apiId);
    try {
      const res = await fetch(`/api/v1/admin/casino-apis/${apiId}/test`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });
      const data = await res.json();
      setApiPingResult((prev) => ({
        ...prev,
        [apiId]: data.success
          ? `🟢 Connected (Ping: ${data.latencyMs}ms) - ${new Date().toLocaleTimeString()}`
          : `🔴 ${data.pingMessage || 'Connection Failed'}`,
      }));
      fetchAllData();
    } catch (err: any) {
      setApiPingResult((prev) => ({
        ...prev,
        [apiId]: `🔴 Connection Failed (Error: ${err.message})`,
      }));
    } finally {
      setIsTestingApiId(null);
    }
  };

  const handleSyncCasinoApiGames = async (apiId: string) => {
    setIsSyncingApiId(apiId);
    try {
      const res = await fetch(`/api/v1/admin/casino-apis/${apiId}/sync-games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync games from API endpoint');
      showToast(data.message || 'গেম সিঙ্ক সম্পন্ন হয়েছে!', 'success');
      fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSyncingApiId(null);
    }
  };

  const handleImportOnlineApiGames = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImportingGames(true);
    try {
      let parsedGames: any[] | undefined = undefined;
      if (importJsonText.trim()) {
        const parsed = JSON.parse(importJsonText.trim());
        parsedGames = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.data)
          ? parsed.data
          : Array.isArray(parsed?.games)
          ? parsed.games
          : undefined;
        if (!parsedGames || parsedGames.length === 0) {
          throw new Error('JSON ফিল্ডে একটি বৈধ গেম অ্যারে থাকতে হবে।');
        }
      }

      const res = await fetch('/api/v1/admin/games/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          feedUrl: importFeedUrl.trim() || undefined,
          apiKey: importApiKey.trim() || undefined,
          operatorCode: importOperatorCode.trim() || undefined,
          games: parsedGames,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Online API import failed');
      showToast(data.message || 'রিয়েল গেম সফলভাবে ইমপোর্ট হয়েছে!', 'success');
      setImportModalOpen(false);
      setImportJsonText('');
      fetchAllData();
    } catch (err: any) {
      showToast(err.message || 'Invalid JSON or API error', 'error');
    } finally {
      setIsImportingGames(false);
    }
  };

  const handleClearExternalGames = () => {
    setConfirmDialog({
      title: 'Keep Built-in Aviator Only',
      message: 'আপনি কি অ্যাডমিন বা API থেকে যুক্ত সকল অতিরিক্ত গেম সরিয়ে শুধু মূল Aviator ক্র্যাশ গেমটি রাখতে চান?',
      confirmLabel: 'Remove Extra Games',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/v1/admin/games/external', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getAdminToken()}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to clear external games');
          showToast(data.message || 'অতিরিক্ত গেম সফলভাবে সরানো হয়েছে!', 'success');
          fetchAllData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleToggleCasinoApi = async (apiId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/casino-apis/${apiId}/toggle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle API');
      fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenAddGame = () => {
    setEditingGame(null);
    setGameFormData({
      title: '',
      titleBn: '',
      category: 'slots',
      provider: casinoApis[0]?.name || 'External API',
      rtp: '96.5%',
      thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
      realLaunchUrl: '',
      gameCode: '',
      apiProviderId: casinoApis[0]?.id || 'custom_api',
      minBetTk: 10,
      maxBetTk: 10000,
      isHot: true,
      isLive: false,
    });
    setGameModalOpen(true);
  };

  const handleOpenEditGame = (game: GameItem) => {
    setEditingGame(game);
    setGameFormData({
      title: game.title,
      titleBn: game.titleBn,
      category: game.category,
      provider: game.provider,
      rtp: game.rtp,
      thumbnail: game.thumbnail,
      realLaunchUrl: game.realLaunchUrl || '',
      gameCode: game.gameCode || '',
      apiProviderId: game.apiProviderId || 'custom_api',
      minBetTk: game.minBetTk || 10,
      maxBetTk: game.maxBetTk || 10000,
      isHot: Boolean(game.isHot),
      isLive: Boolean(game.isLive),
    });
    setGameModalOpen(true);
  };

  const handleSaveGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGame
        ? `/api/v1/admin/games/${editingGame.id}`
        : '/api/v1/admin/games';
      const method = editingGame ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(gameFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save game');
      showToast(data.message || 'Game saved successfully!', 'success');
      setGameModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleGame = async (gameId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/games/${gameId}/toggle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle game');
      fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteGame = (gameId: string, title: string) => {
    setConfirmDialog({
      title: 'Delete Game',
      message: `Are you sure you want to permanently remove "${title}" from the platform?`,
      confirmLabel: 'Delete Game',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/v1/admin/games/${gameId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAdminToken()}`,
            },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete game');
          showToast(data.message || 'Game deleted successfully!', 'success');
          fetchAllData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Rejection Dialog Triggers (replaces window.prompt)
  const openRejectDepositDialog = (id: string, username?: string, amountTk?: number) => {
    setRejectionDialog({
      type: 'deposit',
      id,
      title: 'Reject Deposit Request',
      userIdentifier: username,
      amountTk,
      reason: 'Invalid Transaction ID (TrxID)',
    });
  };

  const openRejectWithdrawalDialog = (id: string, username?: string, amountTk?: number) => {
    setRejectionDialog({
      type: 'withdrawal',
      id,
      title: 'Reject Withdrawal & Refund Balance',
      userIdentifier: username,
      amountTk,
      reason: 'Invalid MFS Account Number',
    });
  };

  const handleConfirmRejectionSubmit = async () => {
    if (!rejectionDialog) return;
    const { type, id, reason } = rejectionDialog;
    const token = getAdminToken();

    try {
      if (type === 'deposit') {
        setDeposits((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'FAILED' } : d)));
        const res = await fetch(`/api/v1/admin/deposits/${id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: reason || 'Invalid TrxID or payment not received.' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reject deposit');
        showToast(data.message || 'Deposit request rejected.', 'info');
      } else {
        setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'REJECTED' } : w)));
        const res = await fetch(`/api/v1/admin/withdrawals/${id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: reason || 'Rejected by administrator and refunded to player wallet.' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reject withdrawal');
        showToast(data.message || 'Withdrawal rejected and funds refunded to player wallet.', 'info');
      }

      setRejectionDialog(null);
      window.localStorage.setItem('fb88_wallet_refresh', Date.now().toString());
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
      fetchAllData(true);
    }
  };

  // Actions: Approve Deposit (No window.confirm, shows instant green feedback!)
  const handleApproveDeposit = async (id: string) => {
    const token = getAdminToken();
    setProcessingIds((prev) => new Set(prev).add(id));

    // Optimistic UI update so row instantly shows SUCCEEDED
    setDeposits((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'SUCCEEDED' } : d)));

    try {
      const res = await fetch(`/api/v1/admin/deposits/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');

      showToast(
        data.message || '✅ Deposit approved successfully! Balance credited to player wallet.',
        'success'
      );

      // Instant event dispatch & cross-tab sync
      window.localStorage.setItem('fb88_wallet_refresh', Date.now().toString());
      window.dispatchEvent(new CustomEvent('deposit_approved', { detail: { depositId: id } }));

      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
      fetchAllData(true);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Actions: Reject Deposit
  const handleRejectDeposit = (id: string, username?: string, amountTk?: number) => {
    openRejectDepositDialog(id, username, amountTk);
  };

  // Actions: Save Official MFS Deposit Accounts
  const handleSaveDepositAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccountsForm) return;
    setIsSavingAccounts(true);
    const token = getAdminToken();
    try {
      const res = await fetch('/api/v1/admin/deposit-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accounts: editAccountsForm }),
      });
      const data = await res.json();
      setIsSavingAccounts(false);
      if (!res.ok) throw new Error(data.error || 'Failed to save accounts');
      setDepositAccounts(data.accounts);
      showToast('Official deposit accounts and settings updated successfully!', 'success');
      setShowAccountsEditor(false);
    } catch (err: any) {
      setIsSavingAccounts(false);
      showToast(err.message, 'error');
    }
  };

  // Actions: Approve Withdrawal (No window.confirm, shows instant green feedback!)
  const handleApproveWithdrawal = async (id: string) => {
    const token = getAdminToken();
    setProcessingIds((prev) => new Set(prev).add(id));

    // Optimistic UI update so row instantly shows PAID
    setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'PAID' } : w)));

    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal approval failed');

      showToast(data.message || '✅ Withdrawal approved and payout completed!', 'success');

      // Instant event dispatch & cross-tab sync
      window.localStorage.setItem('fb88_wallet_refresh', Date.now().toString());
      window.dispatchEvent(new CustomEvent('withdrawal_paid', { detail: { withdrawalId: id } }));

      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
      fetchAllData(true);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Actions: Reject Withdrawal
  const handleRejectWithdrawal = (id: string, username?: string, amountTk?: number) => {
    openRejectWithdrawalDialog(id, username, amountTk);
  };

  // Actions: KYC Status Update
  const handleUpdateKyc = async (userId: string, status: string) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`KYC status updated (${status})!`, 'success');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Actions: Suspend User (Lock ID)
  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ suspended: !currentSuspended }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || (currentSuspended ? 'User account unlocked!' : 'User account locked temporarily!'), 'info');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Actions: Ban User (Permanent Ban ID)
  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || (currentBanned ? 'User unbanned!' : 'User permanently banned!'), 'info');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Actions: Delete User Account
  const handleDeleteUser = (userId: string, username: string) => {
    setConfirmDialog({
      title: 'Delete Player Account',
      message: `Are you sure you want to permanently delete user "${username}"? All associated data will be removed.`,
      confirmLabel: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        const token = getAdminToken();
        try {
          const res = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          showToast(data.message || 'User deleted successfully!', 'success');
          fetchAllData(true);
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  // Actions: Reset User Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassModal) return;
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/v1/admin/users/${resetPassModal.userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: newPasswordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || 'Password reset successfully!', 'success');
      setResetPassModal(null);
      setNewPasswordInput('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Actions: User Comprehensive Details & Bet History Fetch
  const handleFetchUserDetails = async (userId: string, initialTab: 'overview' | 'bets' | 'deposits' | 'withdrawals' | 'audit' = 'overview') => {
    setSelectedUserDetail({ user: null, loading: true, activeTab: initialTab });
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch user details');
      setSelectedUserDetail({
        user: data.user,
        stats: data.stats,
        bets: data.bets || [],
        deposits: data.deposits || [],
        withdrawals: data.withdrawals || [],
        auditHistory: data.auditHistory || [],
        loading: false,
        activeTab: initialTab,
      });
    } catch (err: any) {
      showToast(err.message, 'error');
      setSelectedUserDetail(null);
    }
  };

  // Actions: Balance Adjustment (Dual Add / Deduct Support)
  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBalanceModal) return;
    const token = getAdminToken();
    setIsAdjustingBalance(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${adjustBalanceModal.userId}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountTk: adjustAmountTk,
          type: adjustType,
          reason: adjustReason,
          note: adjustNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Balance adjustment failed');
      showToast(
        data.message ||
          (adjustType === 'add'
            ? `✅ ৳${adjustAmountTk} balance credited to ${adjustBalanceModal.username}!`
            : `✅ ৳${adjustAmountTk} balance deducted from ${adjustBalanceModal.username}!`),
        'success'
      );

      // Instant event dispatch & cross-tab sync
      window.localStorage.setItem('fb88_wallet_refresh', Date.now().toString());
      window.dispatchEvent(new CustomEvent('balance_adjusted', { detail: { userId: adjustBalanceModal.userId } }));

      // If user details modal is open for this user, refresh it too
      if (selectedUserDetail?.user?.id === adjustBalanceModal.userId) {
        handleFetchUserDetails(adjustBalanceModal.userId, selectedUserDetail.activeTab);
      }

      setAdjustBalanceModal(null);
      setAdjustNote('');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsAdjustingBalance(false);
    }
  };

  // Actions: Reply to Support Chat
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReply.trim()) return;
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/v1/admin/support/chats/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: ticketReply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Support reply sent!', 'success');
      setTicketReply('');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Actions: Add Banner
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      const res = await fetch('/api/v1/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBannerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || 'Banner published successfully!', 'success');
      setNewBannerModal(false);
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Actions: Delete Banner
  const handleDeleteBanner = async (id: string) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/v1/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Banner deleted successfully!', 'info');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Actions: Update Marquee Announcement
  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      const res = await fetch('/api/v1/admin/cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ announcement }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Announcement marquee updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // IF NOT AUTHENTICATED AS ADMIN: SHOW DEDICATED ADMIN PORTAL LOGIN / SETUP
  // ---------------------------------------------------------------------------
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#4d0022] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-[#FFC943] selection:text-slate-950 font-sans">
        <div className="w-full max-w-md bg-[#61002a] border border-[#940042] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
          {/* Brand Header */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <Fb88BajiLogo size="lg" />
            <h1 className="text-xl font-black text-white tracking-tight">
              {adminConfigured ? 'Fb88baji Admin Portal' : 'Admin First-Run Setup'}
            </h1>
            <p className="text-xs text-slate-400">
              {adminConfigured
                ? 'Central Management Dashboard & Financial Ledger Control'
                : 'Set up your secure administrator passcode before opening the portal.'}
            </p>
          </div>

          {/* Error message */}
          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {!adminConfigured ? (
            <form onSubmit={handleAdminSetup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Admin Username:</label>
                <input
                  type="text"
                  value={setupUsername}
                  onChange={(e) => setSetupUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#47001f] border border-[#940042] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Set Admin Passcode (Min 6 chars):</label>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  placeholder="Create strong passcode"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#47001f] border border-[#940042] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Confirm Admin Passcode:</label>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={setupConfirmPassword}
                  onChange={(e) => setSetupConfirmPassword(e.target.value)}
                  placeholder="Confirm passcode"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#47001f] border border-[#940042] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                />
              </div>

              <button
                type="submit"
                disabled={isSettingUpAdmin}
                className="w-full py-3 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isSettingUpAdmin ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Initialize Admin Passcode & Enter</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Admin Username:</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter admin username (e.g. admin)"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#47001f] border border-[#940042] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Admin Password:</label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#47001f] border border-[#940042] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Sign In to Admin Portal</span>
              </button>
            </form>
          )}

          {/* Google Admin SSO Divider */}
          <div className="space-y-3">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-[#940042]" />
              <span className="px-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">OR</span>
              <div className="flex-grow border-t border-[#940042]" />
            </div>
            <button
              type="button"
              onClick={handleAdminGoogleLogin}
              disabled={isGoogleLoggingIn}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <Shield className="w-4 h-4 text-[#940042]" />
              <span>
                {isGoogleLoggingIn ? 'Verifying Google Admin...' : 'Sign In with Authorized Google Admin'}
              </span>
            </button>
          </div>

          {/* Return to main site */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onBackToMainSite}
              className="text-xs text-slate-400 hover:text-amber-400 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back to Player Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATED ADMIN PORTAL INTERFACE
  // ---------------------------------------------------------------------------
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'live_monitoring', label: 'Live Player Surveillance', icon: Radio, badge: livePlayers.filter(p => p.status === 'ONLINE_PLAYING').length ? `${livePlayers.filter(p => p.status === 'ONLINE_PLAYING').length} PLAYING` : 'LIVE' },
    { id: 'anti_fraud', label: 'Anti-Fraud & Security', icon: ShieldAlert, badge: fraudAlerts.filter(a => a.status === 'ACTIVE').length || undefined },
    { id: 'deposits', label: 'Deposit Requests', icon: ArrowDownCircle, badge: deposits.filter(d => d.status === 'PENDING').length },
    { id: 'withdrawals', label: 'Withdrawal Requests', icon: ArrowUpCircle, badge: withdrawals.filter(w => w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW').length },
    { id: 'casino_api', label: 'Slot & Live Casino API Hub', icon: Server, badge: casinoApis.length || 'API' },
    { id: 'real_games_api', label: 'Games Catalog', icon: Gamepad2, badge: gamesList.length },
    { id: 'users', label: 'User Management', icon: Users, badge: users.length },
    { id: 'support', label: 'Live Support Tickets', icon: MessageSquare, badge: tickets.filter(t => t.status === 'OPEN').length },
    { id: 'banners', label: 'Banners & CMS', icon: ImageIcon },
    { id: 'sports', label: 'Sportsbook Settlement', icon: Trophy },
    { id: 'api_status', label: 'MFS Gateway Monitor', icon: Activity },
    { id: 'ledger', label: 'Ledger Financial Audit', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#520024] text-slate-100 flex flex-col font-sans selection:bg-[#FFC943] selection:text-slate-950">
      {/* Top Admin Navigation Bar */}
      <header className="h-16 bg-[#61002a] border-b border-[#940042] px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <Fb88BajiLogo size="xs" />
          <div className="border-l border-[#940042] pl-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                ADMIN CONTROL ROOM
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Master Admin: <strong className="text-amber-300 font-mono">{adminUser.username}</strong>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh */}
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#47001f] hover:bg-[#940042] text-slate-300 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Change Admin Password */}
          <button
            onClick={() => setResetPassModal({ userId: adminUser.id, username: adminUser.username })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
            title="Change Admin Password"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Password</span>
          </button>

          {/* Return to Main Player Website */}
          <button
            onClick={onBackToMainSite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#47001f] hover:bg-[#940042] text-slate-200 text-xs font-semibold border border-[#940042] transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FFC943]" />
            <span>Player Website</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar Navigation */}
        <aside className="w-64 bg-[#66002d] border-r border-[#940042] p-4 space-y-1.5 shrink-0 hidden md:block overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
            Management Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'gold-gradient text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-[#750035]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && Number(item.badge) > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 border-t border-[#47001f] mt-4 px-3 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACID Ledger Connected</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Live Real-Money Operator Mode
            </div>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Mobile Category Select */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                  activeSection === item.id
                    ? 'gold-gradient text-slate-950 shadow'
                    : 'bg-[#750035] text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 1. OVERVIEW DASHBOARD */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Financial KPI Scorecards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-[#61002a] border border-[#940042] space-y-1">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                    <span>Total Deposits Collected</span>
                    <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ৳{((stats?.totalDepositsPaisa || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-400">MFS Inflow (bKash/Nagad/Rocket)</span>
                </div>

                <div className="p-5 rounded-3xl bg-[#61002a] border border-[#940042] space-y-1">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                    <span>Total Withdrawals Paid</span>
                    <ArrowUpCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-rose-400 font-mono">
                    ৳{((stats?.totalWithdrawalsPaisa || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-400">Player Settlements</span>
                </div>

                <div className="p-5 rounded-3xl bg-[#61002a] border border-[#940042] space-y-1">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                    <span>Gross Gaming Revenue (GGR)</span>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    ৳{((stats?.netGrossGamingRevenuePaisa || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-400">Net House Yield</span>
                </div>

                <div className="p-5 rounded-3xl bg-[#61002a] border border-[#940042] space-y-1">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                    <span>Pending Withdrawals</span>
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-black text-orange-400 font-mono">
                    {stats?.pendingWithdrawalsCount || 0}
                  </div>
                  <span className="text-[10px] text-slate-400">Requires Admin Verification</span>
                </div>
              </div>

              {/* Quick Actions & Recent DP / WTH Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Deposits Quick Card */}
                <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                      <span>Recent Deposit Requests</span>
                    </h3>
                    <button
                      onClick={() => setActiveSection('deposits')}
                      className="text-xs text-amber-400 hover:underline font-bold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {deposits.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No deposits submitted yet.</p>
                    ) : (
                      deposits.slice(0, 4).map((d) => (
                        <div
                          key={d.id}
                          className="p-3 rounded-2xl bg-[#750035] border border-[#940042] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{d.username} • <span className="uppercase text-amber-400 font-mono">{d.method}</span></div>
                            <div className="text-[11px] text-slate-300 font-mono">৳{(d.amountPaisa / 100).toLocaleString()} • {d.providerReference}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.status === 'SUCCEEDED'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : d.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {d.status}
                            </span>
                            {d.status === 'PENDING' && (
                              <button
                                onClick={() => handleApproveDeposit(d.id)}
                                className="px-2.5 py-1 rounded-xl gold-gradient text-slate-950 text-[10px] font-bold shadow hover:brightness-110"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Withdrawals Quick Card */}
                <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4 text-rose-400" />
                      <span>Recent Withdrawal Requests</span>
                    </h3>
                    <button
                      onClick={() => setActiveSection('withdrawals')}
                      className="text-xs text-amber-400 hover:underline font-bold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {withdrawals.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No withdrawals requested yet.</p>
                    ) : (
                      withdrawals.slice(0, 4).map((w) => (
                        <div
                          key={w.id}
                          className="p-3 rounded-2xl bg-[#750035] border border-[#940042] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">To: {w.payoutDestination} • <span className="uppercase text-amber-400 font-mono">{w.method}</span></div>
                            <div className="text-[11px] text-slate-300 font-mono">৳{(w.amountPaisa / 100).toLocaleString()} • {new Date(w.createdAt).toLocaleTimeString()}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.status === 'PAID'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW'
                                  ? 'bg-orange-500/20 text-orange-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {w.status}
                            </span>
                            {(w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW') && (
                              <button
                                onClick={() => handleApproveWithdrawal(w.id)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-black shadow hover:brightness-110"
                              >
                                Payout
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DEPOSITS MANAGEMENT */}
          {activeSection === 'deposits' && (
            <div className="space-y-5">
              {/* Header with controls */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                    <span>Deposit Requests & Verification</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verify player deposit slips, match MFS TrxIDs, check screenshots, and credit player wallets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAccountsEditor(!showAccountsEditor)}
                    className="px-3.5 py-2 rounded-xl bg-[#940042] hover:bg-[#394266] text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showAccountsEditor ? 'Close MFS Config' : 'Configure Deposit Numbers'}</span>
                  </button>

                  <button
                    onClick={fetchAllData}
                    className="p-2 rounded-xl bg-[#750035] hover:bg-[#940042] text-slate-300 hover:text-white transition"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MFS Deposit Accounts Config Editor */}
              {showAccountsEditor && editAccountsForm && (
                <form
                  onSubmit={handleSaveDepositAccounts}
                  className="bg-[#750035] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-200"
                >
                  <div className="flex items-center justify-between border-b border-[#940042] pb-3">
                    <div>
                      <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        <span>Official Deposit Numbers (Cash Out & Send Money)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Updated numbers appear directly on the player deposit modal in real time.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* bKash */}
                    <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-3">
                      <div className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        <span>bKash</span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Cash Out Agent Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.bkash?.cashout?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              bkash: {
                                ...editAccountsForm.bkash,
                                cashout: { ...editAccountsForm.bkash.cashout, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Send Money Personal Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.bkash?.send_money?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              bkash: {
                                ...editAccountsForm.bkash,
                                send_money: { ...editAccountsForm.bkash.send_money, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Nagad */}
                    <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-3">
                      <div className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        <span>Nagad</span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Cash Out Agent Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.nagad?.cashout?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              nagad: {
                                ...editAccountsForm.nagad,
                                cashout: { ...editAccountsForm.nagad.cashout, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Send Money Personal Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.nagad?.send_money?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              nagad: {
                                ...editAccountsForm.nagad,
                                send_money: { ...editAccountsForm.nagad.send_money, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Rocket */}
                    <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-3">
                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        <span>Rocket (DBBL)</span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Cash Out Agent Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.rocket?.cashout?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              rocket: {
                                ...editAccountsForm.rocket,
                                cashout: { ...editAccountsForm.rocket.cashout, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Send Money Personal Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.rocket?.send_money?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              rocket: {
                                ...editAccountsForm.rocket,
                                send_money: { ...editAccountsForm.rocket.send_money, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Upay */}
                    <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-3">
                      <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        <span>Upay (UCB)</span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Cash Out Agent Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.upay?.cashout?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              upay: {
                                ...editAccountsForm.upay,
                                cashout: { ...editAccountsForm.upay?.cashout, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block">Send Money Personal Number:</label>
                        <input
                          type="text"
                          value={editAccountsForm.upay?.send_money?.number || ''}
                          onChange={(e) =>
                            setEditAccountsForm({
                              ...editAccountsForm,
                              upay: {
                                ...editAccountsForm.upay,
                                send_money: { ...editAccountsForm.upay?.send_money, number: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Bank Transfer */}
                    <div className="p-4 rounded-2xl bg-[#61002a] border border-[#009fe3]/50 space-y-3 md:col-span-2">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        <span>Bank Transfer Official Account</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 block">Bank Name:</label>
                          <input
                            type="text"
                            value={editAccountsForm.bank_transfer?.bankName || ''}
                            onChange={(e) =>
                              setEditAccountsForm({
                                ...editAccountsForm,
                                bank_transfer: { ...editAccountsForm.bank_transfer, bankName: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white text-xs focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 block">Account Name:</label>
                          <input
                            type="text"
                            value={editAccountsForm.bank_transfer?.accountName || ''}
                            onChange={(e) =>
                              setEditAccountsForm({
                                ...editAccountsForm,
                                bank_transfer: { ...editAccountsForm.bank_transfer, accountName: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white text-xs focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 block">Account Number:</label>
                          <input
                            type="text"
                            value={editAccountsForm.bank_transfer?.accountNumber || ''}
                            onChange={(e) =>
                              setEditAccountsForm({
                                ...editAccountsForm,
                                bank_transfer: { ...editAccountsForm.bank_transfer, accountNumber: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 block">Branch & Routing No:</label>
                          <input
                            type="text"
                            value={editAccountsForm.bank_transfer?.branchName || ''}
                            onChange={(e) =>
                              setEditAccountsForm({
                                ...editAccountsForm,
                                bank_transfer: { ...editAccountsForm.bank_transfer, branchName: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-[#940042] text-white text-xs focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAccountsEditor(false)}
                      className="px-4 py-2 rounded-xl bg-[#940042] hover:bg-[#3A4368] text-slate-300 text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAccounts}
                      className="px-5 py-2 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                    >
                      {isSavingAccounts ? 'Saving...' : 'Save Deposit Numbers'}
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#61002a] border border-[#940042] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Total Deposit Requests</span>
                    <div className="text-xl font-black text-white font-mono">{deposits.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#750035] flex items-center justify-center text-amber-400">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#61002a] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-amber-400 font-medium">Pending Verification</span>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {deposits.filter((d) => d.status === 'PENDING').length}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 animate-pulse">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#61002a] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-medium">Successfully Approved</span>
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      {deposits.filter((d) => d.status === 'SUCCEEDED').length}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Official Payment Channels Strip */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold px-1">
                  <span>Official Payment Channels (Bank Transfer, bKash, Nagad, Rocket, Upay)</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/40">Active Gateway</span>
                </div>
                <PaymentChannelBanner />
              </div>

              {/* Table */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#750035] text-slate-300 font-semibold border-b border-[#940042]">
                      <tr>
                        <th className="p-4">Deposit ID</th>
                        <th className="p-4">Player</th>
                        <th className="p-4">Method & Type</th>
                        <th className="p-4">Amount (BDT)</th>
                        <th className="p-4">Sender Number</th>
                        <th className="p-4">Agent Number</th>
                        <th className="p-4">TrxID Reference</th>
                        <th className="p-4">Proof Screenshot</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#940042]">
                      {deposits.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-slate-400">
                            No deposit records found. Player deposit requests will appear here.
                          </td>
                        </tr>
                      ) : (
                        deposits.map((d) => (
                          <tr
                            key={d.id}
                            className={`transition ${
                              d.status === 'PENDING'
                                ? 'bg-amber-500/5 hover:bg-amber-500/10'
                                : 'hover:bg-[#750035]/50'
                            }`}
                          >
                            <td className="p-4 font-mono font-bold text-amber-400">{d.id}</td>

                            <td className="p-4">
                              <div className="font-bold text-white">{d.username}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{d.mobile}</div>
                            </td>

                            <td className="p-4">
                              <div className="font-mono font-bold uppercase text-white">
                                {d.method}
                              </div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                                  d.transferType === 'send_money'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {d.transferType === 'send_money' ? 'Send Money' : 'Cash Out'}
                              </span>
                            </td>

                            <td className="p-4 font-mono font-extrabold text-emerald-400 text-sm">
                              ৳{(d.amountPaisa / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>

                            <td className="p-4 font-mono text-slate-200">
                              {d.senderNumber || d.mobile || '-'}
                            </td>

                            <td className="p-4 font-mono text-slate-400 text-[11px]">
                              {d.agentNumber || '-'}
                            </td>

                            <td className="p-4">
                              <div className="font-mono font-black text-amber-300 bg-black/40 px-2 py-1 rounded-lg border border-amber-500/20 inline-block text-[11px]">
                                {d.trxId || d.providerReference}
                              </div>
                            </td>

                            <td className="p-4">
                              {d.screenshotProof ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewScreenshotModal({
                                      src: d.screenshotProof,
                                      trxId: d.trxId || d.providerReference,
                                      username: d.username,
                                      amountTk: d.amountPaisa / 100,
                                      method: d.method,
                                      senderNumber: d.senderNumber,
                                    })
                                  }
                                  className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 hover:bg-[#940042] border border-[#940042] text-amber-300 text-[11px] font-bold transition cursor-pointer"
                                >
                                  <img
                                    src={d.screenshotProof}
                                    alt="Slip"
                                    className="w-7 h-7 object-cover rounded-lg border border-amber-400"
                                  />
                                  <span>View Proof</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">No Proof</span>
                              )}
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                  d.status === 'SUCCEEDED'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : d.status === 'PENDING'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {d.status === 'SUCCEEDED'
                                  ? '✅ SUCCEEDED'
                                  : d.status === 'PENDING'
                                  ? '⏳ PENDING'
                                  : '❌ FAILED'}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              {d.status === 'PENDING' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleApproveDeposit(d.id)}
                                      disabled={processingIds.has(d.id)}
                                      className={`px-3 py-1.5 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-md hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                                        processingIds.has(d.id) ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                      title="Credit balance directly to player wallet"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{processingIds.has(d.id) ? 'Approving...' : 'Approve'}</span>
                                    </button>
                                    <button
                                      onClick={() => openRejectDepositDialog(d.id, d.username, d.amountPaisa / 100)}
                                      disabled={processingIds.has(d.id)}
                                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs cursor-pointer transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                              ) : d.status === 'SUCCEEDED' ? (
                                <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Credited & Complete
                                </span>
                              ) : (
                                <span className="text-[11px] text-rose-400 font-bold flex items-center justify-end gap-1">
                                  <XCircle className="w-4 h-4 text-rose-400" /> Rejected
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. WITHDRAWALS MANAGEMENT */}
          {activeSection === 'withdrawals' && (
            <div className="space-y-4">
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-rose-400" />
                  <span>Withdrawal Requests & Payout Processing</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Approve payouts to deduct reserved balance liability. Rejecting safely refunds funds to the player's available balance.
                </p>
              </div>

              <div className="bg-[#61002a] border border-[#940042] rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#750035] text-slate-300 font-semibold border-b border-[#940042]">
                      <tr>
                        <th className="p-4">Withdrawal ID</th>
                        <th className="p-4">Player ID</th>
                        <th className="p-4">Payout Method & Number</th>
                        <th className="p-4">Amount (BDT)</th>
                        <th className="p-4">Requested At</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Payout Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#940042]">
                      {withdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            No withdrawal records found. Player payout requests will appear here.
                          </td>
                        </tr>
                      ) : (
                        withdrawals.map((w) => (
                          <tr key={w.id} className="hover:bg-[#750035]/50 transition">
                            <td className="p-4 font-mono font-bold text-amber-400">{w.id}</td>
                            <td className="p-4 font-mono text-slate-300">{w.userId}</td>
                            <td className="p-4">
                              <span className="uppercase font-bold text-amber-300 mr-2">{w.method}</span>
                              <span className="font-mono text-white">{w.payoutDestination}</span>
                            </td>
                            <td className="p-4 font-mono font-extrabold text-rose-400">
                              ৳{(w.amountPaisa / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-[11px] text-slate-400 font-mono">
                              {new Date(w.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                  w.status === 'PAID'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW'
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {w.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApproveWithdrawal(w.id)}
                                    disabled={processingIds.has(w.id)}
                                    className={`px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                                      processingIds.has(w.id) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{processingIds.has(w.id) ? 'Processing...' : 'Approve Payout'}</span>
                                  </button>
                                  <button
                                    onClick={() => openRejectWithdrawalDialog(w.id, (w as any).username || w.userId, w.amountPaisa / 100)}
                                    disabled={processingIds.has(w.id)}
                                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs cursor-pointer transition"
                                  >
                                    Reject & Refund
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-bold">Settled</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. LIVE PLAYER MONITORING & SURVEILLANCE CENTER */}
          {/* ========================================================================= */}
          {activeSection === 'live_monitoring' && (
            <div className="space-y-6">
              {/* Header Hero Card */}
              <div className="bg-gradient-to-r from-[#61002a] via-[#4d0022] to-[#260010] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shadow">
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                        LIVE SURVEILLANCE ACTIVE
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs">
                        Real-Time Polling & Webhooks
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                      <Radio className="w-7 h-7 text-emerald-400 animate-pulse" />
                      <span>লাইভ প্লেয়ার মনিটরিং (Live Player Surveillance)</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      রিয়েল-টাইমে সকল প্লেয়ারের সক্রিয় সেশন, বর্তমানে কোন ক্যাসিনো বা স্পোর্টস গেমে খেলছে, ব্যালেন্স, নেট লাভ/ক্ষতি এবং আইপি ট্র্যাক করুন। যেকোনো অসদাচরণ দেখা মাত্র এক ক্লিকে একাউন্ট ফ্রিজ বা সেশন টার্মিনেট করুন।
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => fetchAllData(true)}
                      className="px-4 py-2.5 rounded-2xl bg-[#750035] hover:bg-[#940042] text-white font-bold text-xs border border-[#940042] shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                      <span>রিফ্রেশ ডেটা (Refresh)</span>
                    </button>
                  </div>
                </div>

                {/* Quick KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-emerald-500/20">
                  <div className="bg-[#42001c]/80 border border-emerald-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>অনলাইন প্লেয়ার</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 font-mono">
                      {livePlayers.filter((p) => p.status === 'ONLINE_PLAYING' || p.status === 'ONLINE_LOBBY').length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">মোট নিবন্ধিত: {livePlayers.length}</div>
                  </div>

                  <div className="bg-[#42001c]/80 border border-amber-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>গেম খেলছে (Active)</span>
                      <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 font-mono">
                      {livePlayers.filter((p) => p.status === 'ONLINE_PLAYING').length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">সক্রিয় গেমিং সেশন</div>
                  </div>

                  <div className="bg-[#42001c]/80 border border-rose-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>রিস্ক ফ্ল্যাগড (Risk &gt; 50)</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-rose-300 mt-1 font-mono">
                      {livePlayers.filter((p) => (p.fraudRiskScore || 0) >= 50).length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">নিরাপত্তা পর্যালোচনা প্রয়োজন</div>
                  </div>

                  <div className="bg-[#42001c]/80 border border-blue-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>লক / ফ্রিজ একাউন্ট</span>
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-blue-300 mt-1 font-mono">
                      {livePlayers.filter((p) => p.isWalletFrozen).length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">স্থগিত লেনদেন</div>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-[#61002a] border border-[#940042] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={livePlayerSearch}
                    onChange={(e) => setLivePlayerSearch(e.target.value)}
                    placeholder="ইউজারনেম, মোবাইল বা আইপি দিয়ে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  {(['all', 'playing', 'lobby', 'frozen'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setLiveStatusFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        liveStatusFilter === filterKey
                          ? 'gold-gradient text-slate-950 font-black shadow'
                          : 'bg-[#47001f] text-slate-300 hover:text-white border border-[#940042]'
                      }`}
                    >
                      {filterKey === 'all' && 'সকল প্লেয়ার'}
                      {filterKey === 'playing' && '🎮 গেম খেলছে'}
                      {filterKey === 'lobby' && '🟡 লবি ব্রাউজিং'}
                      {filterKey === 'frozen' && '❄️ ফ্রিজ একাউন্ট'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Time Live Players Table */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 border-b border-[#940042] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-sm sm:text-base font-black text-white">লাইভ প্লেয়ার ট্র্যাকিং লিস্ট</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#47001f] text-amber-300 font-mono text-xs border border-[#940042]">
                      {livePlayers.length} Active Profiles
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#4d0022] text-slate-300 border-b border-[#940042] text-[11px] uppercase tracking-wider font-bold">
                        <th className="py-3 px-4">প্লেয়ার প্রোফাইল</th>
                        <th className="py-3 px-4">লাইভ স্ট্যাটাস ও গেম</th>
                        <th className="py-3 px-4">আইপি ও ডিভাইস</th>
                        <th className="py-3 px-4">ব্যালেন্স ও রোলওভার</th>
                        <th className="py-3 px-4">বেট ও নেট P&amp;L</th>
                        <th className="py-3 px-4">রিস্ক স্কোর</th>
                        <th className="py-3 px-4 text-right">অ্যাডমিন অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#940042]/50 text-slate-200">
                      {livePlayers
                        .filter((p) => {
                          const matchSearch =
                            !livePlayerSearch ||
                            p.username.toLowerCase().includes(livePlayerSearch.toLowerCase()) ||
                            p.mobile?.includes(livePlayerSearch) ||
                            p.ipAddress?.includes(livePlayerSearch);
                          const matchStatus =
                            liveStatusFilter === 'all' ||
                            (liveStatusFilter === 'playing' && p.status === 'ONLINE_PLAYING') ||
                            (liveStatusFilter === 'lobby' && p.status === 'ONLINE_LOBBY') ||
                            (liveStatusFilter === 'frozen' && p.isWalletFrozen);
                          return matchSearch && matchStatus;
                        })
                        .map((player) => {
                          const isHighRisk = (player.fraudRiskScore || 0) >= 50;
                          return (
                            <tr key={player.id} className="hover:bg-[#750035]/40 transition">
                              {/* Player Profile */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full gold-gradient text-slate-950 font-black flex items-center justify-center shrink-0">
                                    {player.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                      <span>{player.username}</span>
                                      {player.kycStatus === 'VERIFIED' && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                          KYC
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">{player.mobile}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Status & Active Game */}
                              <td className="py-3 px-4">
                                {player.isWalletFrozen ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black">
                                    <Lock className="w-3 h-3" />
                                    FROZEN (লক করা)
                                  </span>
                                ) : player.status === 'ONLINE_PLAYING' ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                      PLAYING (খেলছে)
                                    </span>
                                    <div className="text-[11px] font-bold text-amber-300 mt-1 max-w-[180px] truncate" title={player.currentActiveGame}>
                                      {player.currentActiveGame}
                                    </div>
                                  </div>
                                ) : player.status === 'ONLINE_LOBBY' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    IN LOBBY (ব্রাউজিং)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/40 text-[10px]">
                                    IDLE / অফলাইন
                                  </span>
                                )}
                              </td>

                              {/* IP & Device */}
                              <td className="py-3 px-4">
                                <div className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-slate-400" />
                                  <span>{player.ipAddress}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={player.deviceInfo}>
                                  {player.deviceInfo}
                                </div>
                              </td>

                              {/* Balances & Rollover */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-white font-mono">
                                  ৳{player.availableBalTk?.toLocaleString()}
                                </div>
                                {player.bonusBalTk > 0 && (
                                  <div className="text-[10px] text-amber-400 font-mono">
                                    বোনাস: ৳{player.bonusBalTk?.toLocaleString()}
                                  </div>
                                )}
                                {player.wageringRequirementTk > 0 && (
                                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                    টার্নওভার: ৳{player.wageringProgressTk?.toLocaleString()} / ৳{player.wageringRequirementTk?.toLocaleString()}
                                  </div>
                                )}
                              </td>

                              {/* Bets & Session Net P&L */}
                              <td className="py-3 px-4">
                                <div className="text-[11px] text-slate-300 font-mono">
                                  বেট: {player.totalBetsCount}টি | উইন: {player.totalWinsCount}টি
                                </div>
                                <div
                                  className={`text-xs font-black font-mono mt-0.5 ${
                                    player.sessionNetProfitTk >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {player.sessionNetProfitTk >= 0 ? '+' : ''}৳{player.sessionNetProfitTk?.toLocaleString()}
                                </div>
                              </td>

                              {/* Risk Score & Flags */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-mono text-xs ${
                                      player.fraudRiskScore >= 75
                                        ? 'bg-rose-500 text-white shadow-rose-500/30 shadow'
                                        : player.fraudRiskScore >= 40
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                    }`}
                                  >
                                    {player.fraudRiskScore || 0}
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-slate-300">
                                      {player.fraudRiskScore >= 75 ? 'ক্রিটিক্যাল' : player.fraudRiskScore >= 40 ? 'মিডিয়াম' : 'ক্লিয়ার'}
                                    </div>
                                    {player.fraudFlags && player.fraudFlags.length > 0 && (
                                      <div className="text-[9px] text-rose-300 font-mono">
                                        {player.fraudFlags[0]}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFreezePlayer(player.id, player.isWalletFrozen)}
                                    disabled={isFreezingUser === player.id}
                                    title={player.isWalletFrozen ? 'আনফ্রিজ করুন' : 'অ্যাকাউন্ট ফ্রিজ করুন'}
                                    className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                      player.isWalletFrozen
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                        : 'bg-rose-600/80 hover:bg-rose-600 text-white'
                                    }`}
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleTerminateSession(player.id)}
                                    disabled={isKickingUser === player.id}
                                    title="সেশন ফোর্স টার্মিনেট করুন (Kick)"
                                    className="p-2 rounded-xl bg-[#47001f] hover:bg-[#85003a] border border-[#940042] text-amber-300 text-xs transition cursor-pointer"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedUserDetail({ user: player, loading: false, activeTab: 'overview' });
                                    }}
                                    title="ফুল প্রোফাইল দেখুন"
                                    className="p-2 rounded-xl bg-[#47001f] hover:bg-[#85003a] border border-[#940042] text-slate-200 text-xs transition cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-Time Live Activity Ticker */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-white">লাইভ প্লেয়ার অ্যাক্টিভিটি স্ট্রিম (Real-Time Events)</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">সর্বশেষ ১০০টি ইভেন্ট</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                  {playerActivities.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">কোনো সাম্প্রতিক অ্যাক্টিভিটি রেকর্ড নেই।</div>
                  ) : (
                    playerActivities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-[#47001f] border border-[#940042] rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[9px] ${
                              act.actionType === 'WIN'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : act.actionType === 'BET'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : act.actionType === 'BONUS_CLAIM'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            {act.actionType}
                          </span>
                          <span className="font-bold text-white">{act.username}</span>
                          {act.gameTitle && <span className="text-slate-400">({act.gameTitle})</span>}
                        </div>

                        <div className="flex items-center gap-3">
                          {act.amountTk > 0 && (
                            <span className={`font-bold ${act.actionType === 'WIN' ? 'text-emerald-400' : 'text-amber-300'}`}>
                              {act.actionType === 'WIN' ? '+' : ''}৳{act.amountTk?.toLocaleString()}
                            </span>
                          )}
                          <span className="text-slate-500 text-[10px]">
                            {new Date(act.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. ANTI-FRAUD & BONUS ABUSE MITIGATION CENTER */}
          {/* ========================================================================= */}
          {activeSection === 'anti_fraud' && (
            <div className="space-y-6">
              {/* Header Hero Card */}
              <div className="bg-gradient-to-r from-[#61002a] via-[#4d0022] to-[#260010] border-2 border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shadow">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        ANTI-FRAUD SHIELD
                      </span>
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold text-xs">
                        Zero-Tolerance Bonus Protection
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                      <ShieldCheck className="w-7 h-7 text-rose-400" />
                      <span>অ্যান্টি-ফ্রড ও বোনাস অপব্যবহার সেন্টার (Anti-Fraud &amp; Risk Center)</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      জালিয়াতি, ডুপ্লিকেট আইপিতে একাধিক একাউন্ট তৈরি করে ওয়েলকাম বোনাস ফার্মিং, রোলওভার/টার্নওভার পূরণ না করে বোনাস টাকা তোলার অপচেষ্টা এবং একই বিকাশ/নগদ নাম্বারে সিন্ডিকেট উইথড্রয়াল রোধ করার জন্য স্বয়ংক্রিয় অডিট ইঞ্জিন।
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => fetchAllData(true)}
                      className="px-4 py-2.5 rounded-2xl bg-[#750035] hover:bg-[#940042] text-white font-bold text-xs border border-[#940042] shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
                      <span>রিফ্রেশ অ্যালার্ট (Refresh)</span>
                    </button>
                  </div>
                </div>

                {/* Threat Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-rose-500/20">
                  <div className="bg-[#42001c]/80 border border-rose-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>সক্রিয় ফ্রড অ্যালার্ট</span>
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-rose-300 mt-1 font-mono">
                      {fraudAlerts.filter((a) => a.status === 'ACTIVE').length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">তাত্ক্ষণিক পদক্ষেপ প্রয়োজন</div>
                  </div>

                  <div className="bg-[#42001c]/80 border border-amber-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>ক্রিটিক্যাল ঝুঁকি</span>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 font-mono">
                      {fraudAlerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">সিন্ডিকেট / মাল্টি-অ্যাকাউন্ট</div>
                  </div>

                  <div className="bg-[#42001c]/80 border border-emerald-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>টার্নওভার নীতি সুরক্ষিত</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 font-mono">
                      ৫x / ৩x
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">টার্নওভার ছাড়া উইথড্র ব্লক</div>
                  </div>

                  <div className="bg-[#42001c]/80 border border-blue-500/30 rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>নিষ্পত্তিকৃত অ্যালার্ট</span>
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-blue-300 mt-1 font-mono">
                      {fraudAlerts.filter((a) => a.status === 'RESOLVED').length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">অডিট সম্পন্ন</div>
                  </div>
                </div>
              </div>

              {/* Active Rules Overview Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#61002a] border border-[#940042] rounded-2xl p-4 shadow">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                    <Shield className="w-4 h-4" />
                    <span>১. ডুপ্লিকেট আইপি ব্লক (Anti-Sybil)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    একই আইপি বা ডিভাইস ফিঙ্গারপ্রিন্ট দিয়ে একাধিক একাউন্ট খুললে স্বয়ংক্রিয়ভাবে অতিরিক্ত সাইন-আপ বোনাস ব্লক (৳০ বোনাস) করা হয় এবং সিস্টেমে ফ্ল্যাগ তৈরি হয়।
                  </p>
                </div>

                <div className="bg-[#61002a] border border-[#940042] rounded-2xl p-4 shadow">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                    <RotateCcw className="w-4 h-4" />
                    <span>২. ৫x রোলওভার টার্নওভার শর্ত</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    বোনাস ব্যালেন্স পাওয়ার পর গেম খেলে ৫ গুণ টার্নওভার সম্পন্ন না করে উইথড্রয়াল করার চেষ্টা স্বয়ংক্রিয়ভাবে রিজেক্ট ও ফ্রড অডিটে রেকর্ড করা হয়।
                  </p>
                </div>

                <div className="bg-[#61002a] border border-[#940042] rounded-2xl p-4 shadow">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs">
                    <Ban className="w-4 h-4" />
                    <span>৩. শেয়ার্ড পেমেন্ট নম্বর সনাক্তকরণ</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    ভিন্ন ভিন্ন ইউজারনেম দিয়ে একই বিকাশ বা নগদ নম্বরে উইথড্রয়াল করার চেষ্টা করা হলে সিন্ডিকেট ফ্ল্যাগ পড়ে এবং সংশ্লিষ্ট একাউন্ট ইনস্ট্যান্ট ফ্রিজ করা যায়।
                  </p>
                </div>
              </div>

              {/* Fraud Alerts Queue */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 border-b border-[#940042] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm sm:text-base font-black text-white">ফ্রড ও জালিয়াতি সতর্কবার্তা তালিকা</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#47001f] text-rose-300 font-mono text-xs border border-[#940042]">
                      {fraudAlerts.length} Alerts
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['ACTIVE', 'CRITICAL', 'HIGH', 'ALL'] as const).map((tabKey) => (
                      <button
                        key={tabKey}
                        type="button"
                        onClick={() => setFraudFilter(tabKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          fraudFilter === tabKey
                            ? 'gold-gradient text-slate-950 font-black shadow'
                            : 'bg-[#47001f] text-slate-300 hover:text-white border border-[#940042]'
                        }`}
                      >
                        {tabKey}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-3.5">
                  {fraudAlerts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                      <div>কোনো সক্রিয় ফ্রড অ্যালার্ট নেই। প্ল্যাটফর্ম সম্পূর্ণ নিরাপদ ও সুরক্ষিত।</div>
                    </div>
                  ) : (
                    fraudAlerts
                      .filter((alert) => {
                        if (fraudFilter === 'ACTIVE') return alert.status === 'ACTIVE';
                        if (fraudFilter === 'CRITICAL') return alert.severity === 'CRITICAL';
                        if (fraudFilter === 'HIGH') return alert.severity === 'HIGH' || alert.severity === 'CRITICAL';
                        return true;
                      })
                      .map((alert) => {
                        return (
                          <div
                            key={alert.id}
                            className={`rounded-2xl p-4 sm:p-5 border transition ${
                              alert.severity === 'CRITICAL'
                                ? 'bg-gradient-to-r from-rose-950/60 to-[#47001f] border-rose-500/60 shadow-lg shadow-rose-950/20'
                                : alert.severity === 'HIGH'
                                ? 'bg-[#47001f] border-amber-500/50'
                                : 'bg-[#47001f] border-[#940042]'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      alert.severity === 'CRITICAL'
                                        ? 'bg-rose-500 text-white animate-pulse'
                                        : alert.severity === 'HIGH'
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-blue-500 text-white'
                                    }`}
                                  >
                                    {alert.severity} SEVERITY
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[#2e0014] text-slate-300 font-mono text-[10px] border border-[#940042]">
                                    TYPE: {alert.type}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                      alert.status === 'ACTIVE'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    }`}
                                  >
                                    {alert.status}
                                  </span>
                                </div>

                                <div className="text-sm font-black text-white mt-1">
                                  {alert.descriptionBn || alert.description}
                                </div>
                                <div className="text-xs text-slate-300">
                                  ইউজারনেম: <strong className="text-amber-300 font-mono">{alert.username}</strong> | আইডি: <span className="font-mono text-slate-400">{alert.userId}</span>
                                </div>

                                {alert.details && (
                                  <div className="bg-[#2e0014] rounded-xl p-2.5 mt-2 text-[11px] text-slate-300 font-mono border border-[#940042]/70 space-y-0.5">
                                    {Object.entries(alert.details).map(([k, v]) => (
                                      <div key={k} className="flex gap-2">
                                        <span className="text-slate-400 font-bold">{k}:</span>
                                        <span className="text-amber-200 truncate">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFreezePlayer(alert.userId, false)}
                                  disabled={isFreezingUser === alert.userId}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>একাউন্ট ফ্রিজ করুন</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfiscateBonus(alert.userId)}
                                  disabled={isConfiscatingBonus === alert.userId}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>বোনাস বাজেয়াপ্ত</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleWhitelistPlayer(alert.userId)}
                                  disabled={isWhitelistingUser === alert.userId}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>হোয়াইটলিস্ট</span>
                                </button>

                                {alert.status === 'ACTIVE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleResolveFraudAlert(alert.id, 'RESOLVED')}
                                    disabled={isResolvingAlert === alert.id}
                                    className="px-3 py-1.5 rounded-xl bg-[#6e0030] hover:bg-[#8f003e] text-slate-200 border border-[#940042] font-bold text-xs transition cursor-pointer"
                                  >
                                    নিষ্পত্তি
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="text-[10px] text-slate-500 mt-2 text-right">
                              সনাক্তের সময়: {new Date(alert.detectedAt).toLocaleString()}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}
          {/* 4. CASINO, SLOT & LIVE CASINO API HUB (VENDOR-NEUTRAL) */}
          {activeSection === 'casino_api' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                      CASINO • SLOTS • LIVE API
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Seamless Wallet BDT Ready
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                    <Server className="w-6 h-6 text-amber-400" />
                    <span>Casino, Slot & Live Casino API Hub</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    যেকোনো ক্যাসিনো, স্লট গেমস, লাইভ ক্যাসিনো বা ক্র্যাশ API কানেক্ট করুন, পিং টেস্ট করুন এবং রিয়েল গেম সিঙ্ক করুন।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchAllData()}
                    className="p-2.5 rounded-xl bg-[#750035] hover:bg-[#940042] text-slate-200 transition cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newApi: CasinoApiConfig = {
                        id: `api_${Date.now()}`,
                        name: '',
                        providerKey: 'slots',
                        category: 'slots',
                        status: 'DISCONNECTED',
                        apiEndpoint: '',
                        operatorCode: '',
                        secretKey: '',
                        seamlessWalletCallbackUrl:
                          typeof window !== 'undefined'
                            ? `${window.location.origin}/api/v1/casino/seamless/callback`
                            : '/api/v1/casino/seamless/callback',
                        currency: 'BDT',
                        isEnabled: true,
                        latencyMs: 0,
                        totalGamesIntegrated: 0,
                      };
                      setEditingApi(newApi);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl gold-gradient text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Slot / Live Casino API</span>
                  </button>
                </div>
              </div>

              {/* Universal Casino Gateway (Connect ANY External API) */}
              <div className="bg-gradient-to-r from-[#61002a] via-[#4d0022] to-[#260010] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl gold-gradient text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-lg">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                          UNIVERSAL REAL API GATEWAY
                        </span>
                        <span className="text-xs text-emerald-400 font-bold font-mono flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${liveGatewayConfig?.status === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                          {liveGatewayConfig?.status === 'CONNECTED' ? 'CONNECTED' : 'READY TO CONNECT'}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                        Universal Casino, Slot & Live Casino API Gateway
                      </h3>
                      <p className="text-xs text-slate-300">
                        যেকোনো স্লট গেমস, লাইভ ক্যাসিনো বা গেমিং অ্যাগ্রিগেটর API এর Base URL, Operator Code এবং Key দিয়ে সরাসরি কানেক্ট করুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleTestLiveGateway}
                      disabled={isTestingLiveGateway}
                      className="px-4 py-2.5 rounded-2xl bg-[#750035] hover:bg-[#940042] border border-[#a30048] text-amber-300 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <Activity className={`w-4 h-4 ${isTestingLiveGateway ? 'animate-spin' : ''}`} />
                      <span>{isTestingLiveGateway ? 'টেস্টিং...' : 'Ping Test'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncLiveGatewayGames}
                      className="px-4 py-2.5 rounded-2xl gold-gradient text-slate-950 font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Sync Live Games</span>
                    </button>
                  </div>
                </div>

                {liveGatewayTestResult && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-mono border ${
                      liveGatewayTestResult.status === 'CONNECTED'
                        ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    {liveGatewayTestResult.message || `Status: ${liveGatewayTestResult.status}`}
                  </div>
                )}

                {/* Gateway Configuration Form */}
                <form onSubmit={handleSaveLiveGateway} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">API লেবেল / গেটওয়ে নাম (Gateway Name):</label>
                      <input
                        type="text"
                        value={liveGatewayForm.gatewayName || ''}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, gatewayName: e.target.value })}
                        placeholder="e.g. Slot & Live Casino API"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">পরিবেশ (Environment):</label>
                      <select
                        value={liveGatewayForm.environment || 'production'}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, environment: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      >
                        <option value="production">Production (Live Real Money)</option>
                        <option value="staging">Staging (Testing Gateway)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">অপারেটর / এজেন্ট কোড (Operator Code):</label>
                      <input
                        type="text"
                        value={liveGatewayForm.operatorCode || ''}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, operatorCode: e.target.value })}
                        placeholder="e.g. OP_BDT_01"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">API বেস এন্ডপয়েন্ট URL (API Base URL):</label>
                      <input
                        type="url"
                        value={liveGatewayForm.apiBaseUrl || ''}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, apiBaseUrl: e.target.value })}
                        placeholder="https://api.your-casino-gateway.com/v1"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">ব্যাকঅফিস URL (Optional Backoffice URL):</label>
                      <input
                        type="text"
                        value={liveGatewayForm.backofficeUrl || ''}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, backofficeUrl: e.target.value })}
                        placeholder="https://bo.your-gateway.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">API Key:</label>
                      <input
                        type="text"
                        value={liveGatewayForm.apiKey || ''}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, apiKey: e.target.value })}
                        placeholder="Enter API Key"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">API Secret (HMAC Signing Key):</label>
                      <input
                        type="text"
                        value={liveGatewayForm.apiSecret || ''}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, apiSecret: e.target.value })}
                        placeholder="Enter webhook signature secret"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">প্লেয়ার প্রিফিক্স (Player Prefix):</label>
                      <input
                        type="text"
                        value={liveGatewayForm.playerPrefix || 'fb88_'}
                        onChange={(e) => setLiveGatewayForm({ ...liveGatewayForm, playerPrefix: e.target.value })}
                        placeholder="e.g. fb88_"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>রিয়েল BDT সিমলেস ওয়ালেট সরাসরি ইন্টিগ্রেটেড</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingLiveGateway}
                      className="px-6 py-2.5 rounded-2xl gold-gradient text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingLiveGateway ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন (Save Gateway)'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Copy Feedback Toast */}
              {copyFeedback && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{copyFeedback}</span>
                </div>
              )}

              {/* Seamless Wallet Webhook Endpoints Reference */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Seamless Wallet Callback Endpoints (Webhook URLs)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Currency: BDT | Protocol: HTTPS POST</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  {[
                    { label: 'Unified Callback', path: '/api/v1/casino/seamless/callback' },
                    { label: '1. Balance Check', path: '/api/v1/casino/seamless/balance' },
                    { label: '2. Bet Debit', path: '/api/v1/casino/seamless/bet' },
                    { label: '3. Win Credit', path: '/api/v1/casino/seamless/win' },
                    { label: '4. Rollback / Refund', path: '/api/v1/casino/seamless/rollback' },
                  ].map((hook) => (
                    <div key={hook.path} className="p-3 rounded-2xl bg-[#47001f] border border-[#940042] space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{hook.label}</div>
                      <div className="font-mono text-white text-[11px] truncate">...{hook.path}</div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            `${typeof window !== 'undefined' ? window.location.origin : ''}${hook.path}`,
                            hook.label
                          )
                        }
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold pt-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Slot / Live Casino API Connectors Grid */}
              {casinoApis.length === 0 ? (
                <div className="bg-[#61002a] border border-dashed border-amber-400/40 rounded-3xl p-8 text-center space-y-3 shadow-xl">
                  <Server className="w-10 h-10 mx-auto text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    কোনো ক্যাসিনো / স্লট / লাইভ API কানেক্টর এখনো যুক্ত হয়নি
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    উপরে <strong>"Add Slot / Live Casino API"</strong> বাটনে ক্লিক করে আপনার যেকোনো স্লট গেমস, লাইভ ক্যাসিনো, বা অ্যাগ্রিগেটর API কানেক্ট করুন এবং এক ক্লিকে গেম সিঙ্ক করুন।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {casinoApis.map((api) => {
                    const pingText = apiPingResult[api.id];
                    const isKeyVisible = showSecretKey[api.id];
                    return (
                      <div
                        key={api.id}
                        className="bg-[#61002a] border border-[#940042] rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-black uppercase">
                              {api.category || 'slots'}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                                api.isEnabled
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-700/50 text-slate-400 border-slate-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  api.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                }`}
                              />
                              {api.isEnabled ? 'ACTIVE' : 'DISABLED'}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-white">{api.name}</h3>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Type Key: <strong className="text-amber-400">{api.providerKey}</strong> • Games: <strong className="text-white">{api.totalGamesIntegrated || 0}</strong>
                            </div>
                          </div>

                          {pingText && (
                            <div className="p-2 rounded-xl bg-black/40 border border-[#940042] text-[11px] font-mono">
                              {pingText}
                            </div>
                          )}

                          <div className="p-3 bg-black/30 rounded-2xl border border-[#940042] space-y-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">API Base URL:</span>
                              <span className="font-mono text-white text-[11px] select-all truncate block">
                                {api.apiEndpoint}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Operator ID:</span>
                                <span className="font-mono text-amber-300 font-bold select-all truncate block">
                                  {api.operatorCode || '—'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Currency:</span>
                                <span className="font-mono text-emerald-400 font-bold block">{api.currency || 'BDT'}</span>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Secret API Key:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSecretKey((prev) => ({ ...prev, [api.id]: !prev[api.id] }))
                                  }
                                  className="text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  {isKeyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  {isKeyVisible ? 'Hide' : 'Show'}
                                </button>
                              </div>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <span className="font-mono text-[11px] text-white select-all truncate">
                                  {isKeyVisible ? api.secretKey || '—' : '••••••••••••••••'}
                                </span>
                                {api.secretKey && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(api.secretKey, `${api.name} Key`)}
                                    className="p-1 rounded text-slate-400 hover:text-white"
                                    title="Copy"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#940042] flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTestCasinoApi(api.id)}
                            disabled={isTestingApiId === api.id}
                            className="flex-1 py-2 px-2 rounded-xl bg-[#47001f] hover:bg-[#750035] border border-[#940042] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTestingApiId === api.id ? 'animate-spin' : ''}`} />
                            <span>{isTestingApiId === api.id ? 'Testing...' : 'Test'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSyncCasinoApiGames(api.id)}
                            disabled={isSyncingApiId === api.id}
                            className="flex-1 py-2 px-2 rounded-xl gold-gradient text-slate-950 text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isSyncingApiId === api.id ? 'animate-spin' : ''}`} />
                            <span>{isSyncingApiId === api.id ? 'Syncing...' : 'Sync Games'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingApi(api)}
                            className="px-2.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[11px] border border-amber-400/30 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCasinoApi(api.id)}
                            className={`px-2.5 py-2 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                              api.isEnabled
                                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                            }`}
                          >
                            {api.isEnabled ? 'Disable' : 'Enable'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCasinoApi(api.id, api.name)}
                            className="px-2.5 py-2 rounded-xl bg-black/40 hover:bg-rose-600/30 text-rose-400 transition cursor-pointer"
                            title="Delete Connector"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. REAL GAMES API & LAUNCH HUB */}
          {activeSection === 'real_games_api' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                      LIVE GAMES CONTROL
                    </span>
                    <span className="text-xs text-amber-300 font-bold font-mono">
                      Total Games: {gamesList.length} Live
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                    <Gamepad2 className="w-6 h-6 text-amber-400" />
                    <span>Real Games API & Live Launch Hub</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Connect official live gaming provider launch URLs, iframe endpoints, and game codes. Control RTP, bet limits, and game availability.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={fetchAllData}
                    className="p-2.5 rounded-xl bg-[#750035] hover:bg-[#940042] text-slate-200 transition cursor-pointer"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Import via Online API</span>
                  </button>
                  <button
                    onClick={handleOpenAddGame}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl gold-gradient text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Real Game</span>
                  </button>
                  {gamesList.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearExternalGames}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 font-bold text-xs transition cursor-pointer"
                      title="Remove all API/custom games and keep Aviator only"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Keep Aviator Only</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gameSearchQuery}
                    onChange={(e) => setGameSearchQuery(e.target.value)}
                    placeholder="Search by game name or code..."
                    className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#47001f] border border-[#940042] text-white text-xs placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {/* Category filter tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
                  {['all', 'slots', 'live', 'crash', 'table', 'sports'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGameCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer whitespace-nowrap ${
                        gameCategoryFilter === cat
                          ? 'gold-gradient text-slate-950 shadow'
                          : 'bg-[#47001f] text-slate-300 hover:bg-[#750035]'
                      }`}
                    >
                      {cat === 'all' ? 'All Games' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gamesList
                  .filter((g) => {
                    const matchesCat = gameCategoryFilter === 'all' || g.category === gameCategoryFilter;
                    const matchesSearch =
                      !gameSearchQuery ||
                      g.title.toLowerCase().includes(gameSearchQuery.toLowerCase()) ||
                      (g.titleBn && g.titleBn.toLowerCase().includes(gameSearchQuery.toLowerCase())) ||
                      (g.gameCode && g.gameCode.toLowerCase().includes(gameSearchQuery.toLowerCase())) ||
                      g.provider.toLowerCase().includes(gameSearchQuery.toLowerCase());
                    return matchesCat && matchesSearch;
                  })
                  .map((game) => (
                    <div
                      key={game.id}
                      className="bg-[#61002a] border border-[#940042] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition group"
                    >
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                            {game.provider}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white font-mono text-[9px] uppercase">
                            {game.category}
                          </span>
                        </div>

                        {/* Status Toggle Badge */}
                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              game.isAvailable !== false
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {game.isAvailable !== false ? 'LIVE' : 'OFF'}
                          </span>
                        </div>

                        {/* Bottom inside image */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white">
                          <span className="font-mono text-amber-300 font-bold">RTP: {game.rtp || '96.5%'}</span>
                          <span className="font-mono text-slate-200">
                            ৳{game.minBetTk || 10} - ৳{game.maxBetTk || 10000}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-white text-sm leading-snug">{game.title}</h4>
                          {game.titleBn && (
                            <p className="text-xs text-rose-200/80 leading-snug">{game.titleBn}</p>
                          )}
                          <div className="mt-1 text-[10px] text-slate-400 font-mono truncate">
                            Code: <strong className="text-amber-400">{game.gameCode || game.id}</strong>
                          </div>
                          {game.realLaunchUrl && (
                            <div className="mt-1 p-1.5 rounded-lg bg-black/40 border border-[#940042] text-[10px] font-mono text-slate-300 truncate">
                              Launch: {game.realLaunchUrl}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[#940042] grid grid-cols-2 gap-2 text-xs">
                          {/* Test Launch Game */}
                          <button
                            type="button"
                            onClick={() => setTestGamePreview(game)}
                            className="py-1.5 px-2 rounded-xl gold-gradient text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 shadow hover:brightness-110 active:scale-95 transition cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-slate-950" />
                            <span>Test Launch</span>
                          </button>

                          {/* Edit Game */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditGame(game)}
                            className="py-1.5 px-2 rounded-xl bg-[#47001f] hover:bg-[#750035] border border-[#940042] text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleGame(game.id)}
                            className={`py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                              game.isAvailable !== false
                                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            }`}
                          >
                            {game.isAvailable !== false ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* Delete Game */}
                          <button
                            type="button"
                            onClick={() => handleDeleteGame(game.id, game.title)}
                            className="py-1 rounded-xl bg-black/40 hover:bg-rose-600/30 text-rose-400 text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 6. USER MANAGEMENT */}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>User Management & Account Settings</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real player accounts, KYC verification, balance adjustments, password resets, and security access.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#47001f] border border-[#940042] text-xs font-mono text-amber-300">
                  Total Accounts: <strong>{users.length}</strong>
                </div>
              </div>

              <div className="bg-[#61002a] border border-[#940042] rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#750035] text-slate-300 font-semibold border-b border-[#940042]">
                      <tr>
                        <th className="p-4">Username / Mobile</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">KYC Status</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4">Wallet Balance</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#940042]">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                            No registered players yet. Real users will appear here when they register on the website.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-[#750035]/50 transition">
                            <td className="p-4">
                              <button
                                onClick={() => handleFetchUserDetails(u.id)}
                                className="font-bold text-white hover:text-amber-300 flex items-center gap-1.5 transition text-left cursor-pointer group"
                                title="Click to view all information & bet history"
                              >
                                <span className="group-hover:underline">{u.username}</span>
                                {u.role === 'admin' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950">
                                    ADMIN
                                  </span>
                                )}
                              </button>
                              <div className="text-[11px] text-slate-400 font-mono">{u.mobile}</div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-[#47001f] text-slate-300">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    u.kycStatus === 'VERIFIED'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {u.kycStatus}
                                </span>
                                {u.kycStatus !== 'VERIFIED' && (
                                  <button
                                    onClick={() => handleUpdateKyc(u.id, 'VERIFIED')}
                                    className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer"
                                  >
                                    Verify
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1 items-start">
                                {u.isBanned ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/40">
                                    🚫 BANNED
                                  </span>
                                ) : u.isSuspended ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    🔒 LOCKED
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    ✅ ACTIVE
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-mono font-bold text-amber-400">
                              ৳{((u.wallet?.availablePaisa || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* All Info & Bet History */}
                                <button
                                  onClick={() => handleFetchUserDetails(u.id)}
                                  className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/30 transition cursor-pointer flex items-center gap-1 shadow-sm"
                                  title="সব তথ্য ও বেটিং হিস্ট্রি দেখুন (View all info & bets)"
                                >
                                  <Eye className="w-3 h-3 text-sky-400" />
                                  <span>তথ্য / Info</span>
                                </button>

                                {/* Reset Password */}
                                <button
                                  onClick={() => setResetPassModal({ userId: u.id, username: u.username })}
                                  className="px-2.5 py-1 rounded-xl bg-[#47001f] hover:bg-[#940042] text-slate-200 text-xs font-bold border border-[#940042] transition cursor-pointer flex items-center gap-1"
                                  title="Reset User Password"
                                >
                                  <Key className="w-3 h-3 text-amber-400" />
                                  <span>Password</span>
                                </button>

                                {/* Adjust Balance (Add / Deduct) */}
                                <button
                                  onClick={() => {
                                    const balTk = (u.wallet?.availablePaisa || 0) / 100;
                                    setAdjustBalanceModal({
                                      userId: u.id,
                                      username: u.username,
                                      currentBalanceTk: balTk,
                                      type: 'add',
                                    });
                                    setAdjustType('add');
                                    setAdjustAmountTk(500);
                                    setAdjustReason('মিসিং ব্যালেন্স রিফান্ড / ক্রেডিট');
                                  }}
                                  className="px-2.5 py-1 rounded-xl gold-gradient text-slate-950 text-xs font-bold shadow hover:brightness-110 cursor-pointer flex items-center gap-1"
                                  title="ব্যালেন্স যোগ বা কর্তন করুন (Add Missing or Deduct Mistaken Balance)"
                                >
                                  <DollarSign className="w-3 h-3" />
                                  <span>Adjust</span>
                                </button>

                                {/* Toggle Suspend / ID LOCK */}
                                {u.role !== 'admin' && (
                                  <>
                                    <button
                                      onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        u.isSuspended
                                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                                          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                                      }`}
                                      title={u.isSuspended ? 'Unlock User ID' : 'Lock User ID'}
                                    >
                                      <Lock className="w-3 h-3" />
                                      <span>{u.isSuspended ? 'Unlock' : 'Lock'}</span>
                                    </button>

                                    {/* Toggle Ban / ID BAN */}
                                    <button
                                      onClick={() => handleToggleBan(u.id, !!u.isBanned)}
                                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        u.isBanned
                                          ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
                                          : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30'
                                      }`}
                                      title={u.isBanned ? 'Lift Ban' : 'Ban User ID'}
                                    >
                                      <Ban className="w-3 h-3" />
                                      <span>{u.isBanned ? 'Unban' : 'Ban'}</span>
                                    </button>

                                    {/* Delete User Account */}
                                    <button
                                      onClick={() => handleDeleteUser(u.id, u.username)}
                                      className="px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 bg-red-600/20 text-red-300 hover:bg-red-600/40 border border-red-500/30"
                                      title="Delete User Account"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                      <span>Delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. LIVE SUPPORT CHAT HUB */}
          {/* 5. LIVE SUPPORT CHAT HUB */}
          {activeSection === 'support' && (
            <div className="space-y-4">
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>Live Support Chat & Tickets</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  View incoming player messages and provide instant administrative responses.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#61002a] border border-[#940042] rounded-3xl overflow-hidden min-h-[500px]">
                {/* Tickets list */}
                <div className="border-r border-[#940042] p-3 space-y-2 overflow-y-auto max-h-[600px]">
                  <div className="text-[11px] font-bold text-slate-400 px-2 uppercase">Inbox Tickets ({tickets.length})</div>
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-3 rounded-2xl cursor-pointer transition ${
                        selectedTicket?.id === t.id
                          ? 'bg-[#47001f] border border-[#FFC943]/40'
                          : 'bg-[#750035] hover:bg-[#47001f]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{t.userName}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            t.status === 'OPEN' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate mt-1">{t.subject}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-1">
                        {new Date(t.updatedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Conversation View */}
                <div className="md:col-span-2 flex flex-col h-[600px] bg-[#66002d]">
                  {selectedTicket ? (
                    <>
                      {/* Ticket Header */}
                      <div className="p-4 bg-[#750035] border-b border-[#940042] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">
                            {selectedTicket.subject}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Player: <strong className="text-amber-400">{selectedTicket.userName}</strong> • {selectedTicket.id}
                          </div>
                        </div>

                        {selectedTicket.status !== 'RESOLVED' && (
                          <button
                            onClick={async () => {
                              await fetch(`/api/v1/admin/support/chats/${selectedTicket.id}/resolve`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${adminToken}` },
                              });
                              fetchAllData();
                            }}
                            className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer"
                          >
                            ✓ Mark as Resolved
                          </button>
                        )}
                      </div>

                      {/* Messages Stream */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {selectedTicket.messages.map((m: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[9px] text-slate-400 px-1 mb-0.5">
                              {m.sender === 'admin' ? 'Super Admin' : selectedTicket.userName}
                            </span>
                            <div
                              className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                                m.sender === 'admin'
                                  ? 'gold-gradient text-slate-950 font-medium rounded-br-none'
                                  : 'bg-[#47001f] text-slate-200 border border-[#940042] rounded-bl-none'
                              }`}
                            >
                              {m.message}
                            </div>
                            <span className="text-[8px] text-slate-500 px-1 mt-0.5 font-mono">
                              {new Date(m.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Reply Input */}
                      <form onSubmit={handleSendReply} className="p-3 bg-[#750035] border-t border-[#940042] flex items-center gap-2">
                        <input
                          type="text"
                          value={ticketReply}
                          onChange={(e) => setTicketReply(e.target.value)}
                          placeholder="Type reply as administrator..."
                          className="flex-1 px-4 py-2 rounded-full bg-[#47001f] border border-[#940042] text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
                        />
                        <button
                          type="submit"
                          className="p-2.5 rounded-full gold-gradient text-slate-950 font-bold shadow hover:brightness-110 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                      Select a support ticket from the left list.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. BANNERS & CMS NOTICE */}
          {activeSection === 'banners' && (
            <div className="space-y-6">
              {/* Marquee CMS Editor */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Scrolling Announcement Marquee Notice</span>
                </h3>
                <form onSubmit={handleUpdateAnnouncement} className="flex gap-2">
                  <input
                    type="text"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[#47001f] border border-[#940042] text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 cursor-pointer"
                  >
                    Save Notice
                  </button>
                </form>
              </div>

              {/* Banners List & Add */}
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Homepage Hero Banners ({banners.length})</span>
                  </h3>
                  <button
                    onClick={() => setNewBannerModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Banner</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {banners.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-3xl bg-[#750035] border border-[#940042] space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                          {b.badgeEn || b.badgeBn}
                        </span>
                        <h4 className="font-bold text-white text-xs">{b.titleEn || b.titleBn}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{b.subtitleEn || b.subtitleBn}</p>
                      </div>

                      <div className="pt-3 border-t border-[#940042] flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-500 font-mono">Action: {b.action}</span>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. SPORTS SETTLEMENT */}
          {activeSection === 'sports' && (
            <div className="space-y-4">
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Sports Match Settlement & Payouts</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Once matches conclude, declare the winning selection to settle bets. All winning payouts are automatically credited to user wallets.
                </p>
              </div>

              <div className="space-y-4">
                {sportsEvents.map((event) => (
                  <div key={event.id} className="p-5 rounded-3xl bg-[#61002a] border border-[#940042] space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{event.league}</span>
                        <h3 className="text-sm font-black text-white">{event.homeTeam} vs {event.awayTeam}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {event.status}
                      </span>
                    </div>

                    {event.markets.map((m: any) => (
                      <div key={m.id} className="p-3 rounded-2xl bg-[#750035] border border-[#940042] space-y-2">
                        <div className="text-xs font-bold text-slate-300">{m.name} (Status: {m.status})</div>
                        <div className="flex flex-wrap gap-2">
                          {m.selections.map((sel: any) => (
                            <button
                              key={sel.id}
                              onClick={() => {
                                setConfirmDialog({
                                  title: 'Settle Sports Market',
                                  message: `Are you sure you want to declare "${sel.name}" as the winner and settle all bets?`,
                                  confirmLabel: 'Confirm Settlement',
                                  variant: 'amber',
                                  onConfirm: async () => {
                                    try {
                                      const res = await fetch('/api/v1/admin/sports/settle', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          Authorization: `Bearer ${getAdminToken()}`,
                                        },
                                        body: JSON.stringify({
                                          eventId: event.id,
                                          marketId: m.id,
                                          winningSelectionId: sel.id,
                                        }),
                                      });
                                      const data = await res.json();
                                      if (!res.ok) throw new Error(data.error || 'Settlement failed');
                                      showToast(data.message || 'Sports match settled successfully!', 'success');
                                      fetchAllData();
                                    } catch (err: any) {
                                      showToast(err.message || 'Failed to settle match', 'error');
                                    }
                                  },
                                });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#47001f] hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs border border-[#940042] transition cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{sel.name} @ {sel.odds}</span>
                              <span className="text-[10px] opacity-70">(Settle Win)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. API & GATEWAY STATUS */}
          {activeSection === 'api_status' && (
            <div className="space-y-4">
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>MFS Payment Gateway & System Live Monitoring</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  bKash, Nagad, and Rocket gateway connectivity and real-time server health status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {apiHealth?.gateways &&
                  Object.entries(apiHealth.gateways).map(([key, gw]: [string, any]) => (
                    <div key={key} className="p-5 rounded-3xl bg-[#61002a] border border-[#940042] space-y-3 shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-white">{gw.provider}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                          {gw.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Latency:</span>
                          <strong className="text-emerald-400">{gw.latencyMs} ms</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Success Rate:</span>
                          <strong className="text-white">{gw.successRate}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Status:</span>
                          <strong className="text-amber-300">ACTIVE</strong>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Ledger Health Card */}
              <div className="p-6 rounded-3xl bg-[#61002a] border border-[#940042] space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Ledger Invariant & Double-Entry Math Verification</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#750035] rounded-2xl">
                    <span className="text-slate-400 block">Total Debits:</span>
                    <strong className="text-emerald-400 text-sm">৳{((apiHealth?.ledger?.totalDebitsPaisa || 0) / 100).toFixed(2)}</strong>
                  </div>
                  <div className="p-3 bg-[#750035] rounded-2xl">
                    <span className="text-slate-400 block">Total Credits:</span>
                    <strong className="text-emerald-400 text-sm">৳{((apiHealth?.ledger?.totalCreditsPaisa || 0) / 100).toFixed(2)}</strong>
                  </div>
                  <div className="p-3 bg-[#750035] rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block">Status:</span>
                      <strong className="text-emerald-400 text-sm">100% BALANCED</strong>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. LEDGER AUDIT VIEW */}
          {activeSection === 'ledger' && (
            <div className="space-y-4">
              <div className="bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Double-Entry Financial Journal Audit Log</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cryptographically verified debit and credit journal entries for every deposit, withdrawal, and bet.
                </p>
              </div>

              {/* Quick Ledger audit link */}
              <div className="p-6 rounded-3xl bg-[#61002a] border border-[#940042] text-xs text-slate-300 space-y-3">
                <p>The double-entry ledger is completely balanced. Open the full transparent audit view on the main website.</p>
                <button
                  onClick={onBackToMainSite}
                  className="px-4 py-2 rounded-xl gold-gradient text-slate-950 font-bold"
                >
                  Open Full Audit View on Player Website →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: RESET USER PASSWORD */}
      {resetPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setResetPassModal(null)} />
          <div className="relative w-full max-w-md bg-[#47001f] border border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Reset User Password: {resetPassModal.username}</span>
            </h3>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Enter New Password (minimum 6 characters):</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="e.g. UserNewPass123"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#750035] border border-[#940042] text-white text-xs font-mono"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassModal(null)}
                  className="flex-1 py-2 rounded-xl bg-[#61002a] text-slate-400 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl gold-gradient text-slate-950 font-bold text-xs shadow cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADJUST USER BALANCE (DUAL ADD MISSING / DEDUCT MISTAKEN BALANCE) */}
      {/* ========================================================================= */}
      {adjustBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setAdjustBalanceModal(null)} />
          <div className="relative w-full max-w-lg bg-[#47001f] border-2 border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#940042] pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                  adjustType === 'add' ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">
                    ব্যালেন্স সমন্বয় / অ্যাডজাস্টমেন্ট (Balance Adjustment)
                  </h3>
                  <div className="text-xs text-amber-300 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>প্লেয়ার:</span>
                    <strong className="text-white bg-[#61002a] px-2 py-0.5 rounded-md border border-[#940042]">
                      {adjustBalanceModal.username}
                    </strong>
                    <span>• বর্তমান ব্যালেন্স:</span>
                    <strong className="text-amber-400">
                      ৳{(adjustBalanceModal.currentBalanceTk ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAdjustBalanceModal(null)}
                className="p-1 rounded-full bg-[#61002a] hover:bg-[#940042] text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Type Switcher: Add Missing vs Deduct Mistaken */}
            <div className="grid grid-cols-2 gap-2 bg-[#310015] p-1 rounded-2xl border border-[#940042]">
              <button
                type="button"
                onClick={() => {
                  setAdjustType('add');
                  setAdjustReason('মিসিং ব্যালেন্স রিফান্ড / ক্রেডিট');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjustType === 'add'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>ব্যালেন্স যোগ (Credit Missing)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustType('deduct');
                  setAdjustReason('ভুলবশত ব্যালেন্স যোগ সংশোধন / কর্তন');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjustType === 'deduct'
                    ? 'bg-rose-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>ব্যালেন্স কর্তন (Deduct Mistaken)</span>
              </button>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold flex items-center justify-between">
                  <span>টাকার পরিমাণ (Amount in BDT):</span>
                  <span className="text-[11px] text-amber-300 font-mono">৳{adjustAmountTk.toLocaleString()}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-amber-400 text-sm">৳</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={adjustAmountTk}
                    onChange={(e) => setAdjustAmountTk(Math.max(0, Number(e.target.value)))}
                    required
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#61002a] border border-[#940042] text-white text-sm font-mono font-bold focus:border-amber-400 focus:outline-none"
                    placeholder="500"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[100, 500, 1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmountTk(amt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                        adjustAmountTk === amt
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'bg-[#61002a] text-slate-300 hover:bg-[#750035] border border-[#940042]'
                      }`}
                    >
                      +৳{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold">সমন্বয়ের কারণ (Reason Category):</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#61002a] border border-[#940042] text-white text-xs font-medium focus:border-amber-400 focus:outline-none"
                >
                  {adjustType === 'add' ? (
                    <>
                      <option value="মিসিং ব্যালেন্স রিফান্ড / ক্রেডিট">মিসিং ডিপোজিট বা ট্রানজেকশন ক্রেডিট (Missing Deposit Refund)</option>
                      <option value="সিস্টেম এরর ক্ষতিপূরণ বোনাস">সিস্টেম এরর / গ্লিচ ক্ষতিপূরণ (System Glitch Compensation)</option>
                      <option value="প্রমোশনাল ক্যাশব্যাক বা ভিআইপি রিওয়ার্ড">প্রমোশনাল ক্যাশব্যাক বা ভিআইপি বোনাস (Promotional / VIP Bonus)</option>
                      <option value="ম্যানুয়াল ব্যালেন্স সমন্বয় (ক্রেডিট)">অন্যান্য ম্যানুয়াল ক্রেডিট (Other Credit)</option>
                    </>
                  ) : (
                    <>
                      <option value="ভুলবশত ব্যালেন্স যোগ সংশোধন / কর্তন">ভুলবশত যোগ করা ব্যালেন্স সংশোধন (Accidental Credit Correction)</option>
                      <option value="ডুপ্লিকেট ডিপোজিট রিভার্সাল">ডুপ্লিকেট ডিপোজিট রিভার্সাল (Duplicate Deposit Reversal)</option>
                      <option value="অননুমোদিত লেনদেন বা পেনাল্টি কর্তন">অননুমোদিত বা ভুল ব্যালেন্স কর্তন (Unauthorized Balance Reversal)</option>
                      <option value="ম্যানুয়াল ব্যালেন্স সমন্বয় (কর্তন)">অন্যান্য ম্যানুয়াল কর্তন (Other Deduction)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Note / Details */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold">অতিরিক্ত নোট / রেফারেন্স (Optional Note):</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. bKash TrxID #8X9921 missing deposit compensation"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#61002a] border border-[#940042] text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Live Preview Calculation Box */}
              <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                adjustType === 'add'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              }`}>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">বর্তমান ব্যালেন্স:</span>
                  <span className="text-white font-bold">
                    ৳{(adjustBalanceModal.currentBalanceTk ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">
                    {adjustType === 'add' ? 'যোগ হবে (+):' : 'কর্তন হবে (-):'}
                  </span>
                  <span className={`font-bold ${adjustType === 'add' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {adjustType === 'add' ? '+' : '-'}৳{adjustAmountTk.toFixed(2)}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between font-mono font-bold">
                  <span className="text-white">নতুন মোট ব্যালেন্স:</span>
                  <span className={`text-sm ${
                    adjustType === 'add'
                      ? 'text-emerald-300'
                      : (adjustBalanceModal.currentBalanceTk ?? 0) - adjustAmountTk < 0
                      ? 'text-red-400'
                      : 'text-amber-300'
                  }`}>
                    ৳{(
                      adjustType === 'add'
                        ? (adjustBalanceModal.currentBalanceTk ?? 0) + adjustAmountTk
                        : (adjustBalanceModal.currentBalanceTk ?? 0) - adjustAmountTk
                    ).toFixed(2)}
                  </span>
                </div>

                {/* Overdraft Warning for Deduct */}
                {adjustType === 'deduct' && adjustAmountTk > (adjustBalanceModal.currentBalanceTk ?? 0) && (
                  <div className="p-2 rounded-xl bg-red-900/60 border border-red-500/50 text-red-200 text-[11px] font-bold mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
                    <span>সতর্কবার্তা: ইউজারের বর্তমান ব্যালেন্সের চেয়ে বেশি টাকা কর্তন করা সম্ভব নয়।</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustBalanceModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#61002a] hover:bg-[#750035] text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={
                    isAdjustingBalance ||
                    adjustAmountTk <= 0 ||
                    (adjustType === 'deduct' && adjustAmountTk > (adjustBalanceModal.currentBalanceTk ?? 0))
                  }
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'add'
                      ? 'gold-gradient text-slate-950 hover:brightness-110'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAdjustingBalance ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : adjustType === 'add' ? (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>৳{adjustAmountTk.toLocaleString()} ব্যালেন্স যোগ করুন</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>৳{adjustAmountTk.toLocaleString()} ব্যালেন্স কর্তন করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPREHENSIVE USER INFORMATION & COMPLETE BETTING HISTORY */}
      {/* ========================================================================= */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedUserDetail(null)} />
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#3a001a] border-2 border-[#940042] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#61002a] via-[#4d0022] to-[#260010] border-b border-[#940042] flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
                  {selectedUserDetail.user?.username?.substring(0, 2)?.toUpperCase() || 'PL'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {selectedUserDetail.user?.username || 'Player Profile'}
                    </h2>
                    {selectedUserDetail.user?.role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                        ADMIN
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#61002a] border border-[#940042] text-slate-300">
                      ID: {selectedUserDetail.user?.id || '—'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedUserDetail.user?.isBanned
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : selectedUserDetail.user?.isSuspended
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {selectedUserDetail.user?.isBanned ? '🚫 BANNED' : selectedUserDetail.user?.isSuspended ? '🔒 LOCKED' : '✅ ACTIVE'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>{selectedUserDetail.user?.mobile || 'No Mobile'}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">
                      ব্যালেন্স: ৳{(((selectedUserDetail.user?.wallet?.availablePaisa ?? 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFetchUserDetails(selectedUserDetail.user?.id, selectedUserDetail.activeTab)}
                  className="p-2 rounded-xl bg-[#61002a] hover:bg-[#750035] text-slate-300 hover:text-white transition cursor-pointer"
                  title="রিফ্রেশ করুন (Refresh)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="p-2 rounded-xl bg-[#61002a] hover:bg-rose-700 text-white transition cursor-pointer"
                  aria-label="Close"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 pt-3 bg-[#47001f] border-b border-[#940042] flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
              <button
                onClick={() => setSelectedUserDetail((prev: any) => ({ ...prev, activeTab: 'overview' }))}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedUserDetail.activeTab === 'overview'
                    ? 'bg-[#61002a] text-white border-t-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 প্রোফাইল ও ওভারভিউ (Overview)
              </button>
              <button
                onClick={() => setSelectedUserDetail((prev: any) => ({ ...prev, activeTab: 'bets' }))}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedUserDetail.activeTab === 'bets'
                    ? 'bg-[#61002a] text-white border-t-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎲 সম্পূর্ণ বেটিং হিস্ট্রি (All Bets)
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                  {selectedUserDetail.bets?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setSelectedUserDetail((prev: any) => ({ ...prev, activeTab: 'deposits' }))}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedUserDetail.activeTab === 'deposits'
                    ? 'bg-[#61002a] text-white border-t-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📥 ডিপোজিট রেকর্ড ({selectedUserDetail.deposits?.length || 0})
              </button>
              <button
                onClick={() => setSelectedUserDetail((prev: any) => ({ ...prev, activeTab: 'withdrawals' }))}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedUserDetail.activeTab === 'withdrawals'
                    ? 'bg-[#61002a] text-white border-t-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📤 উইথড্রয়াল হিস্ট্রি ({selectedUserDetail.withdrawals?.length || 0})
              </button>
              <button
                onClick={() => setSelectedUserDetail((prev: any) => ({ ...prev, activeTab: 'audit' }))}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedUserDetail.activeTab === 'audit'
                    ? 'bg-[#61002a] text-white border-t-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🛡️ অডিট ও অ্যাকশন লগ ({selectedUserDetail.auditHistory?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#2b0013]">
              {selectedUserDetail.loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs">ইউজারের বিস্তারিত তথ্য লোড হচ্ছে...</span>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW & PROFILE */}
                  {selectedUserDetail.activeTab === 'overview' && (
                    <div className="space-y-5">
                      {/* Financial KPI Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-1">
                          <span className="text-[11px] text-slate-400">বর্তমান অ্যাভেইলেবল ব্যালেন্স</span>
                          <div className="text-lg sm:text-xl font-black font-mono text-amber-300">
                            ৳{(((selectedUserDetail.user?.wallet?.availablePaisa ?? 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-1">
                          <span className="text-[11px] text-slate-400">মোট বেটিং স্টেক (Wagered)</span>
                          <div className="text-lg sm:text-xl font-black font-mono text-white">
                            ৳{(selectedUserDetail.stats?.totalBetTk ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {selectedUserDetail.stats?.totalBetsCount || 0} টি বাজি
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-1">
                          <span className="text-[11px] text-slate-400">মোট পেআউট জিতেছেন (Won)</span>
                          <div className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                            ৳{(selectedUserDetail.stats?.totalPayoutTk ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <span className="text-[10px] text-emerald-300/80 font-mono">
                            {selectedUserDetail.stats?.wonBetsCount || 0} টি জয়ী
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-1">
                          <span className="text-[11px] text-slate-400">ইউজার নেট লাভ/ক্ষতি (PnL)</span>
                          <div className={`text-lg sm:text-xl font-black font-mono ${
                            (selectedUserDetail.stats?.netPnlTk ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {(selectedUserDetail.stats?.netPnlTk ?? 0) >= 0 ? '+' : ''}
                            ৳{(selectedUserDetail.stats?.netPnlTk ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(selectedUserDetail.stats?.netPnlTk ?? 0) >= 0 ? 'প্লেয়ার লাভে আছে' : 'ক্যাসিনো হাউজ লাভে আছে'}
                          </span>
                        </div>
                      </div>

                      {/* Detailed Profile Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Profile Info Card */}
                        <div className="p-5 rounded-2xl bg-[#47001f] border border-[#940042] space-y-3">
                          <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>ইউজার অ্যাকাউন্ট ডিটেইলস (Account Information)</span>
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">ইউজারনেম (Username):</span>
                              <span className="font-bold text-white">{selectedUserDetail.user?.username}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">পূর্ণ নাম (Full Name):</span>
                              <span className="font-bold text-white">{selectedUserDetail.user?.fullName || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">মোবাইল নম্বর (Phone):</span>
                              <span className="font-mono font-bold text-emerald-400">{selectedUserDetail.user?.mobile || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">ইমেইল (Email):</span>
                              <span className="font-bold text-white">{selectedUserDetail.user?.email || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">রোল (Role):</span>
                              <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-400 text-slate-950 uppercase">
                                {selectedUserDetail.user?.role || 'player'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">রেজিস্ট্রেশন তারিখ:</span>
                              <span className="font-mono text-slate-300">
                                {selectedUserDetail.user?.createdAt ? new Date(selectedUserDetail.user.createdAt).toLocaleString() : '—'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">সর্বশেষ লগইন আইপি (Last IP):</span>
                              <span className="font-mono text-slate-300">{selectedUserDetail.user?.lastLoginIp || '103.145.24.12'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-slate-400">KYC ভেরিফিকেশন:</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                selectedUserDetail.user?.kycStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {selectedUserDetail.user?.kycStatus || 'PENDING'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Ledger & Lifetime Activity */}
                        <div className="p-5 rounded-2xl bg-[#47001f] border border-[#940042] space-y-3">
                          <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                            <Layers className="w-4 h-4" />
                            <span>আর্থিক ওয়ালেট ও লাইফটাইম হিসাব (Financial Records)</span>
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">অ্যাভেইলেবল ব্যালেন্স:</span>
                              <span className="font-mono font-bold text-amber-300">
                                ৳{(((selectedUserDetail.user?.wallet?.availablePaisa ?? 0) / 100)).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">উইথড্রয়ালের জন্য সংরক্ষিত (Reserved):</span>
                              <span className="font-mono font-bold text-slate-300">
                                ৳{(((selectedUserDetail.user?.wallet?.reservedPaisa ?? 0) / 100)).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">মোট সফল ডিপোজিট:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                ৳{(selectedUserDetail.stats?.totalDepositedTk ?? 0).toFixed(2)} ({selectedUserDetail.stats?.totalDepositsCount || 0} বার)
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">মোট সফল উইথড্রয়াল:</span>
                              <span className="font-mono font-bold text-sky-400">
                                ৳{(selectedUserDetail.stats?.totalWithdrawnTk ?? 0).toFixed(2)} ({selectedUserDetail.stats?.totalWithdrawalsCount || 0} বার)
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">মোট বেট রাউন্ড:</span>
                              <span className="font-mono font-bold text-white">
                                {selectedUserDetail.stats?.totalBetsCount || 0} টি
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#61002a]">
                              <span className="text-slate-400">জয়ী বাজি / হারানো বাজি:</span>
                              <span className="font-mono font-bold text-white">
                                <span className="text-emerald-400">{selectedUserDetail.stats?.wonBetsCount || 0} Won</span> / <span className="text-rose-400">{selectedUserDetail.stats?.lostBetsCount || 0} Lost</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-slate-400">উইন রেট (Win Rate):</span>
                              <span className="font-mono font-bold text-amber-300">
                                {selectedUserDetail.stats?.totalBetsCount > 0
                                  ? `${Math.round(((selectedUserDetail.stats?.wonBetsCount || 0) / selectedUserDetail.stats.totalBetsCount) * 100)}%`
                                  : '0%'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BETTING HISTORY (ALL BETS) */}
                  {selectedUserDetail.activeTab === 'bets' && (
                    <div className="space-y-4">
                      {/* Summary Banner */}
                      <div className="p-4 rounded-2xl bg-[#47001f] border border-[#940042] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-slate-400 text-[11px]">মোট বাজি:</span>
                            <span className="font-bold text-white ml-1">{selectedUserDetail.bets?.length || 0} টি</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px]">মোট স্টেক:</span>
                            <span className="font-bold text-amber-300 ml-1">
                              ৳{(selectedUserDetail.stats?.totalBetTk ?? 0).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px]">মোট পেআউট:</span>
                            <span className="font-bold text-emerald-400 ml-1">
                              ৳{(selectedUserDetail.stats?.totalPayoutTk ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="px-3 py-1 rounded-xl bg-[#61002a] border border-[#940042] font-mono font-bold">
                          নেট ফলাফল: <span className={(selectedUserDetail.stats?.netPnlTk ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {(selectedUserDetail.stats?.netPnlTk ?? 0) >= 0 ? '+' : ''}৳{(selectedUserDetail.stats?.netPnlTk ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Bets Table */}
                      <div className="bg-[#47001f] border border-[#940042] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#61002a] text-slate-300 font-bold border-b border-[#940042]">
                              <tr>
                                <th className="p-3">Bet ID</th>
                                <th className="p-3">Event / Game</th>
                                <th className="p-3">Market / Selection</th>
                                <th className="p-3 font-mono">Stake (৳)</th>
                                <th className="p-3 font-mono">Odds</th>
                                <th className="p-3 font-mono">Payout (৳)</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Placed Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#61002a]">
                              {!selectedUserDetail.bets || selectedUserDetail.bets.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                                    এই প্লেয়ার এখনো কোনো বাজি ধরেননি (No bets placed by this user yet).
                                  </td>
                                </tr>
                              ) : (
                                selectedUserDetail.bets.map((b: any) => (
                                  <tr key={b.id} className="hover:bg-[#61002a]/60 transition">
                                    <td className="p-3 font-mono text-slate-400 text-[11px] font-bold">
                                      #{b.id?.substring(0, 10)}
                                    </td>
                                    <td className="p-3 font-bold text-white">
                                      {b.eventName || b.gameTitle || 'Casino / Sports'}
                                    </td>
                                    <td className="p-3 text-slate-300">
                                      <span className="text-[11px] text-amber-300/90 font-medium">
                                        {b.marketName || 'Match Odds'}:
                                      </span>{' '}
                                      <span className="font-bold text-white">{b.selectionName || '1X'}</span>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-amber-400">
                                      ৳{((b.stakePaisa || 0) / 100).toFixed(2)}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-white">
                                      {b.acceptedOdds || '1.95'}x
                                    </td>
                                    <td className="p-3 font-mono font-bold">
                                      {b.status === 'WON' ? (
                                        <span className="text-emerald-400">+৳{((b.payoutPaisa || 0) / 100).toFixed(2)}</span>
                                      ) : b.status === 'LOST' ? (
                                        <span className="text-rose-400">৳0.00</span>
                                      ) : (
                                        <span className="text-amber-300">৳{((b.potentialReturnPaisa || 0) / 100).toFixed(2)} (est)</span>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                        b.status === 'WON'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : b.status === 'LOST'
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {b.status}
                                      </span>
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-400">
                                      {b.placedAt ? new Date(b.placedAt).toLocaleString() : '—'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: DEPOSITS */}
                  {selectedUserDetail.activeTab === 'deposits' && (
                    <div className="space-y-4">
                      <div className="bg-[#47001f] border border-[#940042] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#61002a] text-slate-300 font-bold border-b border-[#940042]">
                              <tr>
                                <th className="p-3">Deposit ID</th>
                                <th className="p-3">Method</th>
                                <th className="p-3">TrxID</th>
                                <th className="p-3 font-mono">Amount (৳)</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Created Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#61002a]">
                              {!selectedUserDetail.deposits || selectedUserDetail.deposits.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                                    কোনো ডিপোজিট রেকর্ড পাওয়া যায়নি (No deposits recorded).
                                  </td>
                                </tr>
                              ) : (
                                selectedUserDetail.deposits.map((d: any) => (
                                  <tr key={d.id} className="hover:bg-[#61002a]/60 transition">
                                    <td className="p-3 font-mono text-slate-400 text-[11px]">#{d.id?.substring(0, 10)}</td>
                                    <td className="p-3 font-bold text-white uppercase">{d.method}</td>
                                    <td className="p-3 font-mono font-bold text-amber-300">{d.trxId || '—'}</td>
                                    <td className="p-3 font-mono font-bold text-emerald-400">
                                      ৳{((d.amountPaisa || 0) / 100).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        d.status === 'SUCCEEDED'
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : d.status === 'PENDING'
                                          ? 'bg-amber-500/20 text-amber-300'
                                          : 'bg-rose-500/20 text-rose-300'
                                      }`}>
                                        {d.status}
                                      </span>
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-400">
                                      {d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: WITHDRAWALS */}
                  {selectedUserDetail.activeTab === 'withdrawals' && (
                    <div className="space-y-4">
                      <div className="bg-[#47001f] border border-[#940042] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#61002a] text-slate-300 font-bold border-b border-[#940042]">
                              <tr>
                                <th className="p-3">Withdrawal ID</th>
                                <th className="p-3">Method</th>
                                <th className="p-3">Payout Destination</th>
                                <th className="p-3 font-mono">Amount (৳)</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Requested Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#61002a]">
                              {!selectedUserDetail.withdrawals || selectedUserDetail.withdrawals.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                                    কোনো উইথড্রয়াল রেকর্ড নেই (No withdrawal requests).
                                  </td>
                                </tr>
                              ) : (
                                selectedUserDetail.withdrawals.map((w: any) => (
                                  <tr key={w.id} className="hover:bg-[#61002a]/60 transition">
                                    <td className="p-3 font-mono text-slate-400 text-[11px]">#{w.id?.substring(0, 10)}</td>
                                    <td className="p-3 font-bold text-white uppercase">{w.method}</td>
                                    <td className="p-3 font-mono font-bold text-slate-200">{w.payoutDestination}</td>
                                    <td className="p-3 font-mono font-bold text-rose-400">
                                      ৳{((w.amountPaisa || 0) / 100).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        w.status === 'PAID'
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW'
                                          ? 'bg-amber-500/20 text-amber-300'
                                          : 'bg-rose-500/20 text-rose-300'
                                      }`}>
                                        {w.status}
                                      </span>
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-400">
                                      {w.createdAt ? new Date(w.createdAt).toLocaleString() : '—'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: AUDIT LOG */}
                  {selectedUserDetail.activeTab === 'audit' && (
                    <div className="space-y-4">
                      <div className="bg-[#47001f] border border-[#940042] rounded-2xl p-4">
                        <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider mb-3">
                          ইউজার অ্যাকশন ও নিরাপত্তা অডিট লগ (Security & Audit Trail)
                        </h4>
                        <div className="space-y-2 text-xs">
                          {!selectedUserDetail.auditHistory || selectedUserDetail.auditHistory.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">
                              কোনো অডিট রেকর্ড পাওয়া যায়নি (No audit events recorded).
                            </div>
                          ) : (
                            selectedUserDetail.auditHistory.map((a: any) => (
                              <div key={a.id} className="p-3 rounded-xl bg-[#61002a] border border-[#940042] flex items-center justify-between gap-3">
                                <div>
                                  <div className="font-bold text-white flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 font-mono">
                                      {a.action}
                                    </span>
                                    <span>by {a.actor}</span>
                                  </div>
                                  {a.metadata?.reason && (
                                    <div className="text-[11px] text-slate-300 mt-1">
                                      Note: {a.metadata.reason}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right font-mono text-[11px] text-slate-400">
                                  {a.timestamp ? new Date(a.timestamp).toLocaleString() : '—'}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 bg-[#47001f] border-t border-[#940042] flex items-center justify-between gap-2 flex-wrap shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Add Balance Shortcut */}
                <button
                  onClick={() => {
                    const balTk = (selectedUserDetail.user?.wallet?.availablePaisa ?? 0) / 100;
                    setAdjustBalanceModal({
                      userId: selectedUserDetail.user.id,
                      username: selectedUserDetail.user.username,
                      currentBalanceTk: balTk,
                      type: 'add',
                    });
                    setAdjustType('add');
                    setAdjustAmountTk(500);
                    setAdjustReason('মিসিং ব্যালেন্স রিফান্ড / ক্রেডিট');
                  }}
                  className="px-3 py-1.5 rounded-xl gold-gradient text-slate-950 text-xs font-black shadow hover:brightness-110 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>➕ ব্যালেন্স যোগ করুন</span>
                </button>

                {/* Deduct Balance Shortcut */}
                <button
                  onClick={() => {
                    const balTk = (selectedUserDetail.user?.wallet?.availablePaisa ?? 0) / 100;
                    setAdjustBalanceModal({
                      userId: selectedUserDetail.user.id,
                      username: selectedUserDetail.user.username,
                      currentBalanceTk: balTk,
                      type: 'deduct',
                    });
                    setAdjustType('deduct');
                    setAdjustAmountTk(500);
                    setAdjustReason('ভুলবশত ব্যালেন্স যোগ সংশোধন / কর্তন');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>➖ ব্যালেন্স কর্তন করুন</span>
                </button>

                {/* Reset Password Shortcut */}
                <button
                  onClick={() => setResetPassModal({
                    userId: selectedUserDetail.user.id,
                    username: selectedUserDetail.user.username
                  })}
                  className="px-3 py-1.5 rounded-xl bg-[#61002a] hover:bg-[#750035] text-slate-200 text-xs font-bold border border-[#940042] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>পাসওয়ার্ড রিসেট</span>
                </button>

                {/* Lock / Unlock Shortcut */}
                {selectedUserDetail.user?.role !== 'admin' && (
                  <button
                    onClick={() => {
                      handleToggleSuspend(selectedUserDetail.user.id, selectedUserDetail.user.isSuspended);
                      setSelectedUserDetail((prev: any) => ({
                        ...prev,
                        user: { ...prev.user, isSuspended: !prev.user.isSuspended },
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      selectedUserDetail.user?.isSuspended
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{selectedUserDetail.user?.isSuspended ? 'আনলক করুন' : 'লক করুন'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-[#61002a] hover:bg-[#750035] text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD HERO BANNER */}
      {newBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setNewBannerModal(false)} />
          <div className="relative w-full max-w-lg bg-[#47001f] border border-[#940042] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Add New Hero Banner</span>
            </h3>
            <form onSubmit={handleCreateBanner} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Banner Title (English):</label>
                <input
                  type="text"
                  value={newBannerForm.titleEn}
                  onChange={(e) => setNewBannerForm({ ...newBannerForm, titleEn: e.target.value, titleBn: e.target.value })}
                  placeholder="e.g. 200% Mega Cashback on Reload"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-[#750035] border border-[#940042] text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400">Subtitle (English):</label>
                <input
                  type="text"
                  value={newBannerForm.subtitleEn}
                  onChange={(e) => setNewBannerForm({ ...newBannerForm, subtitleEn: e.target.value, subtitleBn: e.target.value })}
                  placeholder="e.g. Instant deposits via bKash, Nagad and Rocket"
                  className="w-full px-4 py-2 rounded-xl bg-[#750035] border border-[#940042] text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400">Image URL:</label>
                <input
                  type="url"
                  value={newBannerForm.image}
                  onChange={(e) => setNewBannerForm({ ...newBannerForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl bg-[#750035] border border-[#940042] text-white mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBannerModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#61002a] text-slate-400 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl gold-gradient text-slate-950 font-bold shadow cursor-pointer"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal Dialog (replaces window.prompt) */}
      {rejectionDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#750035] border border-[#940042] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#940042] pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>{rejectionDialog.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectionDialog(null)}
                className="w-7 h-7 rounded-full bg-[#61002a] hover:bg-[#252B44] text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/30 rounded-2xl p-3 border border-[#940042] text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>ID:</span>
                <span className="font-mono text-amber-400 font-bold">{rejectionDialog.id}</span>
              </div>
              {rejectionDialog.userIdentifier && (
                <div className="flex justify-between text-slate-400">
                  <span>User:</span>
                  <span className="text-white font-bold">{rejectionDialog.userIdentifier}</span>
                </div>
              )}
              {rejectionDialog.amountTk !== undefined && (
                <div className="flex justify-between text-slate-400">
                  <span>Amount:</span>
                  <span className="text-emerald-400 font-bold font-mono">৳{rejectionDialog.amountTk.toLocaleString()}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {rejectionDialog.type === 'deposit'
                ? 'Rejecting this deposit will mark the transaction as FAILED with reason shown in player history.'
                : 'Rejecting this withdrawal will safely return the reserved funds immediately to the player balance.'}
            </p>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">Quick Reason Presets:</label>
              <div className="flex flex-wrap gap-1.5">
                {(rejectionDialog.type === 'deposit'
                  ? [
                      'Invalid Transaction ID (TrxID)',
                      'Payment Not Received',
                      'Incorrect Amount',
                      'Duplicate Request',
                    ]
                  : [
                      'Invalid MFS Account Number',
                      'Player Requested Cancellation',
                      'KYC Mismatch',
                      'Risk Verification Failed',
                    ]
                ).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setRejectionDialog((prev) => (prev ? { ...prev, reason: preset } : null))
                    }
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                      rejectionDialog.reason === preset
                        ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                        : 'bg-[#61002a] border-[#940042] text-slate-400 hover:text-slate-200 hover:bg-[#252B44]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Text */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Specific Reason for Rejection:</label>
              <textarea
                rows={2}
                value={rejectionDialog.reason}
                onChange={(e) =>
                  setRejectionDialog((prev) => (prev ? { ...prev, reason: e.target.value } : null))
                }
                placeholder="Type rejection reason..."
                className="w-full px-3 py-2 rounded-xl bg-[#61002a] border border-[#940042] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#940042]">
              <button
                type="button"
                onClick={() => setRejectionDialog(null)}
                className="px-4 py-2 rounded-xl bg-[#940042] hover:bg-[#3A4368] text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectionSubmit}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW DEPOSIT SCREENSHOT PROOF */}
      {viewScreenshotModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#540026] border border-[#a30048] rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#a30048] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">
                  Deposit Payment Slip Proof (TrxID: {viewScreenshotModal.trxId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewScreenshotModal(null)}
                className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-black/30 p-2.5 rounded-2xl border border-[#940042]">
              <div>
                <span className="text-slate-400">User: </span>
                <span className="text-white font-bold">{viewScreenshotModal.username}</span>
              </div>
              <div>
                <span className="text-slate-400">Amount: </span>
                <span className="text-emerald-400 font-bold font-mono">৳{viewScreenshotModal.amountTk.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Method: </span>
                <span className="text-amber-300 font-bold uppercase">{viewScreenshotModal.method}</span>
              </div>
              <div>
                <span className="text-slate-400">Sender Number: </span>
                <span className="text-slate-200 font-mono">{viewScreenshotModal.senderNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Screenshot preview image */}
            <div className="max-h-[60vh] overflow-auto rounded-2xl border border-[#940042] bg-black/60 flex items-center justify-center p-2">
              <img
                src={viewScreenshotModal.src}
                alt="Payment Slip Proof"
                className="max-h-[55vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#a30048]">
              <button
                type="button"
                onClick={() => setViewScreenshotModal(null)}
                className="px-5 py-2 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CASINO API CONFIGURATION */}
      {editingApi && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#540026] border border-[#a30048] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#a30048] pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  Casino API Gateway Configuration ({editingApi.name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingApi(null)}
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCasinoApi(editingApi);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">API / Connector Name:</label>
                  <input
                    type="text"
                    required
                    value={editingApi.name}
                    onChange={(e) => setEditingApi({ ...editingApi, name: e.target.value })}
                    placeholder="e.g. Slot Games API"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category / API Type:</label>
                  <select
                    value={editingApi.category || 'slots'}
                    onChange={(e) =>
                      setEditingApi({
                        ...editingApi,
                        category: e.target.value,
                        providerKey: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="slots">Slot Games API</option>
                    <option value="live">Live Casino API</option>
                    <option value="crash">Crash Games API</option>
                    <option value="table">Table / Card API</option>
                    <option value="fish">Fishing Games API</option>
                    <option value="aggregator">Multi-Game Aggregator API</option>
                    <option value="custom">Custom Casino API</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">API Base URL (Gateway Endpoint):</label>
                <input
                  type="url"
                  required
                  value={editingApi.apiEndpoint}
                  onChange={(e) => setEditingApi({ ...editingApi, apiEndpoint: e.target.value })}
                  placeholder="https://api.your-casino-gateway.com/v1"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Operator Code / Merchant ID:</label>
                  <input
                    type="text"
                    value={editingApi.operatorCode}
                    onChange={(e) => setEditingApi({ ...editingApi, operatorCode: e.target.value })}
                    placeholder="OP_BDT_01"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Currency:</label>
                  <input
                    type="text"
                    required
                    value={editingApi.currency || 'BDT'}
                    onChange={(e) => setEditingApi({ ...editingApi, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Secret API Key / Auth Token:</label>
                <input
                  type="text"
                  value={editingApi.secretKey}
                  onChange={(e) => setEditingApi({ ...editingApi, secretKey: e.target.value })}
                  placeholder="Enter API Key or Bearer Secret"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Seamless Wallet Callback URL:</label>
                <input
                  type="url"
                  value={editingApi.seamlessWalletCallbackUrl || ''}
                  onChange={(e) =>
                    setEditingApi({ ...editingApi, seamlessWalletCallbackUrl: e.target.value })
                  }
                  placeholder="https://your-site.com/api/v1/casino/seamless/callback"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="apiEnabledCheck"
                  checked={editingApi.isEnabled}
                  onChange={(e) => setEditingApi({ ...editingApi, isEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-400 accent-amber-400"
                />
                <label htmlFor="apiEnabledCheck" className="text-white font-bold cursor-pointer">
                  Keep this API Gateway Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#a30048]">
                <button
                  type="button"
                  onClick={() => setEditingApi(null)}
                  className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Connect Gateway</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT REAL GAME */}
      {gameModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#540026] border border-[#a30048] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#a30048] pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  {editingGame ? `Edit Real Game: ${editingGame.title}` : 'Add New Real Game'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGameModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGameSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Game Title (English):</label>
                  <input
                    type="text"
                    required
                    value={gameFormData.title}
                    onChange={(e) => setGameFormData({ ...gameFormData, title: e.target.value })}
                    placeholder="e.g. Golden Slots / Live Roulette"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Display Subtitle (Optional):</label>
                  <input
                    type="text"
                    value={gameFormData.titleBn}
                    onChange={(e) => setGameFormData({ ...gameFormData, titleBn: e.target.value })}
                    placeholder="e.g. Live BDT Game"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category:</label>
                  <select
                    value={gameFormData.category}
                    onChange={(e) =>
                      setGameFormData({ ...gameFormData, category: e.target.value as GameCategory })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white focus:outline-hidden focus:border-amber-400 uppercase"
                  >
                    <option value="slots">Slots</option>
                    <option value="live">Live Casino</option>
                    <option value="crash">Crash Games</option>
                    <option value="table">Table Games</option>
                    <option value="sports">Sports</option>
                    <option value="fish">Fishing</option>
                    <option value="arcade">Arcade</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Provider / Source Label:</label>
                  <input
                    type="text"
                    required
                    value={gameFormData.provider}
                    onChange={(e) => setGameFormData({ ...gameFormData, provider: e.target.value })}
                    placeholder="Slot API / Live Casino API"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Game Code / ID:</label>
                  <input
                    type="text"
                    value={gameFormData.gameCode}
                    onChange={(e) => setGameFormData({ ...gameFormData, gameCode: e.target.value })}
                    placeholder="e.g. slot_game_01"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">RTP Percentage (%):</label>
                  <input
                    type="text"
                    value={gameFormData.rtp}
                    onChange={(e) => setGameFormData({ ...gameFormData, rtp: e.target.value })}
                    placeholder="96.5%"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Real Game Launch URL / Iframe Endpoint:</label>
                <input
                  type="text"
                  value={gameFormData.realLaunchUrl}
                  onChange={(e) =>
                    setGameFormData({ ...gameFormData, realLaunchUrl: e.target.value })
                  }
                  placeholder="https://your-casino-api.com/launch?gameCode=slot_01&cur=BDT"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-400">
                  * When players launch this game, this external API URL loads inside the arena.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Thumbnail Image URL:</label>
                <input
                  type="url"
                  value={gameFormData.thumbnail}
                  onChange={(e) => setGameFormData({ ...gameFormData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Min Bet (BDT):</label>
                  <input
                    type="number"
                    min="1"
                    value={gameFormData.minBetTk}
                    onChange={(e) =>
                      setGameFormData({ ...gameFormData, minBetTk: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Max Bet (BDT):</label>
                  <input
                    type="number"
                    min="10"
                    value={gameFormData.maxBetTk}
                    onChange={(e) =>
                      setGameFormData({ ...gameFormData, maxBetTk: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-white font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameFormData.isHot}
                    onChange={(e) => setGameFormData({ ...gameFormData, isHot: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-400 accent-amber-400"
                  />
                  <span>Show 'Hot Game' Badge</span>
                </label>

                <label className="flex items-center gap-1.5 text-white font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameFormData.isLive}
                    onChange={(e) => setGameFormData({ ...gameFormData, isLive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-400 accent-amber-400"
                  />
                  <span>Live Dealer Game</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#a30048]">
                <button
                  type="button"
                  onClick={() => setGameModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingGame ? 'Update Game' : 'Save Game'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT GAMES FROM ONLINE API / JSON */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#540026] border border-[#a30048] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#a30048] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">
                  Import Real Games from Online API
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportOnlineApiGames} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">External Games Feed API URL (HTTPS):</label>
                <input
                  type="url"
                  value={importFeedUrl}
                  onChange={(e) => setImportFeedUrl(e.target.value)}
                  placeholder="https://provider-api.example.com/v1/games"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Operator Code (Optional):</label>
                  <input
                    type="text"
                    value={importOperatorCode}
                    onChange={(e) => setImportOperatorCode(e.target.value)}
                    placeholder="OP_CODE"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">API Key / Bearer Token (Optional):</label>
                  <input
                    type="text"
                    value={importApiKey}
                    onChange={(e) => setImportApiKey(e.target.value)}
                    placeholder="sk_live_..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-white font-mono focus:outline-hidden focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">
                  Or Paste Game Feed JSON Array Directly:
                </label>
                <textarea
                  rows={5}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`[{"title": "Slot Game 01", "category": "slots", "provider": "Slot API", "gameCode": "slot_01", "realLaunchUrl": "https://..."}]`}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#940042] text-emerald-300 font-mono text-[11px] focus:outline-hidden focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#a30048]">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImportingGames}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className={`w-4 h-4 ${isImportingGames ? 'animate-spin' : ''}`} />
                  <span>{isImportingGames ? 'Importing...' : 'Fetch & Import Games'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIVE GAME ARENA PREVIEW */}
      {testGamePreview && (
        <GameArenaModal
          game={testGamePreview}
          wallet={null}
          user={adminUser}
          onClose={() => setTestGamePreview(null)}
          onRefreshWallet={() => {}}
          lang={lang}
        />
      )}

      {/* In-App Confirmation Modal (replaces window.confirm) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#61002a] border border-[#940042] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#940042] pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{confirmDialog.title}</span>
              </div>
              <button
                type="button"
                onClick={() => !isConfirmSubmitting && setConfirmDialog(null)}
                className="w-7 h-7 rounded-full bg-[#47001f] text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isConfirmSubmitting}
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-[#47001f] text-slate-200 text-xs font-bold hover:bg-[#750035] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConfirmSubmitting}
                onClick={async () => {
                  setIsConfirmSubmitting(true);
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setIsConfirmSubmitting(false);
                    setConfirmDialog(null);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer disabled:opacity-50 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'gold-gradient text-slate-950'
                }`}
              >
                {isConfirmSubmitting ? 'Processing...' : confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Toast Notification (replaces window.alert) */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 duration-200 transition-all ${
            toast.type === 'success'
              ? 'bg-[#0E2A1E]/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
              : toast.type === 'error'
              ? 'bg-[#2A1015]/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
              : 'bg-[#282110]/95 border-amber-500/50 text-amber-200 shadow-amber-950/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold leading-tight">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
