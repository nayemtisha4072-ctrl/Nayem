/**
 * In-memory Store & Persistence for fb88baji
 * Double-Entry Accounting Chart of Accounts and Initial Seed Data
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Wallet,
  LedgerAccount,
  JournalEntry,
  Deposit,
  Withdrawal,
  WebhookEvent,
  GameItem,
  SportsEvent,
  Bet,
  SupportTicket,
  AuditLog,
  PromotionOffer,
  CasinoApiConfig,
  AchaGamingConfig,
  DSTGamingConfig,
  PaymentChannel,
  ReferralReferee,
  ReferralAchievementLevel,
  ReferralCommissionRecord,
  ReferralSettings,
  ReferralSummary,
  FraudAlert,
  PlayerLiveActivity,
  LiveGatewayConfig,
} from '../src/types/index.ts';
import { SEEDED_GAMES } from './gamesCatalog.ts';

// Standard Chart of Accounts for Gaming Platform
export const CHART_OF_ACCOUNTS: LedgerAccount[] = [
  { code: '1000_BANK_CLEARING', name: 'Bank Transfer Settlement', type: 'ASSET', description: 'Funds received from Bank Transfer' },
  { code: '1010_BKASH_CLEARING', name: 'bKash Merchant Settlement', type: 'ASSET', description: 'Funds received from bKash gateway' },
  { code: '1020_NAGAD_CLEARING', name: 'Nagad Merchant Settlement', type: 'ASSET', description: 'Funds received from Nagad gateway' },
  { code: '1030_ROCKET_CLEARING', name: 'Rocket Merchant Settlement', type: 'ASSET', description: 'Funds received from Rocket gateway' },
  { code: '1040_UPAY_CLEARING', name: 'Upay Merchant Settlement', type: 'ASSET', description: 'Funds received from Upay gateway' },
  { code: '2010_PLAYER_AVAILABLE', name: 'Player Available Wallet Liability', type: 'LIABILITY', description: 'Customer deposited funds ready to play or withdraw' },
  { code: '2020_PLAYER_RESERVED', name: 'Player Reserved Balance Liability', type: 'LIABILITY', description: 'Funds held for pending withdrawals or open bets' },
  { code: '2030_PLAYER_BONUS', name: 'Player Bonus Balance', type: 'LIABILITY', description: 'Promotional bonus granted to players' },
  { code: '4010_GAMING_REVENUE', name: 'Platform Gross Gaming Yield', type: 'REVENUE', description: 'Net winnings/losses from casino and sportsbook' },
  { code: '5010_PAYMENT_FEES', name: 'Payment Gateway Processing Expense', type: 'EXPENSE', description: 'MFS and Bank transaction fees' },
  { code: '5020_PROMOTIONS_EXPENSE', name: 'Promotional Grant Expense', type: 'EXPENSE', description: 'Cost of promotional bonuses' },
  { code: '5030_REFERRAL_COMMISSION_EXPENSE', name: 'Referral & Affiliate Commission Expense', type: 'EXPENSE', description: 'Referral commission and agent milestone payouts' },
];

export interface MfsAccountDetails {
  number: string;
  type: 'cashout' | 'send_money';
  titleBn: string;
  titleEn: string;
  instructionBn: string;
}

export interface BankAccountDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber?: string;
  type: 'bank_transfer';
  titleBn: string;
  titleEn: string;
  instructionBn: string;
}

export interface DepositAccountsConfig {
  bank_transfer: BankAccountDetails;
  bkash: {
    cashout: MfsAccountDetails;
    send_money: MfsAccountDetails;
  };
  nagad: {
    cashout: MfsAccountDetails;
    send_money: MfsAccountDetails;
  };
  rocket: {
    cashout: MfsAccountDetails;
    send_money: MfsAccountDetails;
  };
  upay: {
    cashout: MfsAccountDetails;
    send_money: MfsAccountDetails;
  };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored?: string): boolean {
  if (!stored || !password) return false;
  if (stored.startsWith('scrypt:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const [, salt, hashHex] = parts;
    const hashBuf = Buffer.from(hashHex, 'hex');
    const derivedBuf = crypto.scryptSync(password, salt, 64);
    if (hashBuf.length !== derivedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, derivedBuf);
  }
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export class InMemoryStore {
  users: Map<string, User> = new Map();
  passwords: Map<string, string> = new Map(); // userId -> scrypt password hash
  sessions: Map<string, string> = new Map(); // token -> userId
  wallets: Map<string, Wallet> = new Map();
  journalEntries: JournalEntry[] = [];
  deposits: Map<string, Deposit> = new Map();
  withdrawals: Map<string, Withdrawal> = new Map();
  processedWebhooks: Map<string, WebhookEvent> = new Map(); // idempotencyKey -> WebhookEvent
  games: GameItem[] = [];
  casinoApis: Map<string, CasinoApiConfig> = new Map();
  dstgamingConfig: DSTGamingConfig = {
    id: 'gateway_testing',
    providerName: '',
    status: 'DISCONNECTED',
    isEnabled: false,
    activeEnvironment: 'staging',
    staging: {
      apiUrl: '',
      boUrl: '',
      companyCode: '',
      apiKey: '',
      boUsername: '',
      boPassword: '',
    },
    production: {
      apiUrl: '',
      boUrl: '',
      companyCode: '',
      apiKey: '',
      boUsername: '',
      boPassword: '',
    },
    playerPrefix: 'fb88_',
    walletType: 'seamless',
    currency: 'BDT',
    returnUrl: '',
    callbackUrl: '/api/v1/casino/seamless/callback',
    balanceUrl: '/api/v1/casino/seamless/balance',
    betUrl: '/api/v1/casino/seamless/bet',
    settleUrl: '/api/v1/casino/seamless/win',
    rollbackUrl: '/api/v1/casino/seamless/rollback',
    serverIp: '34.126.172.84',
    domainWhitelist: '',
    totalProvidersAvailable: 0,
    syncedGamesCount: SEEDED_GAMES.length,
    notes: 'Generic casino API testing gateway configuration.',
  };
  achagamingConfig: AchaGamingConfig = {
    id: 'gateway_cloud',
    companyName: '',
    packageName: 'Casino API Gateway',
    packagePriceUsd: 0,
    pricingSummary: 'Seamless Wallet API (BDT)',
    status: 'DISCONNECTED',
    isEnabled: false,
    apiEndpoint: '',
    apiKey: '',
    apiSecret: '',
    playerPrefix: 'fb88_',
    walletType: 'seamless',
    currency: 'BDT',
    returnUrl: '',
    callbackUrl: '/api/v1/casino/seamless/callback',
    serverIp: '34.126.172.84',
    domainWhitelist: '',
    ggrPercentage: 0,
    totalProvidersAvailable: 0,
    syncedGamesCount: SEEDED_GAMES.length,
    notes: 'Generic Seamless Wallet API configuration.',
  };

  // Universal Live Casino & Slot API Gateway Config (Vendor-neutral: connect ANY API)
  liveGatewayConfig: LiveGatewayConfig = {
    id: 'gateway_live_universal',
    gatewayName: 'Universal Casino & Slot API Gateway',
    environment: 'production',
    status: 'DISCONNECTED',
    isEnabled: false,
    apiBaseUrl: '',
    operatorCode: '',
    apiKey: '',
    apiSecret: '',
    backofficeUrl: '',
    backofficeUsername: '',
    backofficePassword: '',
    currency: 'BDT',
    playerPrefix: 'fb88_',
    whitelistIps: '',
    seamlessCallbackUrl: '/api/v1/casino/seamless/callback',
    balanceUrl: '/api/v1/casino/seamless/balance',
    betUrl: '/api/v1/casino/seamless/bet',
    settleUrl: '/api/v1/casino/seamless/win',
    rollbackUrl: '/api/v1/casino/seamless/rollback',
    latencyMs: 0,
    syncedGamesCount: SEEDED_GAMES.length,
    notes: 'Connect any Casino, Slot Games, or Live Casino API provider with Seamless Wallet (BDT).',
  };

  // Real-time Player Live Activities Stream (for Admin Live Monitoring)
  playerLiveActivities: PlayerLiveActivity[] = [];

  // Anti-Fraud & Bonus Abuse Alerts
  fraudAlerts: Map<string, FraudAlert> = new Map();

  sportsEvents: SportsEvent[] = [];
  bets: Map<string, Bet> = new Map();
  supportTickets: SupportTicket[] = [];
  auditLogs: AuditLog[] = [];
  announcementBn: string = 'fb88baji-তে স্বাগতম! bKash, Nagad এবং Rocket দিয়ে ইনস্ট্যান্ট ৳১০০ থেকে ৳২৫,০০০ ডিপোজিট ও নিরাপদ উইথড্রয়াল সুবিধা। নতুন ইউজারদের জন্য ১০০% ওয়েলকাম বোনাস!';
  banners: Array<{
    id: string;
    badgeBn: string;
    badgeEn: string;
    titleBn: string;
    titleEn: string;
    subtitleBn: string;
    subtitleEn: string;
    buttonBn: string;
    buttonEn: string;
    action: string;
    bgGradient: string;
    accentColor: string;
    image: string;
    active: boolean;
  }> = [];

  // Referral & Affiliate Program Configuration (Fb88baji)
  referralSettings: ReferralSettings = {
    tier1DepositRebatePercent: 1.5,
    tier1SlotsTurnoverPercent: 1.0,
    tier1LiveTurnoverPercent: 0.5,
    tier1SportsTurnoverPercent: 0.6,
    tier1CrashTurnoverPercent: 0.8,

    tier2DepositRebatePercent: 0.8,
    tier2SlotsTurnoverPercent: 0.5,
    tier2LiveTurnoverPercent: 0.3,
    tier2SportsTurnoverPercent: 0.3,
    tier2CrashTurnoverPercent: 0.4,

    tier3DepositRebatePercent: 0.3,
    tier3SlotsTurnoverPercent: 0.2,
    tier3LiveTurnoverPercent: 0.1,
    tier3SportsTurnoverPercent: 0.1,
    tier3CrashTurnoverPercent: 0.1,

    minActiveDepositPaisa: 500 * 100, // ৳500
    minActiveTurnoverPaisa: 1000 * 100, // ৳1,000
    signupRewardReferrerPaisa: 100 * 100, // ৳100
    signupRewardRefereePaisa: 100 * 100, // ৳100
  };
  referralReferees: Map<string, ReferralReferee[]> = new Map(); // referrerId -> referees
  referralAchievements: Map<string, ReferralAchievementLevel[]> = new Map(); // userId -> levels
  referralRecords: ReferralCommissionRecord[] = [];

  paymentChannels: PaymentChannel[] = [
    {
      id: 'bkash',
      name: 'bKash',
      nameBn: 'বিকাশ',
      type: 'mfs',
      channelType: 'cashout',
      badge: 'MFS',
      accentColor: '#E2136E',
      logoUrl: 'bkash',
      accountNumber: '01712-888999',
      sendMoneyNumber: '01799-112233',
      accountName: 'FB88BAJI Official bKash',
      minDepositPaisa: 100 * 100,
      maxDepositPaisa: 50000 * 100,
      minWithdrawPaisa: 500 * 100,
      maxWithdrawPaisa: 25000 * 100,
      bonusPercent: 5,
      instructionBn: 'আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে Cash Out অপশন সিলেক্ট করে নিচের নম্বরে টাকা পাঠান।',
      instructionEn: 'Send payment via Cash Out to our official bKash Agent Number and enter the TrxID.',
      active: true,
      isDepositEnabled: true,
      isWithdrawEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'nagad',
      name: 'Nagad',
      nameBn: 'নগদ',
      type: 'mfs',
      channelType: 'cashout',
      badge: 'MFS',
      accentColor: '#ED1C24',
      logoUrl: 'nagad',
      accountNumber: '01912-777888',
      sendMoneyNumber: '01988-445566',
      accountName: 'FB88BAJI Official Nagad',
      minDepositPaisa: 100 * 100,
      maxDepositPaisa: 50000 * 100,
      minWithdrawPaisa: 500 * 100,
      maxWithdrawPaisa: 25000 * 100,
      bonusPercent: 5,
      instructionBn: 'আপনার নগদ অ্যাপ বা *167# ডায়াল করে Cash Out অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      instructionEn: 'Send payment via Cash Out to our official Nagad Agent Number and enter the TrxID.',
      active: true,
      isDepositEnabled: true,
      isWithdrawEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rocket',
      name: 'Rocket',
      nameBn: 'রকেট',
      type: 'mfs',
      channelType: 'cashout',
      badge: 'DBBL',
      accentColor: '#8C3494',
      logoUrl: 'rocket',
      accountNumber: '01812-555666-8',
      sendMoneyNumber: '01899-667788-2',
      accountName: 'FB88BAJI Official Rocket',
      minDepositPaisa: 100 * 100,
      maxDepositPaisa: 50000 * 100,
      minWithdrawPaisa: 500 * 100,
      maxWithdrawPaisa: 25000 * 100,
      bonusPercent: 0,
      instructionBn: 'আপনার রকেট অ্যাপ বা *322# ডায়াল করে Cash Out অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      instructionEn: 'Send payment via Cash Out to our official Rocket Agent Number.',
      active: false,
      isDepositEnabled: true,
      isWithdrawEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'upay',
      name: 'Upay',
      nameBn: 'উপায়',
      type: 'mfs',
      channelType: 'cashout',
      badge: 'UCB',
      accentColor: '#004A97',
      logoUrl: 'upay',
      accountNumber: '01922-334455',
      sendMoneyNumber: '01933-778899',
      accountName: 'FB88BAJI Official Upay',
      minDepositPaisa: 100 * 100,
      maxDepositPaisa: 50000 * 100,
      minWithdrawPaisa: 500 * 100,
      maxWithdrawPaisa: 25000 * 100,
      bonusPercent: 0,
      instructionBn: 'আপনার উপায় অ্যাপ বা *268# ডায়াল করে Cash Out অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      instructionEn: 'Send payment via Cash Out to our official Upay Agent Number.',
      active: false,
      isDepositEnabled: true,
      isWithdrawEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      nameBn: 'ব্যাংক ট্রান্সফার',
      type: 'bank',
      channelType: 'bank_transfer',
      badge: 'BANK',
      accentColor: '#009fe3',
      logoUrl: 'bank_transfer',
      accountNumber: '115.120.0098765',
      accountName: 'FB88BAJI OFFICIAL ENTERPRISE',
      bankName: 'Dutch-Bangla Bank PLC (DBBL)',
      branchName: 'Motijheel Corporate Branch, Dhaka',
      routingNumber: '090261745',
      minDepositPaisa: 500 * 100,
      maxDepositPaisa: 100000 * 100,
      minWithdrawPaisa: 1000 * 100,
      maxWithdrawPaisa: 50000 * 100,
      bonusPercent: 2,
      instructionBn: 'আপনার ইন্টারনেট ব্যাংকিং অ্যাপ বা ব্রাঞ্চ থেকে উপরের ব্যাংক একাউন্টে টাকা ট্রান্সফার করে TrxID বা রসিদ আপলোড করুন।',
      instructionEn: 'Transfer funds to our official corporate bank account via NPSB/BEFTN.',
      active: false,
      isDepositEnabled: true,
      isWithdrawEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  depositAccounts: DepositAccountsConfig = {
    bank_transfer: {
      bankName: 'Dutch-Bangla Bank PLC (DBBL)',
      accountName: 'FB88BAJI OFFICIAL ENTERPRISE',
      accountNumber: '115.120.0098765',
      branchName: 'Motijheel Corporate Branch, Dhaka',
      routingNumber: '090261745',
      type: 'bank_transfer',
      titleBn: 'অফিসিয়াল ব্যাংক একাউন্ট (অনলাইন ট্রান্সফার / বিইএফটিএন / এনপিএসবি)',
      titleEn: 'Official Corporate Bank Account',
      instructionBn: 'আপনার ইন্টারনেট ব্যাংকিং অ্যাপ বা ব্রাঞ্চ থেকে উপরের ব্যাংক একাউন্টে টাকা ট্রান্সফার করে TrxID বা রসিদ আপলোড করুন।',
    },
    bkash: {
      cashout: {
        number: '01712-888999',
        type: 'cashout',
        titleBn: 'bKash এজেন্ট নম্বর (ক্যাশ আউট করুন)',
        titleEn: 'bKash Agent (Cash Out)',
        instructionBn: 'আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে Cash Out অপশন সিলেক্ট করে নিচের নম্বরে সঠিক টাকা পাঠান।',
      },
      send_money: {
        number: '01799-112233',
        type: 'send_money',
        titleBn: 'bKash পার্সোনাল নম্বর (সেন্ড মানি করুন)',
        titleEn: 'bKash Personal (Send Money)',
        instructionBn: 'আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money অপশন সিলেক্ট করে নিচের নম্বরে সঠিক টাকা পাঠান।',
      },
    },
    nagad: {
      cashout: {
        number: '01912-777888',
        type: 'cashout',
        titleBn: 'Nagad উদ্যোক্তা/এজেন্ট নম্বর (ক্যাশ আউট করুন)',
        titleEn: 'Nagad Agent (Cash Out)',
        instructionBn: 'আপনার নগদ অ্যাপ বা *167# ডায়াল করে Cash Out অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      },
      send_money: {
        number: '01988-445566',
        type: 'send_money',
        titleBn: 'Nagad পার্সোনাল নম্বর (সেন্ড মানি করুন)',
        titleEn: 'Nagad Personal (Send Money)',
        instructionBn: 'আপনার নগদ অ্যাপ বা *167# ডায়াল করে Send Money অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      },
    },
    rocket: {
      cashout: {
        number: '01812-555666-8',
        type: 'cashout',
        titleBn: 'Rocket এজেন্ট নম্বর (ক্যাশ আউট করুন)',
        titleEn: 'Rocket Agent (Cash Out)',
        instructionBn: 'আপনার রকেট অ্যাপ বা *322# ডায়াল করে Cash Out অপশন দিয়ে নিচের ১২ ডিজিট নম্বরে টাকা পাঠান।',
      },
      send_money: {
        number: '01899-667788-2',
        type: 'send_money',
        titleBn: 'Rocket পার্সোনাল নম্বর (সেন্ড মানি করুন)',
        titleEn: 'Rocket Personal (Send Money)',
        instructionBn: 'আপনার রকেট অ্যাপ বা *322# ডায়াল করে Send Money অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      },
    },
    upay: {
      cashout: {
        number: '01922-334455',
        type: 'cashout',
        titleBn: 'Upay এজেন্ট নম্বর (ক্যাশ আউট করুন)',
        titleEn: 'Upay Agent (Cash Out)',
        instructionBn: 'আপনার উপায় অ্যাপ বা *268# ডায়াল করে Cash Out অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      },
      send_money: {
        number: '01933-778899',
        type: 'send_money',
        titleBn: 'Upay পার্সোনাল নম্বর (সেন্ড মানি করুন)',
        titleEn: 'Upay Personal (Send Money)',
        instructionBn: 'আপনার উপায় অ্যাপ বা *268# ডায়াল করে Send Money অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
      },
    },
  };

  sandboxMode: boolean = false;
  operatorConfigured: boolean = true;

  constructor() {
    this.seedInitialData();
    this.loadFromDisk();
  }

  private persistPath = path.resolve(process.cwd(), 'runtime_store.json');
  private saveTimer: any = null;

  saveToDisk() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      try {
        const payload = {
          users: Array.from(this.users.entries()),
          passwords: Array.from(this.passwords.entries()),
          wallets: Array.from(this.wallets.entries()),
          deposits: Array.from(this.deposits.entries()),
          withdrawals: Array.from(this.withdrawals.entries()),
          bets: Array.from(this.bets.entries()),
          paymentChannels: this.paymentChannels,
          depositAccounts: this.depositAccounts,
          dstgamingConfig: this.dstgamingConfig,
          achagamingConfig: this.achagamingConfig,
          casinoApis: Array.from(this.casinoApis.entries()),
          games: this.games,
          banners: this.banners,
          announcementBn: this.announcementBn,
          supportTickets: this.supportTickets,
          auditLogs: this.auditLogs.slice(0, 100),
          referralSettings: this.referralSettings,
          referralReferees: Array.from(this.referralReferees.entries()),
          referralAchievements: Array.from(this.referralAchievements.entries()),
          referralRecords: this.referralRecords,
          operatorConfigured: this.operatorConfigured,
          sandboxMode: this.sandboxMode,
          liveGatewayConfig: this.liveGatewayConfig,
          playerLiveActivities: this.playerLiveActivities.slice(0, 100),
          fraudAlerts: Array.from(this.fraudAlerts.entries()),
        };
        fs.writeFileSync(this.persistPath, JSON.stringify(payload, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to persist runtime store to disk:', err);
      }
    }, 300);
  }

  loadFromDisk() {
    try {
      if (!fs.existsSync(this.persistPath)) return;
      const raw = fs.readFileSync(this.persistPath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.users)) {
        for (const [k, v] of data.users) this.users.set(k, v);
      }
      if (Array.isArray(data.passwords)) {
        for (const [k, v] of data.passwords) {
          if (typeof v === 'string' && v.length > 0) {
            if (v.startsWith('scrypt:')) {
              this.passwords.set(k, v);
            } else if (!(k === 'usr_admin_master' && v === 'admin123')) {
              this.passwords.set(k, hashPassword(v));
            }
          }
        }
      }
      if (process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length >= 6) {
        if (!this.passwords.has('usr_admin_master')) {
          this.passwords.set('usr_admin_master', hashPassword(process.env.ADMIN_PASSCODE.trim()));
        }
      }
      if (Array.isArray(data.wallets)) {
        for (const [k, v] of data.wallets) this.wallets.set(k, v);
      }
      if (Array.isArray(data.deposits)) {
        for (const [k, v] of data.deposits) this.deposits.set(k, v);
      }
      if (Array.isArray(data.withdrawals)) {
        for (const [k, v] of data.withdrawals) this.withdrawals.set(k, v);
      }
      if (Array.isArray(data.bets)) {
        for (const [k, v] of data.bets) this.bets.set(k, v);
      }
      if (Array.isArray(data.paymentChannels) && data.paymentChannels.length > 0) {
        this.paymentChannels = data.paymentChannels;
      }
      if (data.depositAccounts) {
        this.depositAccounts = data.depositAccounts;
      }
      // Strip legacy hardcoded company connectors when hydrating persisted store
      if (Array.isArray(data.casinoApis)) {
        const legacySeedIds = new Set([
          'api_pragmatic',
          'api_evolution',
          'api_pgsoft',
          'api_jili',
          'api_spribe',
          'api_custom',
        ]);
        for (const [k, v] of data.casinoApis) {
          if (v && !legacySeedIds.has(String(k))) {
            this.casinoApis.set(k, v);
          }
        }
      }
      if (Array.isArray(data.games) && data.games.length > 0) {
        // Keep only admin-added or external API-imported real games alongside built-in Aviator Crash
        const externalOrCustomGames = data.games.filter(
          (g: any) =>
            g &&
            typeof g.id === 'string' &&
            g.id !== 'dst_spribe_aviator' &&
            g.id !== 'aviator_crash' &&
            (g.id.startsWith('game_') ||
              g.id.startsWith('ext_') ||
              g.id.startsWith('gw_') ||
              g.id.startsWith('api_game_'))
        );
        this.games = [...SEEDED_GAMES, ...externalOrCustomGames];
      } else {
        this.games = [...SEEDED_GAMES];
      }
      if (Array.isArray(data.banners) && data.banners.length > 0) {
        this.banners = data.banners.map((b: any) =>
          b?.id === 'banner_slots_jackpot' && String(b?.subtitleBn || '').includes('JILI')
            ? {
                ...b,
                subtitleBn: 'স্লট, লাইভ ক্যাসিনো এবং ক্র্যাশ গেমে আকর্ষণীয় জ্যাকপট ও ক্যাশ রিওয়ার্ড',
              }
            : b
        );
      }
      if (data.announcementBn) {
        this.announcementBn = data.announcementBn;
      }
      if (Array.isArray(data.supportTickets)) {
        this.supportTickets = data.supportTickets;
      }
      if (Array.isArray(data.auditLogs)) {
        this.auditLogs = data.auditLogs;
      }
      if (data.referralSettings) {
        this.referralSettings = { ...this.referralSettings, ...data.referralSettings };
      }
      if (Array.isArray(data.referralReferees)) {
        for (const [k, v] of data.referralReferees) this.referralReferees.set(k, v);
      }
      if (Array.isArray(data.referralAchievements)) {
        for (const [k, v] of data.referralAchievements) this.referralAchievements.set(k, v);
      }
      if (Array.isArray(data.referralRecords)) {
        this.referralRecords = data.referralRecords;
      }
      if (typeof data.operatorConfigured === 'boolean') {
        this.operatorConfigured = data.operatorConfigured;
      }
      if (typeof data.sandboxMode === 'boolean') {
        this.sandboxMode = data.sandboxMode;
      }
      if (data.liveGatewayConfig) {
        const gwUrl = String(data.liveGatewayConfig.apiBaseUrl || '');
        if (!gwUrl.includes('dstgaming')) {
          this.liveGatewayConfig = { ...this.liveGatewayConfig, ...data.liveGatewayConfig };
        }
      }
      if (Array.isArray(data.playerLiveActivities)) {
        this.playerLiveActivities = data.playerLiveActivities;
      }
      if (Array.isArray(data.fraudAlerts)) {
        for (const [k, v] of data.fraudAlerts) this.fraudAlerts.set(k, v);
      }
    } catch (err) {
      console.error('Failed to load runtime store from disk:', err);
    }
  }

  seedInitialData() {
    // 1. Seed Single Master Administrator Account (credentials come from ADMIN_PASSCODE env or first-run setup UI)
    const adminUser: User = {
      id: 'usr_admin_master',
      username: 'admin',
      fullName: 'Master Administrator',
      email: 'freelancernayemyt@gmail.com',
      mobile: '+8801999999999',
      role: 'admin',
      kycStatus: 'VERIFIED',
      isSuspended: false,
      isSelfExcluded: false,
      createdAt: new Date().toISOString(),
      securityScore: 100,
    };
    this.users.set(adminUser.id, adminUser);
    if (process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length >= 6) {
      this.passwords.set(adminUser.id, hashPassword(process.env.ADMIN_PASSCODE.trim()));
    }

    const adminWallet: Wallet = {
      userId: adminUser.id,
      currency: 'BDT',
      availablePaisa: 0,
      reservedPaisa: 0,
      bonusPaisa: 0,
      demoPaisa: 0,
    };
    this.wallets.set(adminUser.id, adminWallet);

    // Seed Banners
    this.banners = [
      {
        id: 'banner_welcome',
        badgeBn: '১০০% ফার্স্ট ডিপোজিট বোনাস',
        badgeEn: '100% First Deposit Bonus',
        titleBn: 'নতুন মেম্বারদের জন্য সর্বোচ্চ ৳১০,০০০ ওয়েলকাম বোনাস',
        titleEn: 'Up to ৳10,000 Welcome Bonus for New Members',
        subtitleBn: 'bKash, Nagad ও Rocket দিয়ে ইনস্ট্যান্ট ৳১০০ থেকে ডিপোজিট করুন ও বোনাস উপভোগ করুন',
        subtitleEn: 'Instant deposits from ৳100 via bKash, Nagad & Rocket with instant ledger posting',
        buttonBn: 'এখনই ডিপোজিট করুন',
        buttonEn: 'Deposit Now',
        action: 'deposit',
        bgGradient: 'from-[#1A1538] via-[#2A1B54] to-[#120E28]',
        accentColor: '#FFC943',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
        active: true,
      },
      {
        id: 'banner_sports_ipl',
        badgeBn: 'IPL ও T20 প্রিমিয়ার লিগ ২০২৬',
        badgeEn: 'IPL & T20 Premier League 2026',
        titleBn: 'লাইভ ক্রিকেট বাজিতে সেরা মার্কেট ও অথেনটিক অডস',
        titleEn: 'Highest Authentic Odds & Ball-by-Ball Live Markets',
        subtitleBn: 'বল-বাই-বল লাইভ স্কোর, ইনস্ট্যান্ট ক্যাশআউট এবং সার্বক্ষণিক ম্যাচ নিষ্পত্তি',
        subtitleEn: 'Live score updates, instant cashout, and authoritative market settlement',
        buttonBn: 'স্পোর্টস বাজি ধরুন',
        buttonEn: 'Bet on Sports',
        action: 'sports',
        bgGradient: 'from-[#0E2A38] via-[#123A4D] to-[#0A1A24]',
        accentColor: '#38BDF8',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&auto=format&fit=crop&q=80',
        active: true,
      },
      {
        id: 'banner_slots_jackpot',
        badgeBn: 'মেগা জ্যাকপট ও স্লট',
        badgeEn: 'Mega Jackpot & Slots',
        titleBn: 'জনপ্রিয় স্লট ও লাইভ ক্যাসিনো জ্যাকপট',
        titleEn: 'Popular Slots & Live Casino Jackpots',
        subtitleBn: 'স্লট, লাইভ ক্যাসিনো এবং ক্র্যাশ গেমে আকর্ষণীয় জ্যাকপট ও ক্যাশ রিওয়ার্ড',
        subtitleEn: 'Play slots, live casino, and crash games with high RTP and rewards',
        buttonBn: 'গেমস খেলুন >>',
        buttonEn: 'Play Now >>',
        action: 'crash',
        bgGradient: 'from-[#381523] via-[#4D1A2E] to-[#1F0B13]',
        accentColor: '#F43F5E',
        image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=900&auto=format&fit=crop&q=80',
        active: true,
      },
    ];

    // Clean initial state for real players (no demo deposits or demo transactions)
    this.journalEntries = [];
    this.deposits.clear();
    this.withdrawals.clear();
    this.bets.clear();

    // 5. Seed Built-in Real-Time Crash Game Only (No pre-made games list)
    this.games = [...SEEDED_GAMES];

    // 6. Clean Sports Events by default (Admin or external Sports API can add events)
    this.sportsEvents = [];

    // 7. Seed Support Tickets - Clean initial state for real players
    this.supportTickets = [];

    // 8. Seed Audit Log
    this.auditLogs.push({
      id: 'audit_01',
      actor: 'system',
      action: 'SYSTEM_BOOTSTRAP',
      target: 'CHART_OF_ACCOUNTS',
      timestamp: new Date().toISOString(),
      metadata: { sandboxMode: false, baseCurrency: 'BDT', precision: 'paisa' },
    });

    // 9. Start Casino API Connectors empty (Admin connects any Slot / Live Casino API dynamically)
    this.casinoApis.clear();
  }

  getUserReferralSummary(userId: string, hostUrl?: string): ReferralSummary {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.referralCode) {
      user.referralCode = `REF${user.username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'FB88'}${Math.floor(100 + Math.random() * 900)}`;
      this.saveToDisk();
    }

    if (!this.referralAchievements.has(userId)) {
      this.referralAchievements.set(userId, createDefaultAchievementLevels());
    }

    const referees = this.referralReferees.get(userId) || [];
    const tier1Count = referees.filter((r) => r.tier === 1).length;
    const tier2Count = referees.filter((r) => r.tier === 2).length;
    const tier3Count = referees.filter((r) => r.tier === 3).length;
    const activeFriendsCount = referees.filter((r) => r.status === 'ACTIVE').length;

    const totalTeamDepositPaisa = referees.reduce((sum, r) => sum + (r.totalDepositPaisa || 0), 0);
    const totalTeamTurnoverPaisa = referees.reduce((sum, r) => sum + (r.totalTurnoverPaisa || 0), 0);

    // Update achievement unlock statuses based on active friends
    const achievements = this.referralAchievements.get(userId) || [];
    for (const ach of achievements) {
      if (ach.status === 'LOCKED' && activeFriendsCount >= ach.targetActiveFriends) {
        ach.status = 'CLAIMABLE';
      }
    }

    const domain = hostUrl || 'https://fb88baji.com';
    const referralLink = `${domain}/register?ref=${user.referralCode}`;

    return {
      referralCode: user.referralCode,
      referralLink,
      todayCommissionPaisa: user.referralTodayEarnedPaisa || 0,
      totalCommissionPaisa: user.referralTotalEarnedPaisa || 0,
      claimableCommissionPaisa: user.referralClaimablePaisa || 0,
      totalInvited: referees.length,
      tier1Count,
      tier2Count,
      tier3Count,
      activeFriendsCount,
      totalTeamDepositPaisa,
      totalTeamTurnoverPaisa,
      achievements,
      settings: this.referralSettings,
    };
  }

  ensureReferralCode(userId: string): string {
    const user = this.users.get(userId);
    if (!user) return '';
    if (!user.referralCode) {
      const prefix = user.username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'FB88';
      const suffix = crypto.randomInt(100, 999);
      user.referralCode = `REF${prefix}${suffix}`;
      this.saveToDisk();
    }
    return user.referralCode;
  }

  checkAndUnlockAchievements(userId: string) {
    if (!this.referralAchievements.has(userId)) {
      this.referralAchievements.set(userId, createDefaultAchievementLevels());
    }
    const referees = this.referralReferees.get(userId) || [];
    const activeFriendsCount = referees.filter((r) => r.status === 'ACTIVE').length;
    const achievements = this.referralAchievements.get(userId)!;
    for (const ach of achievements) {
      if (ach.status === 'LOCKED' && activeFriendsCount >= ach.targetActiveFriends) {
        ach.status = 'CLAIMABLE';
      }
    }
  }

  registerWithReferral(newUser: User, referCode?: string, isDuplicateIp: boolean = false) {
    this.ensureReferralCode(newUser.id);
    if (!this.referralAchievements.has(newUser.id)) {
      this.referralAchievements.set(newUser.id, createDefaultAchievementLevels());
    }
    if (!referCode || typeof referCode !== 'string' || !referCode.trim()) return;

    const cleanCode = referCode.trim().toUpperCase();
    let tier1User: User | undefined;
    for (const u of this.users.values()) {
      if (u.id !== newUser.id && u.referralCode?.toUpperCase() === cleanCode) {
        tier1User = u;
        break;
      }
    }
    if (!tier1User) return;

    newUser.referredBy = tier1User.id;
    const now = new Date().toISOString();

    const attachReferee = (referrerId: string, tier: 1 | 2 | 3) => {
      const list = this.referralReferees.get(referrerId) || [];
      if (!list.some((r) => r.userId === newUser.id)) {
        list.unshift({
          userId: newUser.id,
          username: newUser.username,
          tier,
          referrerId,
          joinedAt: now,
          totalDepositPaisa: 0,
          totalTurnoverPaisa: 0,
          commissionEarnedPaisa: 0,
          status: 'REGISTERED',
        });
        this.referralReferees.set(referrerId, list);
      }
    };

    attachReferee(tier1User.id, 1);

    if (!isDuplicateIp && this.referralSettings.signupRewardReferrerPaisa > 0) {
      const bonusPaisa = this.referralSettings.signupRewardReferrerPaisa;
      tier1User.referralClaimablePaisa = (tier1User.referralClaimablePaisa || 0) + bonusPaisa;
      tier1User.referralTotalEarnedPaisa = (tier1User.referralTotalEarnedPaisa || 0) + bonusPaisa;
      tier1User.referralTodayEarnedPaisa = (tier1User.referralTodayEarnedPaisa || 0) + bonusPaisa;
      const t1List = this.referralReferees.get(tier1User.id) || [];
      const row = t1List.find((r) => r.userId === newUser.id);
      if (row) row.commissionEarnedPaisa += bonusPaisa;

      this.referralRecords.unshift({
        id: `refrec_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        userId: tier1User.id,
        refereeId: newUser.id,
        refereeUsername: newUser.username,
        tier: 1,
        type: 'SIGNUP_BONUS',
        amountPaisa: bonusPaisa,
        description: 'Referral Sign-up Bonus',
        descriptionBn: 'সফল রেফারেল সাইন-আপ রিওয়ার্ড',
        createdAt: now,
        status: 'SETTLED',
      });
    }

    if (tier1User.referredBy) {
      const tier2User = this.users.get(tier1User.referredBy);
      if (tier2User && tier2User.id !== newUser.id) {
        attachReferee(tier2User.id, 2);
        if (tier2User.referredBy) {
          const tier3User = this.users.get(tier2User.referredBy);
          if (tier3User && tier3User.id !== newUser.id && tier3User.id !== tier1User.id) {
            attachReferee(tier3User.id, 3);
          }
        }
      }
    }

    this.saveToDisk();
  }

  recordReferralDepositCommission(depositingUserId: string, depositAmountPaisa: number) {
    if (depositAmountPaisa <= 0) return;
    const player = this.users.get(depositingUserId);
    if (!player || !player.referredBy) return;

    const rates = [
      { tier: 1 as const, pct: this.referralSettings.tier1DepositRebatePercent },
      { tier: 2 as const, pct: this.referralSettings.tier2DepositRebatePercent },
      { tier: 3 as const, pct: this.referralSettings.tier3DepositRebatePercent },
    ];

    let currentReferrerId: string | undefined = player.referredBy;
    const visited = new Set<string>([depositingUserId]);

    for (const { tier, pct } of rates) {
      if (!currentReferrerId || visited.has(currentReferrerId)) break;
      visited.add(currentReferrerId);
      const referrer = this.users.get(currentReferrerId);
      if (!referrer) break;

      const commissionPaisa = Math.round(depositAmountPaisa * (pct / 100));
      const referees = this.referralReferees.get(referrer.id) || [];
      let row = referees.find((r) => r.userId === player.id);
      if (!row) {
        row = {
          userId: player.id,
          username: player.username,
          tier,
          referrerId: referrer.id,
          joinedAt: player.createdAt,
          totalDepositPaisa: 0,
          totalTurnoverPaisa: 0,
          commissionEarnedPaisa: 0,
          status: 'REGISTERED',
        };
        referees.unshift(row);
        this.referralReferees.set(referrer.id, referees);
      }

      row.totalDepositPaisa += depositAmountPaisa;
      if (commissionPaisa > 0) {
        row.commissionEarnedPaisa += commissionPaisa;
        referrer.referralClaimablePaisa = (referrer.referralClaimablePaisa || 0) + commissionPaisa;
        referrer.referralTotalEarnedPaisa = (referrer.referralTotalEarnedPaisa || 0) + commissionPaisa;
        referrer.referralTodayEarnedPaisa = (referrer.referralTodayEarnedPaisa || 0) + commissionPaisa;

        this.referralRecords.unshift({
          id: `refdep_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
          userId: referrer.id,
          refereeId: player.id,
          refereeUsername: player.username,
          tier,
          type: 'DEPOSIT_REBATE',
          amountPaisa: commissionPaisa,
          description: `Tier ${tier} Deposit Rebate (${pct}%)`,
          descriptionBn: `লেভেল ${tier} ডিপোজিট রিবেট কমিশন (${pct}%)`,
          createdAt: new Date().toISOString(),
          status: 'SETTLED',
        });
      }

      if (
        row.totalDepositPaisa >= this.referralSettings.minActiveDepositPaisa &&
        row.totalTurnoverPaisa >= this.referralSettings.minActiveTurnoverPaisa
      ) {
        row.status = 'ACTIVE';
      }
      this.checkAndUnlockAchievements(referrer.id);
      currentReferrerId = referrer.referredBy;
    }

    this.saveToDisk();
  }

  recordReferralTurnoverCommission(bettingUserId: string, stakePaisa: number, gameCategory?: string) {
    if (stakePaisa <= 0) return;
    const player = this.users.get(bettingUserId);
    if (!player || !player.referredBy) return;

    const cat = (gameCategory || 'slots').toLowerCase();
    const isSports = cat === 'sports';
    const isLive = cat === 'live' || cat === 'table' || cat === 'poker';
    const isCrash = cat === 'crash';

    const tiers = [
      {
        tier: 1 as const,
        pct: isSports
          ? this.referralSettings.tier1SportsTurnoverPercent
          : isCrash
          ? this.referralSettings.tier1CrashTurnoverPercent
          : isLive
          ? this.referralSettings.tier1LiveTurnoverPercent
          : this.referralSettings.tier1SlotsTurnoverPercent,
      },
      {
        tier: 2 as const,
        pct: isSports
          ? this.referralSettings.tier2SportsTurnoverPercent
          : isCrash
          ? this.referralSettings.tier2CrashTurnoverPercent
          : isLive
          ? this.referralSettings.tier2LiveTurnoverPercent
          : this.referralSettings.tier2SlotsTurnoverPercent,
      },
      {
        tier: 3 as const,
        pct: isSports
          ? this.referralSettings.tier3SportsTurnoverPercent
          : isCrash
          ? this.referralSettings.tier3CrashTurnoverPercent
          : isLive
          ? this.referralSettings.tier3LiveTurnoverPercent
          : this.referralSettings.tier3SlotsTurnoverPercent,
      },
    ];

    let currentReferrerId: string | undefined = player.referredBy;
    const visited = new Set<string>([bettingUserId]);

    for (const { tier, pct } of tiers) {
      if (!currentReferrerId || visited.has(currentReferrerId)) break;
      visited.add(currentReferrerId);
      const referrer = this.users.get(currentReferrerId);
      if (!referrer) break;

      const commissionPaisa = Math.round(stakePaisa * (pct / 100));
      const referees = this.referralReferees.get(referrer.id) || [];
      let row = referees.find((r) => r.userId === player.id);
      if (!row) {
        row = {
          userId: player.id,
          username: player.username,
          tier,
          referrerId: referrer.id,
          joinedAt: player.createdAt,
          totalDepositPaisa: 0,
          totalTurnoverPaisa: 0,
          commissionEarnedPaisa: 0,
          status: 'REGISTERED',
        };
        referees.unshift(row);
        this.referralReferees.set(referrer.id, referees);
      }

      row.totalTurnoverPaisa += stakePaisa;
      if (commissionPaisa > 0) {
        row.commissionEarnedPaisa += commissionPaisa;
        referrer.referralClaimablePaisa = (referrer.referralClaimablePaisa || 0) + commissionPaisa;
        referrer.referralTotalEarnedPaisa = (referrer.referralTotalEarnedPaisa || 0) + commissionPaisa;
        referrer.referralTodayEarnedPaisa = (referrer.referralTodayEarnedPaisa || 0) + commissionPaisa;

        this.referralRecords.unshift({
          id: `refturn_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
          userId: referrer.id,
          refereeId: player.id,
          refereeUsername: player.username,
          tier,
          type: 'TURNOVER_REBATE',
          gameCategory: gameCategory || 'Slots',
          amountPaisa: commissionPaisa,
          description: `Tier ${tier} Turnover Rebate (${pct}%)`,
          descriptionBn: `লেভেল ${tier} টার্নওভার রিবেট (${pct}%)`,
          createdAt: new Date().toISOString(),
          status: 'SETTLED',
        });
        if (this.referralRecords.length > 500) {
          this.referralRecords = this.referralRecords.slice(0, 500);
        }
      }

      if (
        row.totalDepositPaisa >= this.referralSettings.minActiveDepositPaisa &&
        row.totalTurnoverPaisa >= this.referralSettings.minActiveTurnoverPaisa
      ) {
        row.status = 'ACTIVE';
      }
      this.checkAndUnlockAchievements(referrer.id);
      currentReferrerId = referrer.referredBy;
    }

    this.saveToDisk();
  }

  claimReferralCommission(userId: string): { claimedPaisa: number; newBalancePaisa: number; transactionId: string } {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const claimable = user.referralClaimablePaisa || 0;
    if (claimable <= 0) {
      throw new Error('কোনো ক্লেইমযোগ্য কমিশন ব্যালেন্স পাওয়া যায়নি (No claimable commission balance).');
    }

    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        userId,
        currency: 'BDT',
        availablePaisa: 0,
        reservedPaisa: 0,
        bonusPaisa: 0,
        demoPaisa: 0,
      };
      this.wallets.set(userId, wallet);
    }

    wallet.availablePaisa += claimable;
    user.referralClaimablePaisa = 0;

    const txId = `tx_ref_claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.referralRecords.unshift({
      id: `refrec_${Date.now()}`,
      userId,
      refereeId: 'SYSTEM',
      refereeUsername: 'Fb88baji Reward Pool',
      tier: 1,
      type: 'TURNOVER_REBATE',
      amountPaisa: claimable,
      description: 'Transfer Commission to Main Wallet',
      descriptionBn: 'রেফারেল কমিশন সফলভাবে মূল অ্যাকাউন্টে জমা করা হয়েছে (০x টার্নওভার)',
      createdAt: new Date().toISOString(),
      status: 'CLAIMED',
    });

    this.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actor: userId,
      action: 'REFERRAL_COMMISSION_CLAIMED',
      target: userId,
      timestamp: new Date().toISOString(),
      metadata: { claimedPaisa: claimable, newAvailablePaisa: wallet.availablePaisa },
    });

    this.saveToDisk();

    return {
      claimedPaisa: claimable,
      newBalancePaisa: wallet.availablePaisa,
      transactionId: txId,
    };
  }

  claimAchievementReward(userId: string, levelNum: number): { claimedPaisa: number; newBalancePaisa: number; achievement: ReferralAchievementLevel } {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    if (!this.referralAchievements.has(userId)) {
      this.referralAchievements.set(userId, createDefaultAchievementLevels());
    }

    const achievements = this.referralAchievements.get(userId)!;
    const targetAch = achievements.find((a) => a.level === levelNum);
    if (!targetAch) {
      throw new Error('অবৈধ অর্জন লেভেল (Invalid achievement level).');
    }

    if (targetAch.status === 'CLAIMED') {
      throw new Error('এই পুরস্কারটি ইতিমধ্যে গ্রহণ করা হয়েছে (Reward already claimed).');
    }

    if (targetAch.status !== 'CLAIMABLE') {
      throw new Error(`এই লেভেলের পুরস্কারটি আনলক হয়নি। আরও ${targetAch.targetActiveFriends} জন সক্রিয় মেম্বার প্রয়োজন।`);
    }

    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        userId,
        currency: 'BDT',
        availablePaisa: 0,
        reservedPaisa: 0,
        bonusPaisa: 0,
        demoPaisa: 0,
      };
      this.wallets.set(userId, wallet);
    }

    const reward = targetAch.rewardPaisa;
    wallet.availablePaisa += reward;
    targetAch.status = 'CLAIMED';
    targetAch.claimedAt = new Date().toISOString();

    this.referralRecords.unshift({
      id: `refach_${Date.now()}`,
      userId,
      refereeId: 'SYSTEM',
      refereeUsername: 'Fb88baji Achievement',
      tier: 1,
      type: 'ACHIEVEMENT_REWARD',
      amountPaisa: reward,
      description: `Referral Achievement Milestone: ${targetAch.title}`,
      descriptionBn: `আমন্ত্রণ মাইলস্টোন বোনাস: ${targetAch.titleBn} সফলভাবে অর্জিত`,
      createdAt: new Date().toISOString(),
      status: 'CLAIMED',
    });

    this.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actor: userId,
      action: 'REFERRAL_ACHIEVEMENT_CLAIMED',
      target: userId,
      timestamp: new Date().toISOString(),
      metadata: { level: levelNum, rewardPaisa: reward, newAvailablePaisa: wallet.availablePaisa },
    });

    this.saveToDisk();

    return {
      claimedPaisa: reward,
      newBalancePaisa: wallet.availablePaisa,
      achievement: targetAch,
    };
  }

  purgeDemoGamesAndResetTestingCatalog(): number {
    this.games = [...SEEDED_GAMES];
    this.liveGatewayConfig.syncedGamesCount = this.games.length;
    this.saveToDisk();
    return this.games.length;
  }

  recordPlayerActivity(activity: Omit<PlayerLiveActivity, 'id' | 'timestamp'>): PlayerLiveActivity {
    const entry: PlayerLiveActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...activity,
    };
    this.playerLiveActivities.unshift(entry);
    if (this.playerLiveActivities.length > 200) {
      this.playerLiveActivities = this.playerLiveActivities.slice(0, 200);
    }
    const user = this.users.get(activity.userId);
    if (user) {
      user.lastActiveTime = entry.timestamp;
      if (activity.gameTitle) user.currentActiveGame = activity.gameTitle;
      if (activity.ip) user.lastLoginIp = activity.ip;
    }
    this.saveToDisk();
    return entry;
  }

  recordFraudAlert(alert: Omit<FraudAlert, 'id' | 'detectedAt' | 'status'>): FraudAlert {
    const id = `fraud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fullAlert: FraudAlert = {
      id,
      detectedAt: new Date().toISOString(),
      status: 'ACTIVE',
      ...alert,
    };
    this.fraudAlerts.set(id, fullAlert);

    const user = this.users.get(alert.userId);
    if (user) {
      const riskIncrement = alert.severity === 'CRITICAL' ? 50 : alert.severity === 'HIGH' ? 35 : alert.severity === 'MEDIUM' ? 20 : 10;
      user.fraudRiskScore = Math.min(100, (user.fraudRiskScore || 0) + riskIncrement);
      if (!user.fraudFlags) user.fraudFlags = [];
      if (!user.fraudFlags.includes(alert.type)) user.fraudFlags.push(alert.type);

      // Auto-freeze if Critical or risk >= 75
      if (user.fraudRiskScore >= 75 || alert.severity === 'CRITICAL') {
        user.isWalletFrozen = true;
      }
    }
    this.saveToDisk();
    return fullAlert;
  }
}

export function createDefaultAchievementLevels(): ReferralAchievementLevel[] {
  return [
    { level: 1, title: 'Bronze Inviter', titleBn: 'লেভেল ১ (ব্রোঞ্জ ইনভাইটার)', targetActiveFriends: 3, rewardTk: 300, rewardPaisa: 300 * 100, status: 'LOCKED' },
    { level: 2, title: 'Silver Ambassador', titleBn: 'লেভেল ২ (সিলভার অ্যাম্বাসেডর)', targetActiveFriends: 10, rewardTk: 1200, rewardPaisa: 1200 * 100, status: 'LOCKED' },
    { level: 3, title: 'Gold Elite', titleBn: 'লেভেল ৩ (গোল্ড এলিট)', targetActiveFriends: 25, rewardTk: 3500, rewardPaisa: 3500 * 100, status: 'LOCKED' },
    { level: 4, title: 'Platinum Partner', titleBn: 'লেভেল ৪ (প্লাটিনাম পার্টনার)', targetActiveFriends: 50, rewardTk: 8000, rewardPaisa: 8000 * 100, status: 'LOCKED' },
    { level: 5, title: 'Diamond Master', titleBn: 'লেভেল ৫ (ডায়মন্ড মাস্টার)', targetActiveFriends: 100, rewardTk: 20000, rewardPaisa: 20000 * 100, status: 'LOCKED' },
    { level: 6, title: 'Crown Legend', titleBn: 'লেভেল ৬ (ক্রাউন লিজেন্ড)', targetActiveFriends: 250, rewardTk: 55000, rewardPaisa: 55000 * 100, status: 'LOCKED' },
    { level: 7, title: 'Grand Champion', titleBn: 'লেভেল ৭ (গ্র্যান্ড চ্যাম্পিয়ন)', targetActiveFriends: 500, rewardTk: 125000, rewardPaisa: 125000 * 100, status: 'LOCKED' },
    { level: 8, title: 'Fb88 King Club', titleBn: 'লেভেল ৮ (এফবি৮৮ কিং ক্লাব)', targetActiveFriends: 1000, rewardTk: 300000, rewardPaisa: 300000 * 100, status: 'LOCKED' },
  ];
}

export const db = new InMemoryStore();
