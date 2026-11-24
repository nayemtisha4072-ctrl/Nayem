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
      <div className="bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#182620]">
              {lang === 'bn' ? 'ডাবল-এন্ট্রি ফাইন্যান্সিয়াল লেজার অডিট' : 'Double-Entry Ledger Audit Trail'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-[#557063]">
            {lang === 'bn'
              ? 'প্রতিটি ট্রানজেকশনে ব্যালেন্সড ডেবিট ও ক্রেডিট রেকর্ড সংগৃহীত রয়েছে (Integer Minor Paisa Units)।'
              : 'Every single event is audited with strictly balanced debit and credit legs in integer paisa.'}
          </p>
        </div>

        <button
          onClick={fetchLedger}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#eaf8f0] hover:bg-[#d7f3e3] text-[#007a40] text-xs font-bold border border-[#cde8d8] transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}</span>
        </button>
      </div>

      {/* Balance Equality Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-sm text-center">
          <span className="text-xs text-[#557063] font-medium">মোট ডেবিট (Total Debits)</span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">
            ৳{(totalDebits / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[#7c9688]">{totalDebits} Minor Paisa</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-sm text-center">
          <span className="text-xs text-[#557063] font-medium">মোট ক্রেডিট (Total Credits)</span>
          <div className="text-xl font-black text-[#00994d] font-mono mt-1">
            ৳{(totalCredits / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[#7c9688]">{totalCredits} Minor Paisa</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-sm text-center flex flex-col items-center justify-center">
          <span className="text-xs text-[#557063] font-medium">ব্যালেন্স সমতা (Debits == Credits)</span>
          <div className={`flex items-center gap-1.5 text-lg font-black mt-1 font-mono ${isBalanced ? 'text-[#00994d]' : 'text-rose-600'}`}>
            <CheckCircle2 className={`w-5 h-5 ${isBalanced ? 'text-[#00994d]' : 'text-rose-600'}`} />
            <span>{isBalanced ? '100% BALANCED' : 'IMBALANCE DETECTED'}</span>
          </div>
          <span className="text-[10px] text-[#7c9688]">Zero delta integrity</span>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="bg-white border border-[#cde8d8] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#dceee3]">
          <h3 className="text-sm font-extrabold text-[#182620]">
            জার্নাল এন্ট্রি রেকর্ডস ({filteredEntries.length})
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'BET', 'PAYOUT'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterType === filter
                    ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow-sm'
                    : 'bg-[#f4fbf7] hover:bg-[#eaf8f0] text-[#557063] border border-[#cde8d8]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-[#7c9688] text-xs">কোনো এন্ট্রি পাওয়া যায়নি।</div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-3"
              >
                {/* Entry header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-[#008844]">{entry.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {entry.eventType}
                    </span>
                    <span className="text-[#182620] font-medium">{entry.description}</span>
                  </div>

                  <span className="text-[#7c9688] font-mono text-[11px]">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Journal Postings Breakdown */}
                <div className="overflow-x-auto bg-white rounded-xl border border-[#dceee3] p-2.5">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-[#557063] border-b border-[#dceee3] text-left">
                        <th className="pb-1.5 font-semibold">Account Code</th>
                        <th className="pb-1.5 font-semibold">Posting ID</th>
                        <th className="pb-1.5 font-semibold text-right">Debit (৳)</th>
                        <th className="pb-1.5 font-semibold text-right">Credit (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaf8f0]">
                      {(entry.postings || []).map((posting: LedgerPosting, idx: number) => (
                        <tr key={idx} className="text-[#182620] hover:bg-[#f4fbf7]">
                          <td className="py-1.5 pr-2 font-semibold text-[#182620]">
                            {posting.accountCode}
                          </td>
                          <td className="py-1.5 pr-2 text-[#7c9688]">{posting.id}</td>
                          <td className="py-1.5 pr-2 text-right font-bold text-amber-600">
                            {posting.debitPaisa > 0
                              ? `৳${(posting.debitPaisa / 100).toFixed(2)}`
                              : '-'}
                          </td>
                          <td className="py-1.5 text-right font-bold text-[#00994d]">
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
