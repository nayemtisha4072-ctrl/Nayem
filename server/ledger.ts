/**
 * Double-Entry Accounting Ledger Engine for fb88baji
 * 
 * Rules:
 * 1. Every Journal Entry MUST balance: Total Debits == Total Credits.
 * 2. All amounts are integer minor units (paisa). Floating point math is strictly forbidden.
 * 3. Immutable audit trail: Journal entries cannot be edited or deleted, only compensated with reversals.
 * 4. Available vs Reserved funds separation:
 *    - On withdrawal request: Debit 2010_PLAYER_AVAILABLE, Credit 2020_PLAYER_RESERVED
 *    - On withdrawal approved & paid: Debit 2020_PLAYER_RESERVED, Credit 1010/1020/1030_MFS_CLEARING
 *    - On withdrawal rejected: Debit 2020_PLAYER_RESERVED, Credit 2010_PLAYER_AVAILABLE
 */

import { db } from './store.ts';
import type { JournalEntry, LedgerPosting, PaymentMethod } from '../src/types/index.ts';

export class LedgerEngine {
  private lockPromise: Promise<void> = Promise.resolve();

  // Mutex lock to guarantee sequential atomic transaction execution and avoid race conditions
  private async acquireLock<T>(fn: () => Promise<T> | T): Promise<T> {
    let release: () => void;
    const currentLock = this.lockPromise;
    this.lockPromise = new Promise((resolve) => {
      release = resolve;
    });
    await currentLock;
    try {
      return await fn();
    } finally {
      release!();
    }
  }

  /**
   * Post a balanced journal entry and atomically update the player's wallet.
   */
  async postJournalEntry(params: {
    userId: string;
    referenceId: string;
    eventType: JournalEntry['eventType'];
    description: string;
    postings: { accountCode: string; debitPaisa: number; creditPaisa: number }[];
  }): Promise<JournalEntry> {
    return this.acquireLock(() => {
      // 1. Verify that all values are non-negative integers
      let totalDebits = 0;
      let totalCredits = 0;

      for (const p of params.postings) {
        if (!Number.isInteger(p.debitPaisa) || p.debitPaisa < 0) {
          throw new Error(`Invalid debit amount: ${p.debitPaisa}. Must be non-negative integer paisa.`);
        }
        if (!Number.isInteger(p.creditPaisa) || p.creditPaisa < 0) {
          throw new Error(`Invalid credit amount: ${p.creditPaisa}. Must be non-negative integer paisa.`);
        }
        totalDebits += p.debitPaisa;
        totalCredits += p.creditPaisa;
      }

      // 2. Strict double-entry balance check: Debits MUST equal Credits
      if (totalDebits !== totalCredits) {
        throw new Error(
          `Unbalanced Journal Entry: Debits (৳${(totalDebits / 100).toFixed(2)}) != Credits (৳${(totalCredits / 100).toFixed(2)})`
        );
      }

      let wallet = db.wallets.get(params.userId);
      if (!wallet) {
        wallet = {
          userId: params.userId,
          currency: 'BDT',
          availablePaisa: 0,
          reservedPaisa: 0,
          bonusPaisa: 0,
          demoPaisa: 0,
        };
        db.wallets.set(params.userId, wallet);
      }

      // 3. Calculate impact on player balances
      // Liability accounts:
      // - 2010_PLAYER_AVAILABLE: Credit increases available balance; Debit decreases available balance
      // - 2020_PLAYER_RESERVED: Credit increases reserved balance; Debit decreases reserved balance
      let deltaAvailable = 0;
      let deltaReserved = 0;

      for (const p of params.postings) {
        if (p.accountCode === '2010_PLAYER_AVAILABLE') {
          deltaAvailable += p.creditPaisa - p.debitPaisa;
        } else if (p.accountCode === '2020_PLAYER_RESERVED') {
          deltaReserved += p.creditPaisa - p.debitPaisa;
        }
      }

      // 4. Verify no overdraft
      if (wallet.availablePaisa + deltaAvailable < 0) {
        throw new Error(
          `Insufficient available balance: current ৳${(wallet.availablePaisa / 100).toFixed(2)}, required ৳${(Math.abs(deltaAvailable) / 100).toFixed(2)}`
        );
      }
      if (wallet.reservedPaisa + deltaReserved < 0) {
        throw new Error(`Negative reserved balance prevented.`);
      }

      // 5. Apply wallet mutation
      wallet.availablePaisa += deltaAvailable;
      wallet.reservedPaisa += deltaReserved;

      // 6. Create immutable Journal Entry
      const entryId = `je_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const entryPostings: LedgerPosting[] = params.postings.map((p, idx) => ({
        id: `post_${entryId}_${idx + 1}`,
        journalEntryId: entryId,
        accountCode: p.accountCode,
        debitPaisa: p.debitPaisa,
        creditPaisa: p.creditPaisa,
      }));

      const entry: JournalEntry = {
        id: entryId,
        referenceId: params.referenceId,
        eventType: params.eventType,
        description: params.description,
        timestamp: new Date().toISOString(),
        postings: entryPostings,
      };

      db.journalEntries.push(entry);
      return entry;
    });
  }

  /**
   * Credit verified deposit from Payment Gateway (Bank Transfer / bKash / Nagad / Rocket / Upay)
   * Asset Clearing (Debit) -> Player Available Liability (Credit)
   */
  async creditDeposit(userId: string, depositId: string, method: PaymentMethod, amountPaisa: number): Promise<JournalEntry> {
    const clearingAccount =
      method === 'bkash'
        ? '1010_BKASH_CLEARING'
        : method === 'nagad'
        ? '1020_NAGAD_CLEARING'
        : method === 'rocket'
        ? '1030_ROCKET_CLEARING'
        : method === 'upay'
        ? '1040_UPAY_CLEARING'
        : '1000_BANK_CLEARING';

    return this.postJournalEntry({
      userId,
      referenceId: depositId,
      eventType: 'DEPOSIT',
      description: `Verified ${method.toUpperCase()} deposit credit`,
      postings: [
        { accountCode: clearingAccount, debitPaisa: amountPaisa, creditPaisa: 0 },
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: 0, creditPaisa: amountPaisa },
      ],
    });
  }

  /**
   * Reserve funds upon withdrawal request
   * Available Liability (Debit) -> Reserved Liability (Credit)
   */
  async reserveWithdrawal(userId: string, withdrawalId: string, amountPaisa: number): Promise<JournalEntry> {
    return this.postJournalEntry({
      userId,
      referenceId: withdrawalId,
      eventType: 'WITHDRAWAL_RESERVE',
      description: `Hold funds for withdrawal request #${withdrawalId}`,
      postings: [
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: amountPaisa, creditPaisa: 0 },
        { accountCode: '2020_PLAYER_RESERVED', debitPaisa: 0, creditPaisa: amountPaisa },
      ],
    });
  }

  /**
   * Release reserved funds when withdrawal is rejected or cancelled
   * Reserved Liability (Debit) -> Available Liability (Credit)
   */
  async releaseWithdrawal(userId: string, withdrawalId: string, amountPaisa: number, reason: string): Promise<JournalEntry> {
    return this.postJournalEntry({
      userId,
      referenceId: withdrawalId,
      eventType: 'WITHDRAWAL_RELEASE',
      description: `Release reserved funds for rejected/cancelled withdrawal #${withdrawalId} (${reason})`,
      postings: [
        { accountCode: '2020_PLAYER_RESERVED', debitPaisa: amountPaisa, creditPaisa: 0 },
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: 0, creditPaisa: amountPaisa },
      ],
    });
  }

  /**
   * Finalize paid payout
   * Reserved Liability (Debit) -> Clearing Asset (Credit)
   */
  async finalizeWithdrawal(userId: string, withdrawalId: string, method: PaymentMethod, amountPaisa: number): Promise<JournalEntry> {
    const clearingAccount =
      method === 'bkash'
        ? '1010_BKASH_CLEARING'
        : method === 'nagad'
        ? '1020_NAGAD_CLEARING'
        : method === 'rocket'
        ? '1030_ROCKET_CLEARING'
        : method === 'upay'
        ? '1040_UPAY_CLEARING'
        : '1000_BANK_CLEARING';

    return this.postJournalEntry({
      userId,
      referenceId: withdrawalId,
      eventType: 'WITHDRAWAL_PAID',
      description: `Confirmed ${method.toUpperCase()} payout for withdrawal #${withdrawalId}`,
      postings: [
        { accountCode: '2020_PLAYER_RESERVED', debitPaisa: amountPaisa, creditPaisa: 0 },
        { accountCode: clearingAccount, debitPaisa: 0, creditPaisa: amountPaisa },
      ],
    });
  }

  /**
   * Bet stake deduction
   * Available Liability (Debit) -> Platform Gaming Revenue / Liability (Credit)
   */
  async stakeBet(userId: string, betId: string, stakePaisa: number, description: string): Promise<JournalEntry> {
    return this.postJournalEntry({
      userId,
      referenceId: betId,
      eventType: 'BET_STAKE',
      description,
      postings: [
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: stakePaisa, creditPaisa: 0 },
        { accountCode: '4010_GAMING_REVENUE', debitPaisa: 0, creditPaisa: stakePaisa },
      ],
    });
  }

  /**
   * Bet payout credit
   * Platform Gaming Revenue (Debit) -> Available Liability (Credit)
   */
  async winBet(userId: string, betId: string, payoutPaisa: number, description: string): Promise<JournalEntry> {
    return this.postJournalEntry({
      userId,
      referenceId: betId,
      eventType: 'BET_PAYOUT',
      description,
      postings: [
        { accountCode: '4010_GAMING_REVENUE', debitPaisa: payoutPaisa, creditPaisa: 0 },
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: 0, creditPaisa: payoutPaisa },
      ],
    });
  }

  /**
   * Bet cancellation refund before round takeoff
   * Platform Gaming Revenue (Debit) -> Player Available Liability (Credit)
   */
  async refundBet(userId: string, betId: string, stakePaisa: number, description: string): Promise<JournalEntry> {
    return this.postJournalEntry({
      userId,
      referenceId: betId,
      eventType: 'REVERSAL',
      description,
      postings: [
        { accountCode: '4010_GAMING_REVENUE', debitPaisa: stakePaisa, creditPaisa: 0 },
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: 0, creditPaisa: stakePaisa },
      ],
    });
  }

  /**
   * Grant promotional bonus or manual balance adjustment
   * Expense (Debit) -> Player Available Liability (Credit)
   */
  async grantBonus(userId: string, refId: string, amountPaisa: number, description: string): Promise<JournalEntry> {
    return this.postJournalEntry({
      userId,
      referenceId: refId,
      eventType: 'BONUS_GRANT',
      description,
      postings: [
        { accountCode: '5020_PROMOTIONS_EXPENSE', debitPaisa: amountPaisa, creditPaisa: 0 },
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: 0, creditPaisa: amountPaisa },
      ],
    });
  }

  /**
   * Deduct / reverse balance (e.g. correcting mistaken credit or manual balance reduction)
   * Player Available Liability (Debit) -> Promotions Expense Reversal (Credit)
   */
  async deductBalance(userId: string, refId: string, amountPaisa: number, description: string): Promise<JournalEntry> {
    return this.postJournalEntry({
      userId,
      referenceId: refId,
      eventType: 'REVERSAL',
      description,
      postings: [
        { accountCode: '2010_PLAYER_AVAILABLE', debitPaisa: amountPaisa, creditPaisa: 0 },
        { accountCode: '5020_PROMOTIONS_EXPENSE', debitPaisa: 0, creditPaisa: amountPaisa },
      ],
    });
  }

  /**
   * Validate that the entire ledger is strictly balanced.
   */
  verifyTotalLedgerBalance(): { isBalanced: boolean; totalDebitsPaisa: number; totalCreditsPaisa: number; count: number } {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const entry of db.journalEntries) {
      for (const p of entry.postings) {
        totalDebits += p.debitPaisa;
        totalCredits += p.creditPaisa;
      }
    }

    return {
      isBalanced: totalDebits === totalCredits,
      totalDebitsPaisa: totalDebits,
      totalCreditsPaisa: totalCredits,
      count: db.journalEntries.length,
    };
  }
}

export const ledger = new LedgerEngine();
