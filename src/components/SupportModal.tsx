/**
 * Customer Support & Help Modal for fb88baji
 * 24/7 Live Agent Chat Simulation & Ticket System
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Headphones, Send, PlusCircle, Lock } from 'lucide-react';
import { User, SupportTicket } from '../types';

interface SupportModalProps {
  user?: User | null;
  onClose: () => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  lang: 'bn' | 'en';
}

export const SupportModal: React.FC<SupportModalProps> = ({
  user,
  onClose,
  onOpenAuth,
  lang,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    if (!user?.sessionToken) return;
    try {
      const res = await fetch('/api/v1/support/tickets', {
        headers: { Authorization: `Bearer ${user.sessionToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list: SupportTicket[] = data.tickets || [];
        setTickets(list);
        if (!activeTicketId && list.length > 0 && !creatingNew) {
          setActiveTicketId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Support ticket fetch error:', err);
    }
  };

  useEffect(() => {
    if (!user?.sessionToken) return;
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, [user?.sessionToken, creatingNew]);

  const activeTicket = tickets.find((t) => t.id === activeTicketId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages?.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user?.sessionToken) return;

    setIsSending(true);
    setErrorMsg(null);
    const text = inputMessage.trim();

    try {
      if (!activeTicket || creatingNew) {
        const res = await fetch('/api/v1/support/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.sessionToken}`,
          },
          body: JSON.stringify({ subject: subject.trim() || 'Player Inquiry', message: text }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create ticket');
        setInputMessage('');
        setCreatingNew(false);
        if (data.ticket) {
          setTickets((prev) => [data.ticket, ...prev]);
          setActiveTicketId(data.ticket.id);
        } else {
          await fetchTickets();
        }
      } else {
        const res = await fetch(`/api/v1/support/tickets/${activeTicket.id}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.sessionToken}`,
          },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send message');
        setInputMessage('');
        if (data.ticket) {
          setTickets((prev) => prev.map((t) => (t.id === data.ticket.id ? data.ticket : t)));
        } else {
          await fetchTickets();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#47001f] border border-[#940042] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col h-[560px]">
        {/* Header */}
        <div className="p-4 bg-[#750035] border-b border-[#940042] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {lang === 'bn' ? 'fb88baji লাইভ কাস্টমার সাপোর্ট (২৪/৭)' : '24/7 Live Player Support'}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {activeTicket
                    ? `${activeTicket.status} • ${activeTicket.subject}`
                    : lang === 'bn'
                    ? 'সরাসরি অ্যাডমিন সাপোর্ট টিকেট'
                    : 'Direct Live Support Desk'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && tickets.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCreatingNew(true);
                  setActiveTicketId(null);
                }}
                className="px-2.5 py-1 rounded-full bg-[#61002a] hover:bg-[#940042] text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>{lang === 'bn' ? 'নতুন টিকেট' : 'New Ticket'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-[#61002a] hover:bg-[#940042] text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ticket switcher if multiple */}
        {user && tickets.length > 1 && (
          <div className="px-3 py-2 bg-[#520024] border-b border-[#940042] flex gap-1.5 overflow-x-auto no-scrollbar">
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setCreatingNew(false);
                  setActiveTicketId(t.id);
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer transition ${
                  activeTicketId === t.id && !creatingNew
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-[#61002a] text-slate-300 hover:text-white'
                }`}
              >
                {t.subject} ({t.status})
              </button>
            ))}
          </div>
        )}

        {/* Chat Area */}
        {!user ? (
          <div className="flex-1 p-6 bg-[#61002a] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white">
                {lang === 'bn' ? 'লাইভ সাপোর্টের জন্য লগইন করুন' : 'Sign In for Live Support'}
              </h4>
              <p className="text-xs text-slate-300 max-w-xs">
                {lang === 'bn'
                  ? 'আপনার অ্যাকাউন্ট ও লেনদেন সংক্রান্ত সহায়তা সরাসরি সাপোর্ট টিম থেকে পেতে প্রথমে লগইন করুন।'
                  : 'Log in to open a live support ticket and receive real-time responses from our team.'}
              </p>
            </div>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth('login');
                }}
                className="px-6 py-2.5 rounded-full gold-gradient text-slate-950 font-black text-xs shadow cursor-pointer hover:brightness-110"
              >
                {lang === 'bn' ? 'লগইন / সাইন আপ করুন' : 'Login / Sign Up'}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#61002a]">
              {creatingNew || !activeTicket ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#47001f] border border-[#940042] text-xs text-slate-200 leading-relaxed">
                    {lang === 'bn'
                      ? 'আপনার ডিপোজিট, উইথড্রয়াল বা গেম সংক্রান্ত যেকোনো সমস্যার বিস্তারিত নিচে লিখুন। আমাদের সাপোর্ট টিম সরাসরি আপনার টিকেটে উত্তর দেবে।'
                      : 'Describe your deposit, withdrawal, or account question below. Our support team will reply directly to this ticket.'}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      {lang === 'bn' ? 'বিষয় (Subject):' : 'Subject:'}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Deposit inquiry, Account help"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#47001f] border border-[#940042] text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {activeTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'gold-gradient text-slate-950 font-medium rounded-br-none'
                            : 'bg-[#47001f] text-slate-200 border border-[#940042] rounded-bl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                        {m.sender === 'admin' ? 'Support Agent • ' : ''}
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {errorMsg && (
              <div className="px-4 py-2 bg-rose-950/60 border-t border-rose-500/40 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#750035] border-t border-[#940042] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                placeholder={lang === 'bn' ? 'আপনার মেসেজ লিখুন...' : 'Type your message...'}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#940042] text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#FFC943]"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="p-2.5 rounded-full gold-gradient text-slate-950 font-bold shadow hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
