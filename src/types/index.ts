/**
 * Shared Type Definitions for fb88baji
 * Integer paisa (1 BDT = 100 paisa) used for all financial calculations.
 */

export type Currency = 'BDT';

export const BDT_PRESETS_TK = [100, 200, 500, 1000, 2000, 5000, 10000, 25000] as const;
export const MIN_DEPOSIT_PAISA = 100 * 100; // ৳100
export const MAX_DEPOSIT_PAISA = 50000 * 100; // ৳50,000
export const MIN_WITHDRAW_PAISA = 500 * 100; // ৳500
export const MAX_WITHDRAW_PAISA = 25000 * 100; // ৳25,000

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank_transfer' | string;

export interface PaymentChannel {
  id: string; // e.g. 'bkash', 'nagad', 'rocket', 'upay', 'bank_transfer', 'usdt', etc.
  name: string; // English Name (e.g. 'bKash')
  nameBn: string; // Bengali Name (e.g. 'বিকাশ')
  type: 'mfs' | 'bank' | 'crypto' | 'other';
  channelType?: 'cashout' | 'send_money' | 'merchant' | 'bank_transfer' | 'crypto_wallet' | 'other';
  badge?: string; // 'MFS', 'DBBL', 'BANK', 'CRYPTO', etc.
  accentColor: string; // Hex color e.g. '#E2136E'
  logoUrl?: string; // Icon identifier or image URL
  accountNumber: string; // Cashout number / Bank Account / Wallet address
  sendMoneyNumber?: string; // Send money personal number (for MFS)
  accountName?: string; // Account holder / Enterprise name
  bankName?: string; // Bank name
  branchName?: string; // Branch name
  routingNumber?: string; // Routing number
  minDepositPaisa: number; // e.g. 100 * 100
  maxDepositPaisa: number; // e.g. 50000 * 100
  minWithdrawPaisa: number; // e.g. 500 * 100
  maxWithdrawPaisa: number; // e.g. 25000 * 100
  bonusPercent?: number; // e.g. 5
  instructionBn?: string;
  instructionEn?: string;
  active: boolean; // Only active channels are visible to players
  isDepositEnabled: boolean;
  isWithdrawEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'user' | 'admin';

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  username: string;
  mobile: string;
  role: UserRole;
  kycStatus: KycStatus;
  isSuspended: boolean;
  isBanned?: boolean;
  isSelfExcluded: boolean;
  selfExclusionUntil?: string;
  dailyDepositLimitPaisa?: number;
  sessionToken?: string;
  createdAt: string;
  // Personal Center fields (Screenshot 13 & 12)
  fullName?: string;
  email?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
  vipLevel?: string;
  lastLoginTime?: string;
  lastLoginIp?: string;
  depositProcessingCount?: number;
  withdrawalProcessingCount?: number;
  personalInfoCompleted?: boolean;
  loginPasswordSet?: boolean;
  ewalletLinked?: boolean;
  linkedEwalletNumber?: string;
  linkedEwalletProvider?: 'bkash' | 'nagad' | 'rocket';
  transactionPasswordSet?: boolean;
  transactionPin?: string;
  securityScore?: number;
  referralCode?: string;
  referredBy?: string;
  referralClaimablePaisa?: number;
  referralTotalEarnedPaisa?: number;
  referralTodayEarnedPaisa?: number;
  // Anti-Fraud, Wagering & Live Monitoring fields
  turnoverPaisa?: number; // Total amount wagered across platform in paisa
  wageringRequirementPaisa?: number; // Total turnover required before bonus withdrawal in paisa
  wageringRemainingPaisa?: number; // Remaining turnover required in paisa
  bonusGrantedTotalPaisa?: number; // Lifetime bonus claimed in paisa
  fraudRiskScore?: number; // 0-100 risk score
  fraudFlags?: string[]; // e.g. ['MULTI_ACCOUNT_IP', 'UNMET_TURNOVER_WITHDRAWAL', 'SHARED_PAYMENT_DESTINATION']
  isWalletFrozen?: boolean; // When frozen, player cannot bet or withdraw
  lastActiveTime?: string;
  currentActiveGame?: string;
  registrationIp?: string;
  deviceFingerprint?: string;
  firebaseUid?: string;
  lastDailyRewardDate?: string;
  lastDailyRewardClaimedAt?: string;
  claimedMissions?: Record<string, string>;
  readMessageIds?: string[];
  nickname?: string;
  points?: number;
  vipProgress?: number;
  vipTarget?: number;
  signInStreak?: number;
  lastSignInDate?: string;
  signInTotalBonusTk?: number;
  growthDaysClaimed?: number[];
  luckySpinDaysClaimed?: number[];
  lastLuckySpinDate?: string;
  claimedRescueDates?: string[];
  claimedVouchers?: Record<string, string>;
  redeemedPromoCodes?: string[];
}

export interface CrashConfig {
  instantCrashPercent: number;
  houseEdgePercent: number;
  maxMultiplier: number;
}

export interface PromoCodeItem {
  id: string;
  code: string;
  rewardTk: number;
  minDepositTk: number;
  maxUses: number;
  usedCount: number;
  usedByUserIds: string[];
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

export interface SuggestionItem {
  id: string;
  userId: string;
  username: string;
  category: string;
  message: string;
  reply?: string;
  status: 'NEW' | 'REVIEWED';
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  userId: string;
  username: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'MULTI_ACCOUNT' | 'SHARED_PAYMENT_DESTINATION' | 'BONUS_ABUSE_WITHDRAWAL' | 'RAPID_BONUS_EXPLOIT' | 'OPPOSING_BET';
  description: string;
  descriptionBn: string;
  details: Record<string, any>;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  detectedAt: string;
}

export interface PlayerLiveActivity {
  id: string;
  userId: string;
  username: string;
  actionType: 'BET' | 'WIN' | 'DEPOSIT' | 'WITHDRAWAL_REQUEST' | 'BONUS_CLAIM' | 'SPIN' | 'LOGIN';
  gameId?: string;
  gameTitle?: string;
  provider?: string;
  amountTk: number;
  profitTk?: number;
  multiplier?: number;
  ip?: string;
  timestamp: string;
}

export interface LiveGatewayConfig {
  id: string;
  gatewayName: string;
  environment: 'production' | 'staging';
  status: 'CONNECTED' | 'DISCONNECTED';
  isEnabled: boolean;
  apiBaseUrl: string;
  operatorCode: string;
  apiKey: string;
  apiSecret: string;
  backofficeUrl: string;
  backofficeUsername?: string;
  backofficePassword?: string;
  currency: 'BDT';
  playerPrefix: string;
  whitelistIps: string;
  seamlessCallbackUrl: string;
  balanceUrl: string;
  betUrl: string;
  settleUrl: string;
  rollbackUrl: string;
  latencyMs?: number;
  lastPingAt?: string;
  lastSyncedAt?: string;
  syncedGamesCount: number;
  notes?: string;
}

export interface Wallet {
  userId: string;
  currency: Currency;
  availablePaisa: number;
  reservedPaisa: number;
  bonusPaisa: number;
  demoPaisa: number;
  wageringRequirementPaisa?: number;
  wageringProgressPaisa?: number;
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface LedgerAccount {
  code: string;
  name: string;
  type: AccountType;
  description: string;
}

export interface LedgerPosting {
  id: string;
  journalEntryId: string;
  accountCode: string;
  debitPaisa: number;
  creditPaisa: number;
}

export interface JournalEntry {
  id: string;
  referenceId: string;
  eventType: 'DEPOSIT' | 'WITHDRAWAL_RESERVE' | 'WITHDRAWAL_PAID' | 'WITHDRAWAL_RELEASE' | 'BET_STAKE' | 'BET_PAYOUT' | 'BONUS_GRANT' | 'REVERSAL';
  description: string;
  timestamp: string;
  postings: LedgerPosting[];
}

export type DepositStatus = 'CREATED' | 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';

export interface Deposit {
  id: string;
  userId: string;
  method: PaymentMethod;
  transferType?: 'cashout' | 'send_money' | 'bank_transfer';
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  branchName?: string;
  agentNumber?: string;
  senderNumber?: string;
  trxId?: string;
  screenshotProof?: string;
  amountPaisa: number;
  status: DepositStatus;
  providerReference: string;
  gatewayTxnId?: string;
  idempotencyKey: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export type WithdrawalStatus =
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'REJECTED'
  | 'FAILED'
  | 'CANCELLED';

export interface Withdrawal {
  id: string;
  userId: string;
  method: PaymentMethod;
  amountPaisa: number;
  payoutDestination: string; // e.g. +88017XXXXXXXX or Bank Account Number
  bankName?: string;
  accountHolder?: string;
  branchName?: string;
  status: WithdrawalStatus;
  providerReference: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  id?: string;
  provider: PaymentMethod | 'casino_api' | string;
  eventType?: string;
  referenceId?: string;
  idempotencyKey: string;
  payload: Record<string, any>;
  receivedAt?: string;
  processedAt: string;
  isDuplicate: boolean;
  status: 'PROCESSED' | 'IGNORED' | 'ERROR';
}

export type GameCategory =
  | 'hot'
  | 'slots'
  | 'fish'
  | 'live'
  | 'poker'
  | 'crash'
  | 'table'
  | 'arcade'
  | 'sports'
  | 'promotions'
  | 'help'
  | 'support';

export interface CasinoApiConfig {
  id: string;
  name: string;
  providerKey: 'slots' | 'live' | 'crash' | 'table' | 'aggregator' | 'custom' | string;
  category?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
  isEnabled: boolean;
  apiEndpoint: string;
  operatorCode: string;
  secretKey: string;
  seamlessWalletCallbackUrl: string;
  currency: 'BDT' | string;
  authType?: 'bearer' | 'x-api-key' | 'hmac-sha256' | 'md5-sign' | 'basic' | 'custom-header' | 'none';
  customHeaderName?: string;
  gamesListEndpoint?: string;
  gamesListMethod?: 'GET' | 'POST';
  launchEndpoint?: string;
  launchMethod?: 'POST' | 'GET' | 'DIRECT_URL';
  playerPrefix?: string;
  webhookSecret?: string;
  extraHeadersJson?: string;
  latencyMs?: number;
  lastPingAt?: string;
  totalGamesIntegrated: number;
}

export interface DSTGamingConfig {
  id: string;
  providerName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
  isEnabled: boolean;
  activeEnvironment: 'staging' | 'production';
  staging: {
    apiUrl: string;
    boUrl: string;
    companyCode: string;
    apiKey: string;
    boUsername: string;
    boPassword: string;
  };
  production: {
    apiUrl: string;
    boUrl: string;
    companyCode: string;
    apiKey: string;
    boUsername: string;
    boPassword: string;
  };
  playerPrefix: string;
  walletType: 'seamless' | 'transfer';
  currency: 'BDT';
  returnUrl: string;
  callbackUrl: string;
  balanceUrl: string;
  betUrl: string;
  settleUrl: string;
  rollbackUrl: string;
  serverIp: string;
  domainWhitelist: string;
  totalProvidersAvailable: number;
  syncedGamesCount: number;
  lastPingAt?: string;
  lastSyncAt?: string;
  latencyMs?: number;
  notes?: string;
}

export interface AchaGamingConfig {
  id: string;
  companyName: string;
  packageName: string;
  packagePriceUsd: number;
  pricingSummary: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
  isEnabled: boolean;
  apiEndpoint: string;
  apiKey: string;
  apiSecret: string;
  playerPrefix: string;
  walletType: 'seamless' | 'transfer';
  currency: 'BDT' | string;
  returnUrl: string;
  callbackUrl: string;
  serverIp: string;
  domainWhitelist: string;
  ggrPercentage: number;
  totalProvidersAvailable: number;
  syncedGamesCount: number;
  lastPingAt?: string;
  lastSyncAt?: string;
  latencyMs?: number;
  notes?: string;
}

export interface GameItem {
  id: string;
  title: string;
  titleBn: string;
  category: GameCategory;
  provider: string;
  rtp: string;
  thumbnail: string;
  isLive?: boolean;
  isHot?: boolean;
  isAvailable: boolean;
  availabilityReason?: string;
  playMode: 'interactive' | 'demo_only' | 'disabled' | 'iframe';
  realLaunchUrl?: string;
  gameCode?: string;
  apiProviderId?: string;
  minBetTk?: number;
  maxBetTk?: number;
  gameReportName?: string;
  officialDemoUrl?: string;
}

export interface SportsMarketSelection {
  id: string;
  name: string;
  odds: number;
  isWinner?: boolean;
}

export interface SportsMarket {
  id: string;
  name: string;
  status: 'OPEN' | 'SUSPENDED' | 'CLOSED';
  selections: SportsMarketSelection[];
}

export interface SportsEvent {
  id: string;
  sport: 'cricket' | 'football' | 'tennis';
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'UPCOMING' | 'LIVE' | 'SETTLED' | 'CLOSED';
  scoreHome?: string;
  scoreAway?: string;
  currentOverOrMin?: string;
  markets: SportsMarket[];
}

export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID';

export interface Bet {
  id: string;
  userId: string;
  eventId: string;
  marketId: string;
  selectionId: string;
  eventName: string;
  marketName: string;
  selectionName: string;
  stakePaisa: number;
  acceptedOdds: number;
  potentialReturnPaisa: number;
  status: BetStatus;
  placedAt: string;
  settledAt?: string;
  oddsChangedConsent: boolean;
  payoutPaisa?: number;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'user' | 'admin' | 'system';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: 'deposit' | 'withdrawal' | 'account' | 'game' | 'other';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  messages: SupportTicketMessage[];
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PromotionOffer {
  id: string;
  title: string;
  titleBn: string;
  bonusPercentage: number;
  maxBonusPaisa: number;
  minDepositPaisa: number;
  wageringMultiplier: number;
  expiryDays: number;
  badge: string;
  descriptionBn: string;
  termsBn: string[];
}

export interface AutomatedTestResult {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  durationMs: number;
  logs: string[];
  details?: Record<string, any>;
}

export interface TestReport {
  timestamp: string;
  passed: boolean;
  durationMs: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  results: {
    testId: string;
    title: string;
    passed: boolean;
    durationMs: number;
    logs: string[];
  }[];
}

// ==========================================
// REFERRAL & AFFILIATE PROGRAM (Fb88baji)
// ==========================================

export type ReferralTier = 1 | 2 | 3;

export interface ReferralReferee {
  userId: string;
  username: string;
  avatarUrl?: string;
  tier: ReferralTier;
  referrerId: string;
  joinedAt: string;
  totalDepositPaisa: number;
  totalTurnoverPaisa: number;
  commissionEarnedPaisa: number;
  status: 'ACTIVE' | 'REGISTERED';
}

export interface ReferralAchievementLevel {
  level: number;
  title: string;
  titleBn: string;
  targetActiveFriends: number;
  rewardPaisa: number;
  rewardTk: number;
  status: 'LOCKED' | 'CLAIMABLE' | 'CLAIMED';
  claimedAt?: string;
}

export type ReferralIncomeType =
  | 'SIGNUP_BONUS'
  | 'DEPOSIT_REBATE'
  | 'TURNOVER_REBATE'
  | 'ACHIEVEMENT_REWARD';

export interface ReferralCommissionRecord {
  id: string;
  userId: string;
  refereeId: string;
  refereeUsername: string;
  tier: ReferralTier;
  type: ReferralIncomeType;
  gameCategory?: string;
  amountPaisa: number;
  description: string;
  descriptionBn: string;
  createdAt: string;
  status: 'SETTLED' | 'CLAIMED';
}

export interface ReferralSettings {
  tier1DepositRebatePercent: number; // 1.5%
  tier1SlotsTurnoverPercent: number; // 1.0%
  tier1LiveTurnoverPercent: number;  // 0.5%
  tier1SportsTurnoverPercent: number; // 0.6%
  tier1CrashTurnoverPercent: number; // 0.8%
  
  tier2DepositRebatePercent: number; // 0.8%
  tier2SlotsTurnoverPercent: number; // 0.5%
  tier2LiveTurnoverPercent: number;  // 0.3%
  tier2SportsTurnoverPercent: number; // 0.3%
  tier2CrashTurnoverPercent: number; // 0.4%

  tier3DepositRebatePercent: number; // 0.3%
  tier3SlotsTurnoverPercent: number; // 0.2%
  tier3LiveTurnoverPercent: number;  // 0.1%
  tier3SportsTurnoverPercent: number; // 0.1%
  tier3CrashTurnoverPercent: number; // 0.1%

  minActiveDepositPaisa: number; // ৳500
  minActiveTurnoverPaisa: number; // ৳1,000
  signupRewardReferrerPaisa: number; // ৳100
  signupRewardRefereePaisa: number; // ৳100
}

export interface ReferralSummary {
  referralCode: string;
  referralLink: string;
  todayCommissionPaisa: number;
  totalCommissionPaisa: number;
  claimableCommissionPaisa: number;
  totalInvited: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  activeFriendsCount: number;
  totalTeamDepositPaisa: number;
  totalTeamTurnoverPaisa: number;
  achievements: ReferralAchievementLevel[];
  settings: ReferralSettings;
  todayIncomePaisa?: number;
  yesterdayIncomePaisa?: number;
  registersToday?: number;
  registersYesterday?: number;
  registersMonth?: number;
  platformTotals?: {
    invitationRewardsTk: number;
    invitationClaimedCount: number;
    achievementRewardsTk: number;
    achievementClaimedCount: number;
    depositRebateTk: number;
    depositClaimedCount: number;
    bettingRebateTk: number;
    bettingClaimedCount: number;
  };
  leaderboard?: Array<{
    maskedUsername: string;
    amountTk: number;
  }>;
}

