/**
 * Ledger View Component for fb88baji
 * Transparent double-entry accounting journal audit explorer
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { JournalEntry, LedgerPosting } from '../types';

export const LedgerView: React.FC<{ lang: 'bn' | 'en' }> = ({ lang }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/ledger');
      const data = await res.json();
      if (data.entries) {
        setEntries(data.entries.slice().reverse()); // most recent first
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const totalDebits = entries.reduce(
    (acc: number, e: JournalEntry) =>
      acc + (e.postings || []).reduce((s: number, l: LedgerPosting) => s + (l.debitPaisa || 0), 0),
    0
  );
  const totalCredits = entries.reduce(
    (acc: number, e: JournalEntry) =>
      acc + (e.postings || []).reduce((s: number, l: LedgerPosting) => s + (l.creditPaisa || 0), 0),
    0
  );
  const isBalanced = totalDebits === totalCredits;

  const filteredEntries =
    filterType === 'ALL'
      ? entries
      : entries.filter((e) => e.eventType && e.eventType.includes(filterType));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#750035] border border-[#940042] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">
              {lang === 'bn' ? 'ডাবল-এন্ট্রি ফাইন্যান্সিয়াল লেজার অডিট' : 'Double-Entry Ledger Audit Trail'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'bn'
              ? 'প্রতিটি ট্রানজেকশনে ব্যালেন্সড ডেবিট ও ক্রেডিট রেকর্ড সংগৃহীত রয়েছে (Integer Minor Paisa Units)।'
              : 'Every single event is audited with strictly balanced debit and credit legs in integer paisa.'}
          </p>
        </div>

        <button
          onClick={fetchLedger}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#47001f] hover:bg-[#940042] text-slate-200 text-xs font-bold border border-[#940042] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}</span>
        </button>
      </div>

      {/* Balance Equality Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#750035] border border-[#940042] text-center">
          <span className="text-xs text-slate-400 font-medium">মোট ডেবিট (Total Debits)</span>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">
            ৳{(totalDebits / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">{totalDebits} Minor Paisa</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#750035] border border-[#940042] text-center">
          <span className="text-xs text-slate-400 font-medium">মোট ক্রেডিট (Total Credits)</span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            ৳{(totalCredits / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">{totalCredits} Minor Paisa</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#750035] border border-[#940042] text-center flex flex-col items-center justify-center">
          <span className="text-xs text-slate-400 font-medium">ব্যালেন্স সমতা (Debits == Credits)</span>
          <div className="flex items-center gap-1.5 text-lg font-black text-emerald-400 mt-1 font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{isBalanced ? '100% BALANCED' : 'IMBALANCE DETECTED'}</span>
          </div>
          <span className="text-[10px] text-slate-500">Zero delta integrity</span>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="bg-[#750035] border border-[#940042] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#940042]">
          <h3 className="text-sm font-extrabold text-white">
            জার্নাল এন্ট্রি রেকর্ডস ({filteredEntries.length})
          </h3>

          <div className="flex items-center gap-2">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'BET', 'PAYOUT'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  filterType === filter
                    ? 'gold-gradient text-slate-950 shadow'
                    : 'bg-[#61002a] hover:bg-[#47001f] text-slate-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">কোনো এন্ট্রি পাওয়া যায়নি।</div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-[#61002a] border border-[#940042] space-y-3"
              >
                {/* Entry header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{entry.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#940042] text-slate-300">
                      {entry.eventType}
                    </span>
                    <span className="text-slate-300 font-medium">{entry.description}</span>
                  </div>

                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Journal Postings Breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800 text-left">
                        <th className="pb-1.5 font-medium">Account Code</th>
                        <th className="pb-1.5 font-medium">Posting ID</th>
                        <th className="pb-1.5 font-medium text-right">Debit (৳)</th>
                        <th className="pb-1.5 font-medium text-right">Credit (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {(entry.postings || []).map((posting: LedgerPosting, idx: number) => (
                        <tr key={idx} className="text-slate-300 hover:bg-[#750035]/50">
                          <td className="py-1.5 pr-2 font-semibold text-slate-200">
                            {posting.accountCode}
                          </td>
                          <td className="py-1.5 pr-2 text-slate-500">{posting.id}</td>
                          <td className="py-1.5 pr-2 text-right font-bold text-amber-300">
                            {posting.debitPaisa > 0
                              ? `৳${(posting.debitPaisa / 100).toFixed(2)}`
                              : '-'}
                          </td>
                          <td className="py-1.5 text-right font-bold text-emerald-400">
                            {posting.creditPaisa > 0
                              ? `৳${(posting.creditPaisa / 100).toFixed(2)}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
