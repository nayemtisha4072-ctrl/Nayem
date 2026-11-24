/**
 * Authoritative Real-Time Multiplayer Crash Engine (Aviator)
 * - Continuous shared round loop: WAITING -> FLYING -> CRASHED -> WAITING
 * - Provably Fair CSPRNG crashPoint committed via SHA-256 hash prior to takeoff
 * - Dual bet panels per user (panelIndex 1 | 2) + Next-Round Queueing
 * - Authoritative server-side Auto Cash Out + double-entry ledger settlement
 * - Broadcasts live events to all connected WebSocket clients
 */

import crypto from 'crypto';
import type { WebSocket } from 'ws';
import { db } from './store.ts';
import { ledger } from './ledger.ts';
import type { Bet } from '../src/types/index.ts';

export type CrashPhase = 'WAITING' | 'FLYING' | 'CRASHED';

export interface CrashBetRecord {
  betId: string;
  roundId: string;
  userId: string;
  username: string;
  panelIndex: 1 | 2;
  stakePaisa: number;
  stakeTk: number;
  autoCashoutMultiplier?: number;
  status: 'QUEUED' | 'ACTIVE' | 'CASHED_OUT' | 'LOST' | 'CANCELLED';
  cashoutMultiplier?: number;
  payoutPaisa?: number;
  payoutTk?: number;
  placedAt: string;
  cashedOutAt?: string;
}

export interface CrashHistoryItem {
  roundId: string;
  crashPoint: number;
  serverSeed: string;
  serverSeedHash: string;
  crashedAt: string;
}

export interface CrashChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface InternalClient {
  ws: WebSocket;
  userId?: string;
  username?: string;
}

const WAITING_DURATION_MS = 5500;
const CRASHED_DURATION_MS = 3200;
const TICK_INTERVAL_MS = 50;
// Exponential growth: 1.00x -> ~1.5x at 4.2s, 2.0x at 7.3s, 5.0x at 16.9s
const GROWTH_RATE_PER_MS = 0.000095;

export function computeCrashMultiplier(elapsedMs: number): number {
  const m = Math.exp(GROWTH_RATE_PER_MS * Math.max(0, elapsedMs));
  return Number(Math.max(1.0, m).toFixed(2));
}

export function generateProvablyFairRound(): {
  roundId: string;
  serverSeed: string;
  serverSeedHash: string;
  crashPoint: number;
} {
  const cfg = db.crashConfig || { instantCrashPercent: 8, houseEdgePercent: 6, maxMultiplier: 50 };
  const instantPct = Math.max(1, Math.min(35, Number(cfg.instantCrashPercent) || 8));
  const houseEdgePct = Math.max(1, Math.min(25, Number(cfg.houseEdgePercent) || 6));
  const maxMult = Math.max(5, Math.min(200, Number(cfg.maxMultiplier) || 50));

  const roundId = `rnd_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

  const hmacHex = crypto.createHmac('sha256', serverSeed).update(roundId).digest('hex');
  const h52 = BigInt('0x' + hmacHex.slice(0, 13)); // Exact 52-bit unsigned integer [0, 2^52 - 1]
  const two52 = 1n << 52n;

  // Instant 1.00x blast probability (e.g. 8% = 800 / 10000)
  const thresholdBps = BigInt(Math.round(instantPct * 100));
  let crashPoint = 1.0;

  if ((h52 % 10000n) >= thresholdBps) {
    const denom = two52 - h52; // Always >= 1n
    const rtpBps = BigInt(Math.round((100 - houseEdgePct) * 100)); // e.g. 9400 = 94% RTP
    const numerator = 100n * two52 * rtpBps;
    const scaledCenti = Number(numerator / (10000n * denom));
    const clampedCenti = Math.max(101, Math.min(Math.round(maxMult * 100), scaledCenti));
    crashPoint = Number((clampedCenti / 100).toFixed(2));
  }

  return { roundId, serverSeed, serverSeedHash, crashPoint };
}

class RealTimeCrashEngine {
  private phase: CrashPhase = 'WAITING';
  private roundId: string = '';
  private serverSeed: string = '';
  private serverSeedHash: string = '';
  private crashPoint: number = 1.0;
  private phaseStartedAtMs: number = Date.now();
  private currentMultiplier: number = 1.0;

  private currentBets: CrashBetRecord[] = [];
  private queuedNextBets: CrashBetRecord[] = [];
  private previousBets: CrashBetRecord[] = [];
  private topWins: CrashBetRecord[] = [];
  private history: CrashHistoryItem[] = [];
  private chatMessages: CrashChatMessage[] = [];

  private clients: Set<InternalClient> = new Set();
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private phaseTimeout: ReturnType<typeof setTimeout> | null = null;
  private isStarted = false;
  private settlingMutex = false;

  start() {
    if (this.isStarted) return;
    this.isStarted = true;
    this.beginWaitingPhase();
  }

  stop() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    if (this.phaseTimeout) {
      clearTimeout(this.phaseTimeout);
      this.phaseTimeout = null;
    }
    this.isStarted = false;
  }

  registerClient(ws: WebSocket, userId?: string, username?: string): InternalClient {
    const client: InternalClient = { ws, userId, username };
    this.clients.add(client);
    this.sendToClient(client, {
      type: 'crash:init',
      ...this.getSnapshot(userId),
    });
    this.broadcastOnlineCount();
    return client;
  }

  updateClientAuth(client: InternalClient, userId?: string, username?: string) {
    client.userId = userId;
    client.username = username;
    this.sendToClient(client, {
      type: 'crash:init',
      ...this.getSnapshot(userId),
    });
  }

  unregisterClient(client: InternalClient) {
    this.clients.delete(client);
    this.broadcastOnlineCount();
  }

  private sendToClient(client: InternalClient, payload: Record<string, any>) {
    if (client.ws.readyState === 1) {
      try {
        client.ws.send(JSON.stringify(payload));
      } catch {
        // ignore broken socket write
      }
    }
  }

  private broadcast(payload: Record<string, any>) {
    const msg = JSON.stringify(payload);
    for (const c of this.clients) {
      if (c.ws.readyState === 1) {
        try {
          c.ws.send(msg);
        } catch {
          // ignore
        }
      }
    }
  }

  private broadcastOnlineCount() {
    this.broadcast({
      type: 'crash:presence',
      connectedPlayers: Math.max(1, this.clients.size),
    });
  }

  getSnapshot(userId?: string) {
    const now = Date.now();
    const elapsedMs = now - this.phaseStartedAtMs;
    const waitingRemainingMs =
      this.phase === 'WAITING' ? Math.max(0, WAITING_DURATION_MS - elapsedMs) : 0;

    return {
      phase: this.phase,
      roundId: this.roundId,
      serverSeedHash: this.serverSeedHash,
      revealedServerSeed: this.phase === 'CRASHED' ? this.serverSeed : undefined,
      crashPoint: this.phase === 'CRASHED' ? this.crashPoint : undefined,
      currentMultiplier: this.currentMultiplier,
      elapsedMs: this.phase === 'FLYING' ? elapsedMs : 0,
      waitingRemainingMs,
      waitingDurationMs: WAITING_DURATION_MS,
      connectedPlayers: Math.max(1, this.clients.size),
      history: this.history.slice(0, 30),
      currentBets: this.currentBets.map((b) => this.maskBetForPublic(b)),
      previousBets: this.previousBets.map((b) => this.maskBetForPublic(b)),
      topWins: this.topWins.slice(0, 25).map((b) => this.maskBetForPublic(b)),
      chatMessages: this.chatMessages.slice(-40),
      myBets: userId ? this.currentBets.filter((b) => b.userId === userId) : [],
      myQueuedBets: userId ? this.queuedNextBets.filter((b) => b.userId === userId) : [],
    };
  }

  private maskBetForPublic(b: CrashBetRecord) {
    return {
      betId: b.betId,
      roundId: b.roundId,
      userId: b.userId,
      username: b.username,
      panelIndex: b.panelIndex,
      stakeTk: b.stakeTk,
      status: b.status,
      cashoutMultiplier: b.cashoutMultiplier,
      payoutTk: b.payoutTk || 0,
      placedAt: b.placedAt,
    };
  }

  private beginWaitingPhase() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }

    const fair = generateProvablyFairRound();
    this.phase = 'WAITING';
    this.roundId = fair.roundId;
    this.serverSeed = fair.serverSeed;
    this.serverSeedHash = fair.serverSeedHash;
    this.crashPoint = fair.crashPoint;
    this.phaseStartedAtMs = Date.now();
    this.currentMultiplier = 1.0;

    // Move queued next-round bets into active currentBets for this round
    this.currentBets = [];
    const promoted = this.queuedNextBets.splice(0, this.queuedNextBets.length);
    for (const q of promoted) {
      q.roundId = this.roundId;
      q.status = 'ACTIVE';
      const existingBet = db.bets.get(q.betId);
      if (existingBet) {
        existingBet.marketId = this.roundId;
        existingBet.selectionName = 'Active Round';
      }
      this.currentBets.push(q);
    }
    if (promoted.length > 0) {
      db.saveToDisk();
    }

    this.broadcast({
      type: 'crash:waiting',
      roundId: this.roundId,
      serverSeedHash: this.serverSeedHash,
      waitingDurationMs: WAITING_DURATION_MS,
      waitingRemainingMs: WAITING_DURATION_MS,
      currentBets: this.currentBets.map((b) => this.maskBetForPublic(b)),
      history: this.history.slice(0, 30),
    });

    this.phaseTimeout = setTimeout(() => {
      this.beginFlyingPhase();
    }, WAITING_DURATION_MS);
  }

  private beginFlyingPhase() {
    this.phase = 'FLYING';
    this.phaseStartedAtMs = Date.now();
    this.currentMultiplier = 1.0;

    this.broadcast({
      type: 'crash:takeoff',
      roundId: this.roundId,
      serverSeedHash: this.serverSeedHash,
      currentMultiplier: 1.0,
    });

    // Instant 1.00x crash edge case
    if (this.crashPoint <= 1.0) {
      void this.triggerCrash();
      return;
    }

    this.tickTimer = setInterval(() => {
      void this.onFlightTick();
    }, TICK_INTERVAL_MS);
  }

  private async onFlightTick() {
    if (this.phase !== 'FLYING' || this.settlingMutex) return;
    this.settlingMutex = true;
    try {
      const elapsedMs = Date.now() - this.phaseStartedAtMs;
      const nextMult = computeCrashMultiplier(elapsedMs);

      // Process any Auto Cash Outs reached strictly before or at crashPoint
      const targetMultCap = Math.min(nextMult, this.crashPoint);
      for (const b of this.currentBets) {
        if (
          b.status === 'ACTIVE' &&
          b.autoCashoutMultiplier &&
          b.autoCashoutMultiplier >= 1.01 &&
          b.autoCashoutMultiplier < this.crashPoint &&
          targetMultCap >= b.autoCashoutMultiplier
        ) {
          await this.settleCashoutInternal(b, b.autoCashoutMultiplier);
        }
      }

      if (nextMult >= this.crashPoint) {
        await this.triggerCrash();
        return;
      }

      this.currentMultiplier = nextMult;
      this.broadcast({
        type: 'crash:tick',
        roundId: this.roundId,
        currentMultiplier: nextMult,
        elapsedMs,
      });
    } finally {
      this.settlingMutex = false;
    }
  }

  private async triggerCrash() {
    if (this.phase === 'CRASHED') return;
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }

    this.phase = 'CRASHED';
    this.phaseStartedAtMs = Date.now();
    this.currentMultiplier = this.crashPoint;

    let mutatedDb = false;
    for (const b of this.currentBets) {
      if (b.status === 'ACTIVE') {
        b.status = 'LOST';
        b.payoutPaisa = 0;
        b.payoutTk = 0;
        const dbBet = db.bets.get(b.betId);
        if (dbBet && dbBet.status === 'PENDING') {
          dbBet.status = 'LOST';
          dbBet.payoutPaisa = 0;
          dbBet.acceptedOdds = this.crashPoint;
          dbBet.selectionName = `Flew away @ ${this.crashPoint.toFixed(2)}x`;
          dbBet.settledAt = new Date().toISOString();
          mutatedDb = true;
        }
      }
    }

    this.previousBets = [...this.currentBets];
    this.history.unshift({
      roundId: this.roundId,
      crashPoint: this.crashPoint,
      serverSeed: this.serverSeed,
      serverSeedHash: this.serverSeedHash,
      crashedAt: new Date().toISOString(),
    });
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }

    if (mutatedDb) {
      db.saveToDisk();
    }

    this.broadcast({
      type: 'crash:crashed',
      roundId: this.roundId,
      crashPoint: this.crashPoint,
      serverSeed: this.serverSeed,
      serverSeedHash: this.serverSeedHash,
      history: this.history.slice(0, 30),
      previousBets: this.previousBets.map((b) => this.maskBetForPublic(b)),
      topWins: this.topWins.slice(0, 25).map((b) => this.maskBetForPublic(b)),
    });

    this.phaseTimeout = setTimeout(() => {
      this.beginWaitingPhase();
    }, CRASHED_DURATION_MS);
  }

  async placeBet(params: {
    userId: string;
    panelIndex: 1 | 2;
    stakeTk: number;
    autoCashoutMultiplier?: number;
    ip?: string;
  }): Promise<{ bet: CrashBetRecord; queuedForNextRound: boolean; wallet: any }> {
    const user = db.users.get(params.userId);
    if (!user) throw new Error('User not found');
    if (user.isSuspended || user.isBanned) throw new Error('আপনার একাউন্ট স্থগিত বা ব্যান রয়েছে।');
    if (user.isWalletFrozen) throw new Error('অ্যাকাউন্ট সাময়িকভাবে ফ্রিজ রয়েছে।');
    if (user.isSelfExcluded) throw new Error('সেলফ-এক্সক্লুশন চলাকালীন বাজি নিষিদ্ধ।');

    const panelIndex = params.panelIndex === 2 ? 2 : 1;
    const parsedStakeTk = Number(params.stakeTk);
    const stakePaisa = Math.round(parsedStakeTk * 100);

    if (!Number.isFinite(parsedStakeTk) || stakePaisa < 100 || stakePaisa > 10000000) {
      throw new Error('বাজির পরিমাণ সর্বনিম্ন ৳১.০০ থেকে সর্বোচ্চ ৳১,০০,০০০ হতে হবে।');
    }

    const autoMult =
      params.autoCashoutMultiplier && Number(params.autoCashoutMultiplier) >= 1.01
        ? Number(Number(params.autoCashoutMultiplier).toFixed(2))
        : undefined;

    const isWaiting = this.phase === 'WAITING';
    const targetList = isWaiting ? this.currentBets : this.queuedNextBets;

    if (targetList.some((b) => b.userId === user.id && b.panelIndex === panelIndex && (b.status === 'ACTIVE' || b.status === 'QUEUED'))) {
      throw new Error(`প্যানেল ${panelIndex}-এ ইতিমধ্যে একটি সক্রিয় বাজি রয়েছে।`);
    }

    const wallet = db.wallets.get(user.id);
    if (!wallet || wallet.availablePaisa < stakePaisa) {
      throw new Error('পর্যাপ্ত ব্যবহারযোগ্য ব্যালেন্স নেই। অনুগ্রহ করে ডিপোজিট করুন।');
    }

    const betId = `avi_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    await ledger.stakeBet(user.id, betId, stakePaisa, `Aviator Crash Bet (Panel ${panelIndex})`);

    wallet.wageringProgressPaisa = (wallet.wageringProgressPaisa || 0) + stakePaisa;
    user.turnoverPaisa = (user.turnoverPaisa || 0) + stakePaisa;
    user.currentActiveGame = 'Aviator';
    user.lastActiveTime = new Date().toISOString();

    const record: CrashBetRecord = {
      betId,
      roundId: isWaiting ? this.roundId : 'NEXT_ROUND',
      userId: user.id,
      username: user.username,
      panelIndex,
      stakePaisa,
      stakeTk: Number((stakePaisa / 100).toFixed(2)),
      autoCashoutMultiplier: autoMult,
      status: isWaiting ? 'ACTIVE' : 'QUEUED',
      placedAt: new Date().toISOString(),
    };

    targetList.unshift(record);

    const dbBet: Bet = {
      id: betId,
      userId: user.id,
      eventId: 'aviator_crash',
      marketId: record.roundId,
      selectionId: `panel_${panelIndex}`,
      eventName: 'Aviator Crash',
      marketName: `Crash Round (Panel ${panelIndex})`,
      selectionName: isWaiting ? 'Active Round' : 'Queued Next Round',
      stakePaisa,
      acceptedOdds: 1.0,
      potentialReturnPaisa: 0,
      payoutPaisa: 0,
      status: 'PENDING',
      placedAt: record.placedAt,
      oddsChangedConsent: true,
    };
    db.bets.set(betId, dbBet);

    db.recordPlayerActivity({
      userId: user.id,
      username: user.username,
      actionType: 'BET',
      gameId: 'aviator_crash',
      gameTitle: 'Aviator',
      provider: 'Crash Live',
      amountTk: record.stakeTk,
      ip: params.ip || '',
    });
    db.recordReferralTurnoverCommission(user.id, stakePaisa, 'crash');
    db.saveToDisk();

    if (isWaiting) {
      this.broadcast({
        type: 'crash:bet',
        bet: this.maskBetForPublic(record),
      });
    }

    return {
      bet: record,
      queuedForNextRound: !isWaiting,
      wallet: {
        availablePaisa: wallet.availablePaisa,
        availableTk: wallet.availablePaisa / 100,
      },
    };
  }

  async cancelBet(userId: string, panelIndex: 1 | 2): Promise<{ cancelledBetId: string; wallet: any }> {
    const pIdx = panelIndex === 2 ? 2 : 1;

    // 1. Check queued next-round bets first (always cancellable)
    const queuedIdx = this.queuedNextBets.findIndex(
      (b) => b.userId === userId && b.panelIndex === pIdx && b.status === 'QUEUED'
    );
    let targetBet: CrashBetRecord | undefined;
    let wasActiveCurrent = false;

    if (queuedIdx !== -1) {
      targetBet = this.queuedNextBets.splice(queuedIdx, 1)[0];
    } else if (this.phase === 'WAITING') {
      const currIdx = this.currentBets.findIndex(
        (b) => b.userId === userId && b.panelIndex === pIdx && b.status === 'ACTIVE'
      );
      if (currIdx !== -1) {
        targetBet = this.currentBets.splice(currIdx, 1)[0];
        wasActiveCurrent = true;
      }
    }

    if (!targetBet) {
      throw new Error('বাতিল করার মতো কোনো অপেক্ষমান বাজি পাওয়া যায়নি (উড্ডয়নের পর বাজি বাতিল করা যায় না)।');
    }

    targetBet.status = 'CANCELLED';
    await ledger.refundBet(userId, targetBet.betId, targetBet.stakePaisa, `Aviator Bet Cancelled (Panel ${pIdx})`);

    const wallet = db.wallets.get(userId);
    const user = db.users.get(userId);
    if (wallet) {
      wallet.wageringProgressPaisa = Math.max(0, (wallet.wageringProgressPaisa || 0) - targetBet.stakePaisa);
    }
    if (user) {
      user.turnoverPaisa = Math.max(0, (user.turnoverPaisa || 0) - targetBet.stakePaisa);
    }

    const dbBet = db.bets.get(targetBet.betId);
    if (dbBet) {
      dbBet.status = 'VOID';
      dbBet.selectionName = 'Cancelled Before Takeoff';
      dbBet.settledAt = new Date().toISOString();
    }
    db.saveToDisk();

    if (wasActiveCurrent) {
      this.broadcast({
        type: 'crash:bet_cancelled',
        betId: targetBet.betId,
      });
    }

    return {
      cancelledBetId: targetBet.betId,
      wallet: {
        availablePaisa: wallet?.availablePaisa || 0,
        availableTk: (wallet?.availablePaisa || 0) / 100,
      },
    };
  }

  async cashOut(userId: string, panelIndex: 1 | 2, ip?: string): Promise<{ bet: CrashBetRecord; wallet: any }> {
    if (this.phase !== 'FLYING') {
      throw new Error(this.phase === 'CRASHED' ? `প্লেন ইতিমধ্যে ${this.crashPoint.toFixed(2)}x এ চলে গেছে!` : 'ফ্লাইট এখনো শুরু হয়নি।');
    }

    const pIdx = panelIndex === 2 ? 2 : 1;
    const bet = this.currentBets.find(
      (b) => b.userId === userId && b.panelIndex === pIdx && b.status === 'ACTIVE'
    );
    if (!bet) {
      throw new Error(`প্যানেল ${pIdx}-এ কোনো চলমান বাজি নেই।`);
    }

    const elapsedMs = Date.now() - this.phaseStartedAtMs;
    const mult = computeCrashMultiplier(elapsedMs);
    if (mult >= this.crashPoint) {
      throw new Error(`দুঃখিত! ${this.crashPoint.toFixed(2)}x এ প্লেন ক্র্যাশ করেছে!`);
    }

    await this.settleCashoutInternal(bet, mult, ip);
    const wallet = db.wallets.get(userId);

    return {
      bet,
      wallet: {
        availablePaisa: wallet?.availablePaisa || 0,
        availableTk: (wallet?.availablePaisa || 0) / 100,
      },
    };
  }

  private async settleCashoutInternal(bet: CrashBetRecord, multiplier: number, ip?: string) {
    if (bet.status !== 'ACTIVE') return;
    bet.status = 'CASHED_OUT';
    bet.cashoutMultiplier = multiplier;
    const payoutPaisa = Math.round(bet.stakePaisa * multiplier);
    bet.payoutPaisa = payoutPaisa;
    bet.payoutTk = Number((payoutPaisa / 100).toFixed(2));
    bet.cashedOutAt = new Date().toISOString();

    await ledger.winBet(bet.userId, bet.betId, payoutPaisa, `Aviator Win @ ${multiplier.toFixed(2)}x`);

    const dbBet = db.bets.get(bet.betId);
    if (dbBet) {
      dbBet.status = 'WON';
      dbBet.payoutPaisa = payoutPaisa;
      dbBet.potentialReturnPaisa = payoutPaisa;
      dbBet.acceptedOdds = multiplier;
      dbBet.selectionName = `Cashout @ ${multiplier.toFixed(2)}x`;
      dbBet.settledAt = bet.cashedOutAt;
    }

    db.recordPlayerActivity({
      userId: bet.userId,
      username: bet.username,
      actionType: 'WIN',
      gameId: 'aviator_crash',
      gameTitle: 'Aviator',
      provider: 'Crash Live',
      amountTk: bet.payoutTk,
      profitTk: Number((bet.payoutTk - bet.stakeTk).toFixed(2)),
      multiplier,
      ip: ip || '',
    });

    this.topWins.push({ ...bet });
    this.topWins.sort((a, b) => (b.payoutPaisa || 0) - (a.payoutPaisa || 0));
    if (this.topWins.length > 30) {
      this.topWins = this.topWins.slice(0, 30);
    }

    db.saveToDisk();

    this.broadcast({
      type: 'crash:cashout',
      bet: this.maskBetForPublic(bet),
      topWins: this.topWins.slice(0, 25).map((b) => this.maskBetForPublic(b)),
    });
  }

  postChatMessage(userId: string, rawMessage: string): CrashChatMessage {
    const user = db.users.get(userId);
    if (!user) throw new Error('Chat requires login');
    const clean = String(rawMessage || '').trim().slice(0, 200);
    if (!clean) throw new Error('Empty message');

    const msg: CrashChatMessage = {
      id: `chat_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      userId: user.id,
      username: user.username,
      message: clean,
      timestamp: new Date().toISOString(),
    };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 60) {
      this.chatMessages = this.chatMessages.slice(-60);
    }
    this.broadcast({ type: 'crash:chat', message: msg });
    return msg;
  }
}

export const crashEngine = new RealTimeCrashEngine();
