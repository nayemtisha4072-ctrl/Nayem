/**
 * Automated Tests View Component for fb88baji
 * Runs comprehensive automated acceptance tests against the server ledger engine,
 * verifying double-entry balance, overdraft protection, webhook idempotency,
 * closed-market rejection, self-exclusion, and provably fair math.
 */

import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Terminal,
} from 'lucide-react';
import { TestReport } from '../types';

export const AutomatedTestsView: React.FC<{ lang: 'bn' | 'en' }> = ({ lang }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<TestReport | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestError(null);
    try {
      const res = await fetch('/api/v1/tests/run', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setReport(data as TestReport);
    } catch (err: any) {
      setTestError(`Test runner error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Card */}
      <div className="bg-[#750035] border border-[#940042] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">
              {lang === 'bn' ? 'স্বয়ংক্রিয় গ্রহণযোগ্যতা ও লেজার টেস্ট স্যুট' : 'Automated Acceptance Test Suite'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              ACID Verified
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'bn'
              ? 'সার্ভার-সাইড লেজারের গাণিতিক সমতা, ডুপ্লিকেট পেমেন্ট প্রতিরোধ এবং কনকারেন্সি টেস্ট সরাসরি চালান।'
              : 'Execute server-side ledger balance, duplicate webhook prevention, and concurrency tests.'}
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-3 rounded-full gold-gradient text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
          )}
          <span>
            {isRunning
              ? lang === 'bn'
                ? 'টেস্টগুলো চলছে...'
                : 'Running Tests...'
              : lang === 'bn'
              ? 'সকল টেস্ট চালান'
              : 'Run All Tests'}
          </span>
        </button>
      </div>

      {testError && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{testError}</span>
        </div>
      )}

      {/* Summary Scorecard if completed */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#750035] border border-[#940042]">
            <span className="text-xs text-slate-400 font-medium">সামগ্রিক ফলাফল</span>
            <div
              className={`text-2xl font-black mt-1 ${
                report.passed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {report.passed ? 'ALL PASSED' : 'SOME FAILED'}
            </div>
            <span className="text-[10px] text-slate-500">100% Acceptance Criteria</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#750035] border border-[#940042]">
            <span className="text-xs text-slate-400 font-medium">সফল টেস্ট সংখ্যা</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {report.summary.passed} / {report.summary.total}
            </div>
            <span className="text-[10px] text-slate-500">Criteria Satisfied</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#750035] border border-[#940042]">
            <span className="text-xs text-slate-400 font-medium">ব্যর্থ টেস্ট</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {report.summary.failed}
            </div>
            <span className="text-[10px] text-slate-500">Zero tolerance</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#750035] border border-[#940042]">
            <span className="text-xs text-slate-400 font-medium">মোট অতিবাহিত সময়</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {report.durationMs} ms
            </div>
            <span className="text-[10px] text-slate-500">Atomic execution</span>
          </div>
        </div>
      )}

      {/* Test Suites List */}
      <div className="space-y-4">
        {report ? (
          report.results.map((test: any, idx: number) => (
            <div
              key={test.testId}
              className="bg-[#750035] border border-[#940042] rounded-3xl p-5 shadow-lg space-y-3"
            >
              {/* Test Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#940042]">
                <div className="flex items-center gap-2.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {idx + 1}. {test.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ID: {test.testId} • {test.durationMs}ms
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    test.passed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              {/* Step Logs Console */}
              <div className="p-3 rounded-2xl bg-[#121523] border border-[#47001f] font-mono text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 pb-1 border-b border-slate-800 text-[10px]">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  <span>EXECUTION LOGS</span>
                </div>
                {test.logs.map((log: string, i: number) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-slate-600 mr-2">›</span>
                    <span
                      className={
                        log.startsWith('PASSED')
                          ? 'text-emerald-400 font-bold'
                          : log.startsWith('FAILED')
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Initial Empty state with description of all 6 test suites */
          <div className="p-8 text-center bg-[#750035] border border-[#940042] rounded-3xl space-y-3">
            <ShieldCheck className="w-12 h-12 mx-auto text-amber-400" />
            <h3 className="text-base font-bold text-white">
              সার্ভার অ্যাকসেপটেন্স টেস্ট চালানোর জন্য প্রস্তুত
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              এই টেস্ট স্যুট স্বয়ংক্রিয়ভাবে লেজার সমতা (Sum Debits === Sum Credits), ওভারড্রাফট সুরক্ষা, আইডিমপোটেন্ট পেমেন্ট প্রসেসিং, বন্ধ মার্কেট বাজি প্রত্যাখ্যান এবং দায়িত্বশীল গেমিং নিয়ন্ত্রণ যাচাই করে।
            </p>
            <button
              onClick={runTests}
              className="mt-2 px-6 py-2.5 rounded-full gold-gradient text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
            >
              এখনই টেস্ট চালান →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
