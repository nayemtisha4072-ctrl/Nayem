/**
 * My Wallet Modal Component for fb88baji
 * Displays the 5 official payment channels matching user specifications & uploaded image:
 * 1. Bank Transfer
 * 2. bKash
 * 3. Nagad
 * 4. Rocket
 * 5. Upay
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Upload,
  Building2,
  Phone,
  Landmark,
} from 'lucide-react';
import {
  User,
  Wallet,
  PaymentMethod,
  Deposit,
  Withdrawal,
  PaymentChannel,
} from '../types';
import {
  BkashLogo,
  NagadLogo,
  RocketLogo,
  UpayLogo,
  BankTransferLogo,
} from './BrandLogos';
import { safeApiFetch } from '../utils/api';

interface WalletModalProps {
  initialTab?: 'deposit' | 'withdraw' | 'history';
  user: User | null;
  wallet: Wallet | null;
  onClose: () => void;
  onRefreshWallet: () => void;
  lang: 'bn' | 'en';
}

const DEFAULT_PAYMENT_CHANNELS: PaymentChannel[] = [
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
    instructionBn: 'আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে Cash Out অপশন দিয়ে নিচের নম্বরে টাকা পাঠান।',
    active: true,
    isDepositEnabled: true,
    isWithdrawEnabled: true,
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
    active: true,
    isDepositEnabled: true,
    isWithdrawEnabled: true,
  },
];

export const renderChannelLogo = (channel: PaymentChannel, size: 'sm' | 'md' = 'sm') => {
  if (channel.id === 'bkash' || channel.logoUrl === 'bkash') {
    return <BkashLogo size={size} showText={false} />;
  }
  if (channel.id === 'nagad' || channel.logoUrl === 'nagad') {
    return <NagadLogo size={size} showText={false} />;
  }
  if (channel.id === 'rocket' || channel.logoUrl === 'rocket') {
    return <RocketLogo size={size} showText={false} />;
  }
  if (channel.id === 'upay' || channel.logoUrl === 'upay') {
    return <UpayLogo size={size} showText={false} />;
  }
  if (channel.id === 'bank_transfer' || channel.type === 'bank' || channel.logoUrl === 'bank_transfer') {
    return <BankTransferLogo size={size} showText={false} />;
  }
  if (channel.logoUrl && (channel.logoUrl.startsWith('http') || channel.logoUrl.startsWith('/'))) {
    return <img src={channel.logoUrl} alt={channel.name} className="w-6 h-6 object-contain" />;
  }
  return <Banknote className="w-5 h-5 text-amber-400" />;
};

export const WalletModal: React.FC<WalletModalProps> = ({
  initialTab = 'deposit',
  user,
  wallet,
  onClose,
  onRefreshWallet,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(
    initialTab === 'withdraw' ? 'withdraw' : 'deposit'
  );
  const [channels, setChannels] = useState<PaymentChannel[]>(DEFAULT_PAYMENT_CHANNELS);
  const [method, setMethod] = useState<string>('bkash');

  const activeChannels: PaymentChannel[] = channels.filter((c) => c.active !== false);
  const depositChannels: PaymentChannel[] = activeChannels.filter((c) => c.isDepositEnabled !== false);
  const withdrawChannels: PaymentChannel[] = activeChannels.filter((c) => c.isWithdrawEnabled !== false);
  const selectedChannel: PaymentChannel =
    channels.find((c) => c.id === method) ||
    depositChannels[0] ||
    activeChannels[0] ||
    DEFAULT_PAYMENT_CHANNELS[0];
  const [promotion, setPromotion] = useState<string>('Normal');
  const [amountTk, setAmountTk] = useState<number>(500);
  const [senderNumber, setSenderNumber] = useState<string>(user?.mobile || '');
  const [trxId, setTrxId] = useState<string>('');
  const [screenshotProof, setScreenshotProof] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [depositAccounts, setDepositAccounts] = useState<any>(null);

  // Withdrawal States
  const [payoutMobile, setPayoutMobile] = useState<string>(user?.mobile || '');
  const [bankWithdrawName, setBankWithdrawName] = useState<string>('Dutch-Bangla Bank PLC');
  const [bankWithdrawHolder, setBankWithdrawHolder] = useState<string>(user?.fullName || '');
  const [bankWithdrawAcc, setBankWithdrawAcc] = useState<string>('');
  const [bankWithdrawBranch, setBankWithdrawBranch] = useState<string>('Dhaka Main Branch');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch official payment channels (active only)
  useEffect(() => {
    safeApiFetch<{ channels: PaymentChannel[] }>('/api/v1/payments/channels')
      .then((res) => {
        if (res.ok && Array.isArray(res.data?.channels) && res.data.channels.length > 0) {
          setChannels(res.data.channels);
          if (!res.data.channels.some((c: PaymentChannel) => c.id === method)) {
            setMethod(res.data.channels[0].id);
          }
        }
      })
      .catch(() => {});

    safeApiFetch<{ accounts: Record<string, any> }>('/api/v1/payments/deposit-accounts')
      .then((res) => {
        if (res.ok && res.data?.accounts) {
          setDepositAccounts(res.data.accounts);
        }
      })
      .catch(() => {});
  }, []);

  const balanceNumber = wallet ? (wallet.availablePaisa / 100).toFixed(2) : '0.00';

  // Current active official bank details
  const officialBank = depositAccounts?.bank_transfer || {
    bankName: 'Dutch-Bangla Bank PLC (DBBL)',
    accountName: 'FB88BAJI OFFICIAL ENTERPRISE',
    accountNumber: '115.120.0098765',
    branchName: 'Motijheel Corporate Branch, Dhaka',
    routingNumber: '090261745',
  };

  // Current active official MFS number
  const currentMfsNumber =
    depositAccounts?.[method]?.cashout?.number ||
    depositAccounts?.[method]?.send_money?.number ||
    (method === 'bkash'
      ? '01712-888999'
      : method === 'nagad'
      ? '01912-777888'
      : method === 'rocket'
      ? '01812-555666-8'
      : '01922-334455');

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'ফাইলের সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারে।' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotProof(reader.result as string);
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!trxId || trxId.trim().length < 4) {
      setFeedback({ type: 'error', message: 'অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন।' });
      return;
    }

    if (!screenshotProof) {
      setFeedback({ type: 'error', message: 'অনুগ্রহ করে পেমেন্টের স্ক্রিনশট প্রুফ (Screenshot Proof) আপলোড করুন।' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await safeApiFetch<{ message: string; error?: string }>('/api/v1/payments/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.sessionToken ? `Bearer ${user.sessionToken}` : '',
        },
        body: JSON.stringify({
          method,
          transferType: method === 'bank_transfer' ? 'bank_transfer' : 'cashout',
          amountTk,
          trxId: trxId.trim().toUpperCase(),
          senderNumber: senderNumber || user.mobile,
          screenshotProof,
        }),
      });

      setIsSubmitting(false);

      if (!res.ok) throw new Error(res.error || 'ডিপোজিট আবেদন ব্যর্থ হয়েছে');

      setFeedback({
        type: 'success',
        message: res.data?.message || `৳${amountTk} ডিপোজিট সফলভাবে জমা হয়েছে! অ্যাডমিন ট্রানজেকশন যাচাই করে অনুমোদন দিলে ব্যালেন্স পাবেন।`,
      });
      setTrxId('');
      setScreenshotProof('');
      onRefreshWallet();
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (method === 'bank_transfer') {
      if (!bankWithdrawAcc || bankWithdrawAcc.trim().length < 6) {
        setFeedback({ type: 'error', message: 'অনুগ্রহ করে সঠিক ব্যাংক একাউন্ট নম্বর প্রদান করুন।' });
        return;
      }
      if (!bankWithdrawHolder) {
        setFeedback({ type: 'error', message: 'অনুগ্রহ করে একাউন্ট ধারকের নাম প্রদান করুন।' });
        return;
      }
    } else {
      const dest = payoutMobile || user.mobile;
      if (!dest || dest.length < 10) {
        setFeedback({ type: 'error', message: 'অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন।' });
        return;
      }
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payoutDest =
        method === 'bank_transfer'
          ? `${bankWithdrawName} - A/C: ${bankWithdrawAcc} (${bankWithdrawHolder})`
          : payoutMobile || user.mobile;

      const res = await safeApiFetch<{ message: string; error?: string }>('/api/v1/payments/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.sessionToken ? `Bearer ${user.sessionToken}` : '',
        },
        body: JSON.stringify({
          method,
          amountTk,
          payoutDestination: payoutDest,
          bankName: method === 'bank_transfer' ? bankWithdrawName : undefined,
          accountHolder: method === 'bank_transfer' ? bankWithdrawHolder : undefined,
          branchName: method === 'bank_transfer' ? bankWithdrawBranch : undefined,
        }),
      });

      setIsSubmitting(false);

      if (!res.ok) throw new Error(res.error || 'উইথড্রয়াল আবেদন ব্যর্থ হয়েছে');

      setFeedback({
        type: 'success',
        message: res.data?.message || `৳${amountTk} উইথড্রয়াল আবেদন গৃহীত হয়েছে এবং ব্যালেন্স রিজার্ভ করা হয়েছে।`,
      });
      onRefreshWallet();
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#f4fbf7] border border-[#cde8d8] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#16b864] to-[#00994d] px-5 py-3.5 flex items-center justify-between border-b border-emerald-400/30 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white tracking-wide">My wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: [ Deposit ] vs [ Withdrawal ] */}
        <div className="p-4 pb-2 shrink-0 bg-white border-b border-[#e4f2ea]">
          <div className="grid grid-cols-2 gap-2 bg-[#eaf8f0] p-1.5 rounded-2xl border border-[#cce9d8]">
            <button
              onClick={() => {
                setActiveTab('deposit');
                setFeedback(null);
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow-md'
                  : 'text-[#059669] hover:bg-white/70'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => {
                setActiveTab('withdraw');
                setFeedback(null);
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] text-white shadow-md'
                  : 'text-[#059669] hover:bg-white/70'
              }`}
            >
              Withdrawal
            </button>
          </div>

          {/* Subheader: Main Wallet Balance */}
          <div className="flex items-center justify-between px-2 pt-3 pb-1 text-xs font-bold">
            <span className="text-[#4a6b5a]">Main Wallet Balance</span>
            <span className="text-[#00a859] font-mono font-black text-sm">BDT {balanceNumber}</span>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="px-4 pb-5 pt-3 space-y-3.5 overflow-y-auto no-scrollbar flex-1">
          {/* Official Payment Channels Banner */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#059669] font-bold px-1">
              <span>অফিসিয়াল পেমেন্ট চ্যানেল ({activeChannels.length}টি সক্রিয়)</span>
              <span className="text-[10px] text-[#059669] bg-[#e3f7ec] px-2 py-0.5 rounded-full border border-[#bce6ce] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a859] animate-pulse" />
                <span>স্বীকৃত গেটওয়ে</span>
              </span>
            </div>
            <div className="w-full bg-white rounded-2xl p-2 sm:p-2.5 shadow-xs flex items-center justify-center gap-3 sm:gap-5 overflow-hidden border border-[#dceee3]">
              {activeChannels.map((c) => (
                <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f4fbf7] border border-[#dceee3]">
                  <div className="h-6 w-auto flex items-center justify-center">
                    {renderChannelLogo(c, 'sm')}
                  </div>
                  <span className="text-xs font-black text-[#182620]">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#00a859] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {activeTab === 'deposit' ? (
            <form onSubmit={handleSubmitDeposit} className="space-y-3">
              {/* Section 1: Promotion */}
              <div className="bg-white border border-[#dceee3] rounded-2xl p-3 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 rounded-full bg-[#00a859]" />
                  <span className="text-xs font-bold text-[#182620]">Promotion</span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-[#059669] font-semibold cursor-pointer">
                    <span>{promotion}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Section 2: Deposit Channel */}
              <div className="bg-white border border-[#dceee3] rounded-2xl p-3 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 rounded-full bg-[#00a859]" />
                  <span className="text-xs font-bold text-[#182620]">Deposit Channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-[#e6f9ef] border border-[#a9e2c3] text-[#059669] font-black text-xs cursor-pointer"
                  >
                    Auto Pay
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-[#f4fbf7] border border-[#dceee3] text-[#4a6b5a] font-bold text-xs"
                  >
                    Direct Transfer
                  </button>
                </div>
              </div>

              {/* Section 3: Payment Method */}
              <div className="bg-white border border-[#dceee3] rounded-2xl p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-3.5 rounded-full bg-[#00a859]" />
                    <span className="text-xs font-bold text-[#182620]">Payment Method</span>
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold">{depositChannels.length}টি চ্যানেল উপলব্ধ</span>
                </div>

                {/* Dynamic Payment Methods Grid */}
                <div className={`grid gap-2 ${depositChannels.length <= 2 ? 'grid-cols-2' : depositChannels.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'}`}>
                  {depositChannels.map((pm) => {
                    const isSelected = method === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setMethod(pm.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#eaf8f0] border-[#00a859] text-[#182620] shadow-md ring-1 ring-[#00a859]'
                            : 'bg-[#f8fcfa] border-[#dceee3] text-[#4a6b5a] hover:bg-[#effaf3]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#e3f1e9] flex items-center justify-center p-1 mb-1.5 shadow-2xs shrink-0">
                          {renderChannelLogo(pm, 'sm')}
                        </div>
                        <span className="text-[12px] font-black tracking-tight text-[#182620] text-center leading-tight">
                          {pm.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a859]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-channel pill */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="inline-block px-3.5 py-1.5 rounded-xl bg-[#e6f9ef] border border-[#a9e2c3] text-[#059669] font-black text-xs">
                    {selectedChannel.name.toUpperCase()} PAYMENT
                  </span>
                  {selectedChannel.bonusPercent ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                      +{selectedChannel.bonusPercent}% বোনাস
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Section 4: Target Account Details Card */}
              {selectedChannel.type === 'bank' ? (
                <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                    <Building2 className="w-4 h-4 text-[#00a859]" />
                    <span>অফিসিয়াল ব্যাংক একাউন্ট বিবরণী (ডিপোজিট করুন):</span>
                  </div>

                  <div className="space-y-2 text-xs bg-[#f4fbf7] p-3 rounded-xl border border-[#dceee3]">
                    <div className="flex justify-between items-center py-0.5 border-b border-[#e4f2ea]">
                      <span className="text-[#4a6b5a] text-[11px]">ব্যাংকের নাম:</span>
                      <strong className="text-[#182620] font-mono">{officialBank.bankName}</strong>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-[#e4f2ea]">
                      <span className="text-[#4a6b5a] text-[11px]">একাউন্ট নাম:</span>
                      <strong className="text-[#059669] font-mono">{officialBank.accountName}</strong>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-[#e4f2ea]">
                      <span className="text-[#4a6b5a] text-[11px]">একাউন্ট নম্বর:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#00a859] font-mono text-sm tracking-wider">
                          {officialBank.accountNumber}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopyText(officialBank.accountNumber, 'bank_acc')}
                          className="px-2 py-0.5 rounded-lg bg-[#e6f9ef] hover:bg-[#d1f4e2] text-[#059669] font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'bank_acc' ? (
                            <>
                              <Check className="w-3 h-3 text-[#00a859]" />
                              <span>কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-[#e4f2ea]">
                      <span className="text-[#4a6b5a] text-[11px]">ব্রাঞ্চের নাম:</span>
                      <span className="text-[#182620]">{officialBank.branchName}</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#4a6b5a] text-[11px]">রাউটিং নম্বর:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#182620] font-mono">{officialBank.routingNumber}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopyText(officialBank.routingNumber, 'routing')}
                          className="px-2 py-0.5 rounded-lg bg-[#e6f9ef] hover:bg-[#d1f4e2] text-[#059669] font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'routing' ? (
                            <>
                              <Check className="w-3 h-3 text-[#00a859]" />
                              <span>কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#4a6b5a] leading-relaxed">
                    * আপনার যেকোনো ব্যাংক অ্যাপ বা ব্রাঞ্চ থেকে ফান্ড ট্রান্সফার / বিইএফটিএন / এনপিএসবি করে নিচে ট্রানজেকশন আইডি ও রসিদের ছবি আপলোড করুন।
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-[#dceee3] rounded-2xl p-3 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#182620] font-bold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#00a859]" />
                      <span>
                        অফিসিয়াল {selectedChannel.nameBn || selectedChannel.name} {selectedChannel.channelType === 'cashout' ? 'ক্যাশ আউট এজেন্ট' : 'পেমেন্ট'} নম্বর:
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedChannel.accountNumber, 'mfs_num')}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#00a859] hover:underline cursor-pointer"
                    >
                      {copiedKey === 'mfs_num' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00a859]" />
                          <span>কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#eaf8f0] border border-[#bce6ce] text-center font-mono font-black text-[#059669] tracking-wider text-base">
                    {selectedChannel.accountNumber}
                  </div>

                  {selectedChannel.sendMoneyNumber && (
                    <div className="pt-2 border-t border-[#e8f4ed] flex items-center justify-between text-xs">
                      <span className="text-[#4a6b5a] text-[11px]">
                        পার্সোনাল সেন্ড মানি নম্বর: <strong className="text-[#182620] font-mono">{selectedChannel.sendMoneyNumber}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedChannel.sendMoneyNumber!, 'sm_num')}
                        className="text-[10px] text-[#00a859] font-bold hover:underline cursor-pointer"
                      >
                        {copiedKey === 'sm_num' ? 'কপি হয়েছে' : 'কপি করুন'}
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-[#4a6b5a] text-center">
                    {selectedChannel.instructionBn || 'ক্যাশ আউট বা সেন্ড মানি করে প্রাপ্ত TrxID এবং রসিদের স্ক্রিনশট নিচে প্রদান করুন।'}
                  </p>
                </div>
              )}

              {/* Section 5: Amount Presets & TrxID */}
              <div className="bg-white border border-[#dceee3] rounded-2xl p-3 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#182620]">টাকার পরিমাণ (BDT):</span>
                  <span className="text-xs font-black font-mono text-[#00a859]">৳{amountTk}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[100, 200, 500, 1000, 2000, 5000, 10000, 25000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountTk(preset)}
                      className={`py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                        amountTk === preset
                          ? 'bg-gradient-to-r from-[#19c36e] to-[#00994d] border-[#00994d] text-white shadow-sm'
                          : 'bg-[#f4fbf7] border-[#dceee3] text-[#182620] hover:bg-[#e5f6ec]'
                      }`}
                    >
                      ৳{preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>

                {/* Sender Mobile / Account */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-[#182620]">
                    {method === 'bank_transfer'
                      ? 'আপনার প্রেরক ব্যাংক ও একাউন্ট নম্বর:'
                      : `আপনার প্রেরক ${method.toUpperCase()} নম্বর:`}
                  </label>
                  <input
                    type="text"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder={
                      method === 'bank_transfer'
                        ? 'e.g. City Bank - A/C 123456789'
                        : '01XXXXXXXXX'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] font-mono text-xs placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                  />
                </div>

                {/* TrxID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#182620]">
                    ট্রানজেকশন আইডি (TrxID) *
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 9J8K7L6M / Bank Ref No"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] font-mono text-xs uppercase placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                  />
                </div>

                {/* Screenshot Proof Upload */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-[#182620] flex items-center justify-between">
                    <span>পেমেন্ট স্ক্রিনশট প্রুফ (Screenshot) *</span>
                    <span className="text-[10px] text-[#059669] font-semibold">বাধ্যতামূলক</span>
                  </label>

                  {screenshotProof ? (
                    <div className="relative rounded-xl border border-emerald-300 bg-[#eaf8f0] p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={screenshotProof}
                          alt="Screenshot Proof"
                          className="w-12 h-12 object-cover rounded-lg border border-[#00a859]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#059669] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>স্ক্রিনশট সফলভাবে যুক্ত হয়েছে</span>
                          </div>
                          <div className="text-[10px] text-[#4a6b5a]">যাচাই ও অনুমোদনের জন্য পাঠানো হবে</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setScreenshotProof('')}
                        className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition cursor-pointer"
                      >
                        পরিবর্তন
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#bde6cf] hover:border-[#00a859] bg-[#f4fbf7] cursor-pointer transition">
                      <Upload className="w-5 h-5 text-[#00a859] mb-1" />
                      <span className="text-xs font-bold text-[#182620]">পেমেন্টের স্ক্রিনশট বা রসিদ আপলোড করুন</span>
                      <span className="text-[10px] text-[#4a6b5a] mt-0.5">JPG, PNG বা WEBP (সর্বোচ্চ ১০MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 font-black text-sm text-white shadow-lg shadow-emerald-900/15 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'ডিপোজিট নিশ্চিত করুন'}</span>
              </button>
            </form>
          ) : (
            /* Withdrawal View */
            <form onSubmit={handleSubmitWithdrawal} className="space-y-3">
              <div className="bg-white border border-[#dceee3] rounded-2xl p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-3.5 rounded-full bg-[#00a859]" />
                    <span className="text-xs font-bold text-[#182620]">উইথড্রয়াল মাধ্যম নির্বাচন করুন</span>
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold">{withdrawChannels.length}টি মাধ্যম</span>
                </div>

                <div className={`grid gap-2 ${withdrawChannels.length <= 2 ? 'grid-cols-2' : withdrawChannels.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'}`}>
                  {withdrawChannels.map((pm) => {
                    const isSelected = method === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setMethod(pm.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#eaf8f0] border-[#00a859] text-[#182620] shadow-md ring-1 ring-[#00a859]'
                            : 'bg-[#f8fcfa] border-[#dceee3] text-[#4a6b5a] hover:bg-[#effaf3]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#e3f1e9] flex items-center justify-center p-1 mb-1.5 shadow-2xs shrink-0">
                          {renderChannelLogo(pm, 'sm')}
                        </div>
                        <span className="text-[12px] font-black tracking-tight text-[#182620] text-center leading-tight">
                          {pm.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a859]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Withdrawal Details Inputs */}
              <div className="bg-white border border-[#dceee3] rounded-2xl p-3 space-y-3 shadow-2xs">
                {method === 'bank_transfer' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#182620]">আপনার ব্যাংকের নাম:</label>
                      <input
                        type="text"
                        value={bankWithdrawName}
                        onChange={(e) => setBankWithdrawName(e.target.value)}
                        placeholder="e.g. Dutch-Bangla Bank / City Bank / BRAC Bank"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] text-xs placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#182620]">একাউন্ট হোল্ডারের নাম:</label>
                      <input
                        type="text"
                        value={bankWithdrawHolder}
                        onChange={(e) => setBankWithdrawHolder(e.target.value)}
                        placeholder="e.g. Md Nayem Hossain"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] text-xs placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#182620]">ব্যাংক একাউন্ট নম্বর:</label>
                      <input
                        type="text"
                        value={bankWithdrawAcc}
                        onChange={(e) => setBankWithdrawAcc(e.target.value)}
                        placeholder="e.g. 115.120.1234567"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] font-mono text-xs placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#182620]">ব্রাঞ্চের নাম:</label>
                      <input
                        type="text"
                        value={bankWithdrawBranch}
                        onChange={(e) => setBankWithdrawBranch(e.target.value)}
                        placeholder="e.g. Motijheel Branch / Dhanmondi"
                        className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] text-xs placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#182620]">
                      আপনার {method.toUpperCase()} একাউন্ট নম্বর:
                    </label>
                    <input
                      type="text"
                      value={payoutMobile}
                      onChange={(e) => setPayoutMobile(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] font-mono text-xs placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                    />
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-[#182620] flex items-center justify-between">
                    <span>উইথড্রয়াল পরিমাণ (BDT):</span>
                    <span className="text-[10px] text-[#059669]">সীমা: ৳৫০০ - ৳২৫,০০০</span>
                  </label>
                  <input
                    type="number"
                    value={amountTk}
                    onChange={(e) => setAmountTk(Number(e.target.value))}
                    min={500}
                    max={25000}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fcfa] border border-[#cde8d8] text-[#182620] font-mono text-xs placeholder-slate-400 focus:outline-hidden focus:border-[#00a859]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#19c36e] to-[#00994d] hover:brightness-105 font-black text-sm text-white shadow-lg shadow-emerald-900/15 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Banknote className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'উইথড্রয়াল আবেদন সাবমিট করুন'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
