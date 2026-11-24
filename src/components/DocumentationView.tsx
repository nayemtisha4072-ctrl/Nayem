/**
 * Documentation & Architecture Runbook Component for fb88baji
 * Full documentation covering system architecture, double-entry ledger,
 * payment provider gaps checklist, security model, and deployment runbook.
 */

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Server,
  Database,
  Lock,
  Layers,
  CheckCircle2,
  Terminal,
  Code,
} from 'lucide-react';

export const DocumentationView: React.FC<{ lang: 'bn' | 'en' }> = ({ lang }) => {
  const [activeDoc, setActiveDoc] = useState<'architecture' | 'ledger' | 'providers' | 'deployment'>('architecture');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00a859]" />
          <h2 className="text-xl font-extrabold text-[#182620]">
            {lang === 'bn' ? 'আর্কিটেকচার, সিকিউরিটি ও ডিপ্লয়মেন্ট গাইড' : 'Architecture, Security & Runbook'}
          </h2>
        </div>
        <p className="text-xs text-[#557063]">
          Complete engineering specifications, double-entry financial invariants, and production provider checklists.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-[#cde8d8] shadow-sm">
        {[
          { id: 'architecture', label: 'System Architecture', icon: Server },
          { id: 'ledger', label: 'Double-Entry Ledger Model', icon: Layers },
          { id: 'providers', label: 'MFS Provider Production Gaps', icon: ShieldCheck },
          { id: 'deployment', label: 'Deployment & Docker Runbook', icon: Terminal },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeDoc === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveDoc(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow-sm'
                  : 'text-[#557063] hover:bg-[#eaf8f0] hover:text-[#182620]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Doc Content */}
      <div className="bg-white border border-[#cde8d8] rounded-3xl p-6 shadow-sm text-xs text-[#3a5247] space-y-6 leading-relaxed">
        {activeDoc === 'architecture' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-[#182620] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00a859]" />
              <span>1. System Architecture & Component Interactions</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] font-mono text-[11px] space-y-2 overflow-x-auto text-[#182620]">
              <div className="text-[#008844] font-bold">Flow 1: Deposit State Machine</div>
              <div>Client -&gt; POST /payments/deposit -&gt; Mutex Lock -&gt; Create Pending Deposit</div>
              <div>-&gt; Provider Gateway Redirect -&gt; Customer Approves in Sandbox Gateway</div>
              <div>-&gt; Idempotent Webhook Received -&gt; Ledger Transaction:</div>
              <div className="text-emerald-700 font-semibold">   Debit: Cash/MFS Clearing Asset (+)</div>
              <div className="text-emerald-700 font-semibold">   Credit: User Available Liability (+)</div>
              <div>-&gt; Deposit Marked SUCCEEDED -&gt; Real-Time Balance Updated</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] font-mono text-[11px] space-y-2 overflow-x-auto text-[#182620]">
              <div className="text-[#008844] font-bold">Flow 2: Withdrawal Locking & Payout Settlement</div>
              <div>User Requests Withdrawal (e.g. ৳1,000 via Nagad)</div>
              <div>-&gt; Atomic Overdraft Check -&gt; Immediate Ledger Booking:</div>
              <div className="text-emerald-700 font-semibold">   Debit: User Available Liability (-) ৳1,000</div>
              <div className="text-emerald-700 font-semibold">   Credit: User Reserved Liability (+) ৳1,000</div>
              <div>-&gt; Admin Reviews KYC and Payout Destination in Admin Dashboard:</div>
              <div>   IF APPROVED:</div>
              <div className="text-emerald-700 font-semibold">     Debit: User Reserved Liability (-) ৳1,000</div>
              <div className="text-emerald-700 font-semibold">     Credit: Cash/MFS Clearing Asset (-) ৳1,000</div>
              <div>   IF REJECTED:</div>
              <div className="text-amber-700 font-semibold">     Debit: User Reserved Liability (-) ৳1,000</div>
              <div className="text-amber-700 font-semibold">     Credit: User Available Liability (+) ৳1,000</div>
            </div>
          </div>
        )}

        {activeDoc === 'ledger' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-[#182620] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00a859]" />
              <span>2. Chart of Accounts & Strict Invariants</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-1">
                <div className="font-bold text-[#182620] font-mono">ASSETS:</div>
                <p className="text-[#557063]">CASH_MFS_CLEARING: Merchant balances held with bKash, Nagad, and Rocket.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-1">
                <div className="font-bold text-[#182620] font-mono">LIABILITIES:</div>
                <p className="text-[#557063]">USER_AVAILABLE_LIABILITY: Customer funds available for gameplay or withdrawal.</p>
                <p className="text-[#557063]">USER_RESERVED_LIABILITY: Funds locked in pending payouts.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-1">
                <div className="font-bold text-[#182620] font-mono">REVENUES & EQUITY:</div>
                <p className="text-[#557063]">PLATFORM_GGR: Gross Gaming Revenue retained by the platform from house margin.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-1">
                <div className="font-bold text-[#182620] font-mono">EXPENSES:</div>
                <p className="text-[#557063]">PROMO_BONUS_EXPENSE: Marketing bonuses awarded to new registrations.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <strong>Core Invariant:</strong> For any transaction ID, Sum(Line.DebitPaisa) === Sum(Line.CreditPaisa). The ledger engine rejects any un-balanced journal entry at compile/runtime before saving.
            </div>
          </div>
        )}

        {activeDoc === 'providers' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-[#182620] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00a859]" />
              <span>3. Production Readiness Checklist for MFS Providers</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-1">
                <h4 className="font-bold text-[#182620] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a859]" />
                  bKash Payment Gateway (PGW Tokenized)
                </h4>
                <ul className="list-disc list-inside text-[#557063] space-y-0.5 ml-2">
                  <li>Direct corporate merchant agreement with bKash Ltd.</li>
                  <li>Static public IP whitelisting for token grant and execute payment APIs.</li>
                  <li>RSA-2048 keypair / X.509 certificate for webhook payload signature validation.</li>
                  <li>Webhook callback endpoint with TLS 1.3 certificate.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-1">
                <h4 className="font-bold text-[#182620] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a859]" />
                  Nagad API Integration
                </h4>
                <ul className="list-disc list-inside text-[#557063] space-y-0.5 ml-2">
                  <li>Post Office digital financial service commercial merchant contract.</li>
                  <li>Public/Private PGP encryption keys for request payload signing.</li>
                  <li>Static IP binding for IPN callback notifications.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] space-y-1">
                <h4 className="font-bold text-[#182620] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a859]" />
                  Rocket (DBBL) Gateway
                </h4>
                <ul className="list-disc list-inside text-[#557063] space-y-0.5 ml-2">
                  <li>Dutch-Bangla Bank corporate gateway credentials & encryption token.</li>
                  <li>Dedicated automated reconciliation file (EOD settlement parsing).</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'deployment' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-[#182620] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00a859]" />
              <span>4. Docker Compose & Deployment Runbook</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#f4fbf7] border border-[#cde8d8] font-mono text-[11px] space-y-2 overflow-x-auto text-[#182620]">
              <div className="text-[#7c9688]"># Dockerfile build & run</div>
              <div>docker build -t fb88baji-platform:v1 .</div>
              <div>docker run -p 3000:3000 --env-file .env fb88baji-platform:v1</div>
              <div className="pt-2 text-[#7c9688]"># Production Health Check</div>
              <div>GET /api/v1/health -&gt; 200 OK {"{"} status: "healthy", ledger: "balanced" {"}"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
