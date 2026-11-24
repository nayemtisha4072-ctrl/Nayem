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
      <div className="bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#182620]">
              {lang === 'bn' ? 'স্বয়ংক্রিয় গ্রহণযোগ্যতা ও লেজার টেস্ট স্যুট' : 'Automated Acceptance Test Suite'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              ACID Verified
            </span>
          </div>
          <p className="text-xs text-[#557063]">
            {lang === 'bn'
              ? 'সার্ভার-সাইড লেজারের গাণিতিক সমতা, ডুপ্লিকেট পেমেন্ট প্রতিরোধ এবং কনকারেন্সি টেস্ট সরাসরি চালান।'
              : 'Execute server-side ledger balance, duplicate webhook prevention, and concurrency tests.'}
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:brightness-105 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <RotateCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4 fill-white text-white" />
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{testError}</span>
        </div>
      )}

      {/* Summary Scorecard if completed */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-sm">
            <span className="text-xs text-[#557063] font-medium">সামগ্রিক ফলাফল</span>
            <div
              className={`text-2xl font-black mt-1 ${
                report.passed ? 'text-[#00994d]' : 'text-rose-600'
              }`}
            >
              {report.passed ? 'ALL PASSED' : 'SOME FAILED'}
            </div>
            <span className="text-[10px] text-[#7c9688]">100% Acceptance Criteria</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-sm">
            <span className="text-xs text-[#557063] font-medium">সফল টেস্ট সংখ্যা</span>
            <div className="text-2xl font-black text-[#00994d] font-mono mt-1">
              {report.summary.passed} / {report.summary.total}
            </div>
            <span className="text-[10px] text-[#7c9688]">Criteria Satisfied</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-sm">
            <span className="text-xs text-[#557063] font-medium">ব্যর্থ টেস্ট</span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">
              {report.summary.failed}
            </div>
            <span className="text-[10px] text-[#7c9688]">Zero tolerance</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#cde8d8] shadow-sm">
            <span className="text-xs text-[#557063] font-medium">মোট অতিবাহিত সময়</span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {report.durationMs} ms
            </div>
            <span className="text-[10px] text-[#7c9688]">Atomic execution</span>
          </div>
        </div>
      )}

      {/* Test Suites List */}
      <div className="space-y-4">
        {report ? (
          report.results.map((test: any, idx: number) => (
            <div
              key={test.testId}
              className="bg-white border border-[#cde8d8] rounded-3xl p-5 shadow-sm space-y-3"
            >
              {/* Test Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#dceee3]">
                <div className="flex items-center gap-2.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00994d] shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-[#182620]">
                      {idx + 1}. {test.title}
                    </h3>
                    <p className="text-[11px] text-[#557063] font-mono">
                      ID: {test.testId} • {test.durationMs}ms
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    test.passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              {/* Step Logs Console */}
              <div className="p-3 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] font-mono text-[11px] text-[#182620] space-y-1">
                <div className="flex items-center gap-1.5 text-[#557063] pb-1 border-b border-[#dceee3] text-[10px]">
                  <Terminal className="w-3 h-3 text-[#00994d]" />
                  <span>EXECUTION LOGS</span>
                </div>
                {test.logs.map((log: string, i: number) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-[#7c9688] mr-2">›</span>
                    <span
                      className={
                        log.startsWith('PASSED')
                          ? 'text-[#008844] font-bold'
                          : log.startsWith('FAILED')
                          ? 'text-rose-600 font-bold'
                          : 'text-[#182620]'
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
          <div className="p-8 text-center bg-white border border-[#cde8d8] rounded-3xl shadow-sm space-y-3">
            <ShieldCheck className="w-12 h-12 mx-auto text-[#00a859]" />
            <h3 className="text-base font-bold text-[#182620]">
              সার্ভার অ্যাকসেপটেন্স টেস্ট চালানোর জন্য প্রস্তুত
            </h3>
            <p className="text-xs text-[#557063] max-w-lg mx-auto leading-relaxed">
              এই টেস্ট স্যুট স্বয়ংক্রিয়ভাবে লেজার সমতা (Sum Debits === Sum Credits), ওভারড্রাফট সুরক্ষা, আইডিমপোটেন্ট পেমেন্ট প্রসেসিং, বন্ধ মার্কেট বাজি প্রত্যাখ্যান এবং দায়িত্বশীল গেমিং নিয়ন্ত্রণ যাচাই করে।
            </p>
            <button
              onClick={runTests}
              className="mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:brightness-105 transition cursor-pointer"
            >
              এখনই টেস্ট চালান →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
