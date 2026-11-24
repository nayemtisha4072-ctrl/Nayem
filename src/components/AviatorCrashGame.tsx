/**
 * Authoritative Real-Time Multiplayer Aviator Crash Game
 * - Connects to server-side WebSocket engine at /ws/crash
 * - 60fps Canvas stage (sunburst rays, crimson curve, shaded area, custom propeller plane)
 * - Dual independent betting panels (Bet & Auto modes, +/- stepper, 100/200/500/10,000 presets)
 * - Live All Bets / Previous / Top feed, Live Chat drawer, Provably Fair SHA-256 Verifier
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Menu,
  MessageSquare,
  MoreHorizontal,
  Minus,
  Plus,
  X,
  Volume2,
  VolumeX,
  ShieldCheck,
  Check,
  Send,
  Minimize2,
  Maximize2,
  ArrowLeft,
  Info,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { User, Wallet } from '../types';

export type CrashPhase = 'WAITING' | 'FLYING' | 'CRASHED';

export interface PublicCrashBet {
  betId: string;
  roundId: string;
  userId: string;
  username: string;
  panelIndex: 1 | 2;
  stakeTk: number;
  status: 'QUEUED' | 'ACTIVE' | 'CASHED_OUT' | 'LOST' | 'CANCELLED';
  cashoutMultiplier?: number;
  payoutTk?: number;
  placedAt: string;
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

interface AviatorCrashGameProps {
  user: User;
  wallet: Wallet | null;
  onRefreshWallet: (updatedWallet?: Wallet) => void;
  onOpenDeposit?: () => void;
  onClose: () => void;
  lang: 'bn' | 'en';
}

interface PanelState {
  mode: 'bet' | 'auto';
  stakeInput: string;
  autoBet: boolean;
  autoCashoutEnabled: boolean;
  autoCashoutInput: string;
}

function formatBdt(val: number): string {
  return Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskUsername(name: string, isSelf: boolean): string {
  if (isSelf) return name;
  if (!name || name.length <= 2) return `${name || 'u'}***`;
  return `${name.slice(0, 2)}***${name.slice(-1)}`;
}

function getMultiplierBadgeClass(m: number): string {
  if (m >= 10) return 'text-[#c017b4] bg-[#c017b4]/12 border-[#c017b4]/25';
  if (m >= 2) return 'text-[#913ef8] bg-[#913ef8]/12 border-[#913ef8]/25';
  return 'text-[#34b4ff] bg-[#34b4ff]/12 border-[#34b4ff]/25';
}

function getMultiplierTextColor(m: number): string {
  if (m >= 10) return 'text-[#d946ef]';
  if (m >= 2) return 'text-[#a855f7]';
  return 'text-[#34b4ff]';
}

class AviatorAudio {
  private ctx: AudioContext | null = null;

  private ensure() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
  }

  playTakeoff() {
    try {
      this.ensure();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // ignore audio lock
    }
  }

  playCashout() {
    try {
      this.ensure();
      if (!this.ctx) return;
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.11, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.22);
      });
    } catch {
      // ignore
    }
  }

  playCrash() {
    try {
      this.ensure();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.004, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {
      // ignore
    }
  }
}

const sfx = new AviatorAudio();

function drawAviatorPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad: number,
  propPhase: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  // Outer red glow
  ctx.shadowColor = 'rgba(229, 9, 52, 0.7)';
  ctx.shadowBlur = 16;

  // Tail wing
  ctx.fillStyle = '#e50934';
  ctx.beginPath();
  ctx.moveTo(-26, -2);
  ctx.lineTo(-34, -15);
  ctx.lineTo(-23, -15);
  ctx.lineTo(-16, -2);
  ctx.closePath();
  ctx.fill();

  // Fuselage main body
  ctx.beginPath();
  ctx.moveTo(-28, 3);
  ctx.quadraticCurveTo(-10, -10, 14, -7);
  ctx.quadraticCurveTo(28, -5, 30, 1);
  ctx.quadraticCurveTo(26, 7, 10, 8);
  ctx.quadraticCurveTo(-12, 8, -28, 3);
  ctx.closePath();
  ctx.fillStyle = '#e50934';
  ctx.fill();

  // Dark cockpit stripe & "X" fuselage mark
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#151618';
  ctx.beginPath();
  ctx.ellipse(2, -3, 7, 3.2, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(11, -3);
  ctx.lineTo(17, 3);
  ctx.moveTo(17, -3);
  ctx.lineTo(11, 3);
  ctx.stroke();

  // Upper wing
  ctx.fillStyle = '#ff264e';
  ctx.beginPath();
  ctx.moveTo(-6, -5);
  ctx.lineTo(10, -15);
  ctx.lineTo(18, -13);
  ctx.lineTo(6, -4);
  ctx.closePath();
  ctx.fill();

  // Lower landing skid / fin
  ctx.strokeStyle = '#ff4b6e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, 7);
  ctx.lineTo(-8, 13);
  ctx.moveTo(8, 7);
  ctx.lineTo(12, 13);
  ctx.stroke();

  // Spinning propeller blades at nose
  const bladeLen = 12 + Math.sin(propPhase) * 6;
  ctx.strokeStyle = '#ffd1d9';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(31, -bladeLen);
  ctx.lineTo(31, bladeLen);
  ctx.stroke();

  // Nose spinner dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(31, 0, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawExplosionBlast(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  elapsedSec: number
) {
  if (elapsedSec < 0 || elapsedSec > 1.35) return;
  const t = Math.min(1, elapsedSec / 1.35);
  const alpha = Math.max(0, 1 - t);

  ctx.save();
  ctx.translate(x, y);

  // Expanding shockwave ring
  const shockRadius = 16 + t * 92;
  ctx.beginPath();
  ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 84, 56, ${alpha * 0.85})`;
  ctx.lineWidth = Math.max(1, 4.5 * (1 - t));
  ctx.stroke();

  // Secondary orange shock ring
  if (t > 0.08) {
    ctx.beginPath();
    ctx.arc(0, 0, shockRadius * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 196, 60, ${alpha * 0.7})`;
    ctx.lineWidth = 2.5 * (1 - t);
    ctx.stroke();
  }

  // Fiery glowing core
  if (elapsedSec < 0.7) {
    const coreT = elapsedSec / 0.7;
    const coreR = 26 * (1 - coreT * 0.45) + Math.sin(elapsedSec * 40) * 3;
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, coreR);
    grad.addColorStop(0, `rgba(255, 250, 200, ${1 - coreT * 0.6})`);
    grad.addColorStop(0.45, `rgba(255, 130, 20, ${0.9 - coreT * 0.7})`);
    grad.addColorStop(1, 'rgba(229, 9, 52, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Radial flying sparks
  const sparkCount = 14;
  for (let i = 0; i < sparkCount; i++) {
    const angle = (i * Math.PI * 2) / sparkCount + (i % 2) * 0.2;
    const dist = 12 + t * (55 + (i % 3) * 26);
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist;
    ctx.fillStyle = i % 2 === 0 ? `rgba(255, 215, 70, ${alpha})` : `rgba(255, 65, 95, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(1.2, 3.6 * (1 - t)), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export const AviatorCrashGame: React.FC<AviatorCrashGameProps> = ({
  user,
  wallet,
  onRefreshWallet,
  onOpenDeposit,
  onClose,
  lang,
}) => {
  const [wsConnected, setWsConnected] = useState(false);
  const [phase, setPhase] = useState<CrashPhase>('WAITING');
  const [roundId, setRoundId] = useState('');
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [revealedServerSeed, setRevealedServerSeed] = useState<string | undefined>(undefined);
  const [crashPoint, setCrashPoint] = useState<number | undefined>(undefined);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [waitingDurationMs, setWaitingDurationMs] = useState<number>(5500);
  const [waitingProgressPct, setWaitingProgressPct] = useState<number>(100);
  const [connectedPlayers, setConnectedPlayers] = useState<number>(1);
  const [history, setHistory] = useState<CrashHistoryItem[]>([]);
  const [currentBets, setCurrentBets] = useState<PublicCrashBet[]>([]);
  const [previousBets, setPreviousBets] = useState<PublicCrashBet[]>([]);
  const [topWins, setTopWins] = useState<PublicCrashBet[]>([]);
  const [chatMessages, setChatMessages] = useState<CrashChatMessage[]>([]);

  // My active & queued bets tracked locally + synced with WS snapshots
  const [myActiveBets, setMyActiveBets] = useState<PublicCrashBet[]>([]);
  const [myQueuedBets, setMyQueuedBets] = useState<PublicCrashBet[]>([]);

  // Dual Panel UI states
  const [panel1, setPanel1] = useState<PanelState>({
    mode: 'bet',
    stakeInput: '1.00',
    autoBet: false,
    autoCashoutEnabled: false,
    autoCashoutInput: '2.00',
  });
  const [panel2, setPanel2] = useState<PanelState>({
    mode: 'bet',
    stakeInput: '1.00',
    autoBet: false,
    autoCashoutEnabled: false,
    autoCashoutInput: '2.00',
  });
  const [panel2Collapsed, setPanel2Collapsed] = useState(false);

  // Sub-modals & drawers
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'previous' | 'top'>('all');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [selectedFairRound, setSelectedFairRound] = useState<CrashHistoryItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [toastMsg, setToastMsg] = useState<{ kind: 'win' | 'error'; title: string; sub?: string } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);

  // Refs synced for 60fps Canvas animation & Auto-Bet callback
  const phaseRef = useRef<CrashPhase>('WAITING');
  phaseRef.current = phase;
  const multRef = useRef<number>(1.0);
  multRef.current = currentMultiplier;
  const crashPointRef = useRef<number>(1.0);
  crashPointRef.current = crashPoint ?? currentMultiplier;
  const lastPlanePosRef = useRef<{ x: number; y: number; angle: number }>({ x: 54, y: 180, angle: -0.05 });
  const takeoffTimeRef = useRef<number>(Date.now());
  const crashAnimStartRef = useRef<number>(0);
  const waitDeadlineRef = useRef<number>(Date.now() + 5500);
  const soundEnabledRef = useRef<boolean>(true);
  soundEnabledRef.current = soundEnabled;
  const panel1Ref = useRef(panel1);
  panel1Ref.current = panel1;
  const panel2Ref = useRef(panel2);
  panel2Ref.current = panel2;
  const autoBetRoundPlacedRef = useRef<string>('');

  const showToast = (kind: 'win' | 'error', title: string, sub?: string) => {
    setToastMsg({ kind, title, sub });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.title === title ? null : prev));
    }, 3500);
  };

  // WebSocket Connection to /ws/crash
  useEffect(() => {
    let closedByUser = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    const connect = () => {
      const token = user?.sessionToken || localStorage.getItem('fb88_user_token') || '';
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${window.location.host}/ws/crash?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);
      };

      ws.onmessage = (evt) => {
        let msg: Record<string, any>;
        try {
          msg = JSON.parse(evt.data);
        } catch {
          return;
        }

        switch (msg.type) {
          case 'crash:init': {
            setPhase(msg.phase);
            setRoundId(msg.roundId || '');
            setServerSeedHash(msg.serverSeedHash || '');
            setRevealedServerSeed(msg.revealedServerSeed);
            setCrashPoint(msg.crashPoint);
            setCurrentMultiplier(Number(msg.currentMultiplier || 1.0));
            setWaitingDurationMs(Number(msg.waitingDurationMs || 5500));
            waitDeadlineRef.current = Date.now() + Number(msg.waitingRemainingMs || 0);
            if (msg.phase === 'FLYING') {
              takeoffTimeRef.current = Date.now() - Number(msg.elapsedMs || 0);
            }
            setConnectedPlayers(Number(msg.connectedPlayers || 1));
            setHistory(Array.isArray(msg.history) ? msg.history : []);
            setCurrentBets(Array.isArray(msg.currentBets) ? msg.currentBets : []);
            setPreviousBets(Array.isArray(msg.previousBets) ? msg.previousBets : []);
            setTopWins(Array.isArray(msg.topWins) ? msg.topWins : []);
            setChatMessages(Array.isArray(msg.chatMessages) ? msg.chatMessages : []);
            setMyActiveBets(Array.isArray(msg.myBets) ? msg.myBets : []);
            setMyQueuedBets(Array.isArray(msg.myQueuedBets) ? msg.myQueuedBets : []);
            break;
          }

          case 'crash:presence': {
            setConnectedPlayers(Number(msg.connectedPlayers || 1));
            break;
          }

          case 'crash:waiting': {
            const newRoundId = msg.roundId || '';
            setPhase('WAITING');
            setRoundId(newRoundId);
            setServerSeedHash(msg.serverSeedHash || '');
            setRevealedServerSeed(undefined);
            setCrashPoint(undefined);
            setCurrentMultiplier(1.0);
            const dur = Number(msg.waitingDurationMs || 5500);
            setWaitingDurationMs(dur);
            waitDeadlineRef.current = Date.now() + Number(msg.waitingRemainingMs || dur);
            const nextBets: PublicCrashBet[] = Array.isArray(msg.currentBets) ? msg.currentBets : [];
            setCurrentBets(nextBets);
            setMyActiveBets(nextBets.filter((b) => b.userId === user.id));
            setMyQueuedBets([]);
            if (Array.isArray(msg.history)) setHistory(msg.history);

            // Trigger Auto-Bet for panels with autoBet enabled
            if (autoBetRoundPlacedRef.current !== newRoundId) {
              autoBetRoundPlacedRef.current = newRoundId;
              const p1 = panel1Ref.current;
              const p2 = panel2Ref.current;
              if (p1.mode === 'auto' && p1.autoBet && !nextBets.some((b) => b.userId === user.id && b.panelIndex === 1)) {
                sendWsBet(1, parseFloat(p1.stakeInput) || 1, p1.autoCashoutEnabled ? parseFloat(p1.autoCashoutInput) : undefined);
              }
              if (p2.mode === 'auto' && p2.autoBet && !nextBets.some((b) => b.userId === user.id && b.panelIndex === 2)) {
                sendWsBet(2, parseFloat(p2.stakeInput) || 1, p2.autoCashoutEnabled ? parseFloat(p2.autoCashoutInput) : undefined);
              }
            }
            break;
          }

          case 'crash:takeoff': {
            setPhase('FLYING');
            takeoffTimeRef.current = Date.now();
            setCurrentMultiplier(1.0);
            if (soundEnabledRef.current) sfx.playTakeoff();
            break;
          }

          case 'crash:tick': {
            setCurrentMultiplier(Number(msg.currentMultiplier || 1.0));
            break;
          }

          case 'crash:crashed': {
            setPhase('CRASHED');
            crashAnimStartRef.current = Date.now();
            const cp = Number(msg.crashPoint || 1.0);
            setCrashPoint(cp);
            setCurrentMultiplier(cp);
            setRevealedServerSeed(msg.serverSeed);
            if (Array.isArray(msg.history)) setHistory(msg.history);
            if (Array.isArray(msg.previousBets)) setPreviousBets(msg.previousBets);
            if (Array.isArray(msg.topWins)) setTopWins(msg.topWins);
            setCurrentBets((prev) =>
              prev.map((b) => (b.status === 'ACTIVE' ? { ...b, status: 'LOST', payoutTk: 0 } : b))
            );
            setMyActiveBets((prev) =>
              prev.map((b) => (b.status === 'ACTIVE' ? { ...b, status: 'LOST', payoutTk: 0 } : b))
            );
            if (soundEnabledRef.current) sfx.playCrash();
            onRefreshWallet();
            break;
          }

          case 'crash:bet': {
            const bet: PublicCrashBet = msg.bet;
            if (!bet) break;
            setCurrentBets((prev) => [bet, ...prev.filter((b) => b.betId !== bet.betId)]);
            if (bet.userId === user.id) {
              setMyActiveBets((prev) => [bet, ...prev.filter((b) => b.betId !== bet.betId)]);
            }
            break;
          }

          case 'crash:bet_ack': {
            const bet: PublicCrashBet = msg.bet;
            if (bet) {
              if (msg.queuedForNextRound) {
                setMyQueuedBets((prev) => [bet, ...prev.filter((b) => b.betId !== bet.betId)]);
              } else {
                setMyActiveBets((prev) => [bet, ...prev.filter((b) => b.betId !== bet.betId)]);
              }
            }
            if (msg.wallet) onRefreshWallet();
            break;
          }

          case 'crash:bet_cancelled': {
            const betId = msg.betId;
            setCurrentBets((prev) => prev.filter((b) => b.betId !== betId));
            setMyActiveBets((prev) => prev.filter((b) => b.betId !== betId));
            break;
          }

          case 'crash:cancel_ack': {
            const cId = msg.cancelledBetId;
            setCurrentBets((prev) => prev.filter((b) => b.betId !== cId));
            setMyActiveBets((prev) => prev.filter((b) => b.betId !== cId));
            setMyQueuedBets((prev) => prev.filter((b) => b.betId !== cId));
            onRefreshWallet();
            break;
          }

          case 'crash:cashout': {
            const bet: PublicCrashBet = msg.bet;
            if (bet) {
              setCurrentBets((prev) => prev.map((b) => (b.betId === bet.betId ? bet : b)));
              if (bet.userId === user.id) {
                setMyActiveBets((prev) => prev.map((b) => (b.betId === bet.betId ? bet : b)));
                if (soundEnabledRef.current) sfx.playCashout();
                showToast(
                  'win',
                  `${lang === 'bn' ? 'ক্যাশ আউট!' : 'You cashed out!'} +${formatBdt(bet.payoutTk || 0)} BDT`,
                  `${(bet.cashoutMultiplier || 1).toFixed(2)}x`
                );
                onRefreshWallet();
              }
            }
            if (Array.isArray(msg.topWins)) setTopWins(msg.topWins);
            break;
          }

          case 'crash:cashout_ack': {
            onRefreshWallet();
            break;
          }

          case 'crash:chat': {
            if (msg.message) {
              setChatMessages((prev) => [...prev.slice(-59), msg.message]);
            }
            break;
          }

          case 'crash:error': {
            if (msg.error) {
              showToast('error', msg.error);
            }
            break;
          }
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (pingTimer) clearInterval(pingTimer);
        if (!closedByUser) {
          reconnectTimer = setTimeout(connect, 1500);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      closedByUser = true;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [user.id, user.sessionToken]);

  // Countdown bar updater during WAITING phase
  useEffect(() => {
    if (phase !== 'WAITING') return;
    const timer = setInterval(() => {
      const rem = Math.max(0, waitDeadlineRef.current - Date.now());
      const pct = Math.min(100, Math.max(0, (rem / Math.max(1, waitingDurationMs)) * 100));
      setWaitingProgressPct(pct);
    }, 50);
    return () => clearInterval(timer);
  }, [phase, waitingDurationMs]);

  // 60fps Canvas Flight Renderer (Radial Sunburst + Curve + Red Aviator Plane)
  useEffect(() => {
    let rafId = 0;
    const startTime = performance.now();

    const renderFrame = (now: number) => {
      const canvas = canvasRef.current;
      const wrapper = stageWrapperRef.current;
      if (canvas && wrapper) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);

          // 1. Deep black base
          ctx.fillStyle = '#08080a';
          ctx.fillRect(0, 0, w, h);

          // 2. Rotating Sunburst Rays originating from bottom-left (like official Aviator screenshots)
          const cx = 0;
          const cy = h;
          const maxR = Math.hypot(w, h) * 1.15;
          const rotOffset = ((now - startTime) * 0.000045) % ((Math.PI * 2) / 18);
          const rayCount = 24;
          for (let i = 0; i < rayCount; i++) {
            if (i % 2 === 0) {
              const a1 = rotOffset + (i * Math.PI * 2) / rayCount;
              const a2 = rotOffset + ((i + 0.52) * Math.PI * 2) / rayCount;
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(cx + Math.cos(a1) * maxR, cy - Math.sin(a1) * maxR);
              ctx.lineTo(cx + Math.cos(a2) * maxR, cy - Math.sin(a2) * maxR);
              ctx.closePath();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.032)';
              ctx.fill();
            }
          }

          // Subtle top-right crimson/slate radial ambient vignette
          const vig = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.5, maxR * 0.65);
          vig.addColorStop(0, phaseRef.current === 'CRASHED' ? 'rgba(229, 9, 52, 0.14)' : 'rgba(255, 255, 255, 0.02)');
          vig.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, w, h);

          // Subtle axis ticks along bottom & left
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          const dotStepX = Math.max(24, w / 12);
          for (let dx = dotStepX; dx < w - 16; dx += dotStepX) {
            ctx.beginPath();
            ctx.arc(dx, h - 6, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // 3. Phase-specific trajectory & airplane
          const p = phaseRef.current;
          const m = multRef.current;
          const propPhase = (now - startTime) * 0.045;

          if (p === 'WAITING') {
            // Plane idling at bottom-left launchpad
            lastPlanePosRef.current = { x: 54, y: h - 22, angle: -0.05 };
            drawAviatorPlane(ctx, 54, h - 22, -0.05, propPhase * 0.6);
          } else if (p === 'FLYING') {
            const elapsedSec = Math.max(0, (Date.now() - takeoffTimeRef.current) / 1000);
            const progressX = Math.min(0.76, elapsedSec / 7.5);
            const cruiseOscX = elapsedSec > 7.5 ? Math.sin(elapsedSec * 1.4) * 16 : 0;
            const cruiseOscY = elapsedSec > 7.5 ? Math.sin(elapsedSec * 2.1) * 10 : 0;

            const startX = 8;
            const startY = h - 8;
            const targetX = Math.max(startX + 20, w * (0.14 + progressX) + cruiseOscX);
            const progressY = Math.min(0.72, Math.log(Math.max(1.0, m)) * 0.62 + elapsedSec * 0.035);
            const targetY = Math.max(36, startY - h * progressY + cruiseOscY);

            // Control point for classic smooth exponential Aviator curve
            const cpX = startX + (targetX - startX) * 0.62;
            const cpY = startY - (startY - targetY) * 0.14;

            // Shaded red gradient fill beneath trajectory curve (exact match to Screenshot 3)
            const areaGrad = ctx.createLinearGradient(0, targetY, 0, startY);
            areaGrad.addColorStop(0, 'rgba(229, 9, 52, 0.42)');
            areaGrad.addColorStop(1, 'rgba(130, 8, 32, 0.14)');

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
            ctx.lineTo(targetX, startY);
            ctx.closePath();
            ctx.fillStyle = areaGrad;
            ctx.fill();

            // Vertical bright crimson drop line or crisp curve stroke
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
            ctx.strokeStyle = '#ff1444';
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Nose pitch tangent angle along quadratic bezier
            const tx = targetX - cpX;
            const ty = targetY - cpY;
            const tangentAngle = Math.atan2(ty, tx);
            const clampedAngle = Math.max(-0.42, Math.min(0.08, tangentAngle * 0.55));

            lastPlanePosRef.current = { x: targetX - 6, y: targetY - 8, angle: clampedAngle };
            drawAviatorPlane(ctx, targetX - 6, targetY - 8, clampedAngle, propPhase);
          } else if (p === 'CRASHED') {
            const crashElapsed = (Date.now() - crashAnimStartRef.current) / 1000;
            const cp = crashPointRef.current;
            const isInstantOneX = cp <= 1.01;
            const blastX = isInstantOneX ? 58 : lastPlanePosRef.current.x;
            const blastY = isInstantOneX ? h - 26 : lastPlanePosRef.current.y;

            // Render fiery blast explosion at crash coordinate
            drawExplosionBlast(ctx, blastX, blastY, crashElapsed);

            // If crash happened in flight (> 1.01x), plane also streaks away briefly
            if (!isInstantOneX && crashElapsed < 0.7) {
              const flyX = blastX + crashElapsed * w * 0.75;
              const flyY = blastY - crashElapsed * h * 0.55;
              drawAviatorPlane(ctx, flyX, flyY, -0.35, propPhase);
            }
          }

          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const sendWsBet = (panelIndex: 1 | 2, stakeTk: number, autoCashoutMultiplier?: number) => {
    const cleanStake = Number(stakeTk.toFixed(2));
    if (!Number.isFinite(cleanStake) || cleanStake < 1) {
      showToast('error', lang === 'bn' ? 'সর্বনিম্ন বাজি ১.০০ BDT' : 'Minimum bet is 1.00 BDT');
      return;
    }
    const balTk = wallet ? wallet.availablePaisa / 100 : 0;
    if (balTk < cleanStake) {
      showToast('error', lang === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই! ডিপোজিট করুন।' : 'Insufficient balance! Please deposit.');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'bet',
          panelIndex,
          stakeTk: cleanStake,
          autoCashoutMultiplier: autoCashoutMultiplier && autoCashoutMultiplier >= 1.01 ? autoCashoutMultiplier : undefined,
        })
      );
    } else {
      // Fallback REST call while WS reconnects
      const token = user?.sessionToken || localStorage.getItem('fb88_user_token') || '';
      fetch('/api/v1/casino/crash/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ panelIndex, stakeTk: cleanStake, autoCashoutMultiplier }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!d.success && d.error) showToast('error', d.error);
          else onRefreshWallet();
        })
        .catch(() => showToast('error', 'Connection error'));
    }
  };

  const sendWsCancel = (panelIndex: 1 | 2) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'cancel', panelIndex }));
    } else {
      const token = user?.sessionToken || localStorage.getItem('fb88_user_token') || '';
      fetch('/api/v1/casino/crash/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ panelIndex }),
      })
        .then(() => onRefreshWallet())
        .catch(() => {});
    }
  };

  const sendWsCashout = (panelIndex: 1 | 2) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'cashout', panelIndex }));
    } else {
      const token = user?.sessionToken || localStorage.getItem('fb88_user_token') || '';
      fetch('/api/v1/casino/crash/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ panelIndex }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!d.success && d.error) showToast('error', d.error);
          else onRefreshWallet();
        })
        .catch(() => {});
    }
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = chatInput.trim();
    if (!clean) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat', message: clean }));
    }
    setChatInput('');
  };

  const balanceTk = wallet ? wallet.availablePaisa / 100 : 0;

  // Displayed list and totals for bottom All Bets / Previous / Top feed
  const feedRows = useMemo(() => {
    if (activeFeedTab === 'previous') return previousBets;
    if (activeFeedTab === 'top') return topWins;
    return currentBets;
  }, [activeFeedTab, currentBets, previousBets, topWins]);

  const cashedCount = useMemo(() => {
    if (activeFeedTab === 'previous') {
      return previousBets.filter((b) => b.status === 'CASHED_OUT').length;
    }
    if (activeFeedTab === 'top') return topWins.length;
    return currentBets.filter((b) => b.status === 'CASHED_OUT').length;
  }, [activeFeedTab, currentBets, previousBets, topWins]);

  const totalBetsCount = feedRows.length;
  const betsProgressPct = totalBetsCount > 0 ? Math.round((cashedCount / totalBetsCount) * 100) : 0;
  const totalWinBdt = useMemo(
    () => feedRows.reduce((sum, b) => sum + (b.status === 'CASHED_OUT' ? b.payoutTk || 0 : 0), 0),
    [feedRows]
  );

  // Render helper for a single betting panel (Panel 1 or Panel 2)
  const renderBetPanel = (
    panelIndex: 1 | 2,
    state: PanelState,
    setState: React.Dispatch<React.SetStateAction<PanelState>>,
    collapsible: boolean
  ) => {
    const activeBet = myActiveBets.find((b) => b.panelIndex === panelIndex && b.status === 'ACTIVE');
    const queuedBet = myQueuedBets.find((b) => b.panelIndex === panelIndex && b.status === 'QUEUED');
    const stakeNum = Math.max(1, Number(parseFloat(state.stakeInput) || 1));

    const adjustStake = (delta: number) => {
      const next = Math.max(1, Math.min(100000, Number((stakeNum + delta).toFixed(2))));
      setState((prev) => ({ ...prev, stakeInput: next.toFixed(2) }));
    };

    const setPresetStake = (val: number) => {
      setState((prev) => ({ ...prev, stakeInput: val.toFixed(2) }));
    };

    // Determine primary CTA button state matching Screenshots 2/3/4 real-time crash behavior
    let btnKind: 'bet' | 'cancel' | 'cashout' = 'bet';
    let btnSubLabel = '';
    if (phase === 'WAITING' && activeBet) {
      btnKind = 'cancel';
    } else if (phase === 'FLYING' && activeBet) {
      btnKind = 'cashout';
    } else if (queuedBet) {
      btnKind = 'cancel';
      btnSubLabel = lang === 'bn' ? 'পরবর্তী রাউন্ডের জন্য অপেক্ষমান' : 'Waiting for next round';
    }

    const handleMainAction = () => {
      if (btnKind === 'cancel') {
        sendWsCancel(panelIndex);
      } else if (btnKind === 'cashout') {
        sendWsCashout(panelIndex);
      } else {
        const autoMult =
          state.mode === 'auto' && state.autoCashoutEnabled
            ? Math.max(1.01, parseFloat(state.autoCashoutInput) || 2.0)
            : undefined;
        sendWsBet(panelIndex, stakeNum, autoMult);
      }
    };

    return (
      <div className="bg-[#1b1c1d] rounded-2xl p-2.5 sm:p-3 border border-white/[0.06] relative space-y-2.5 shadow-lg">
        {/* Top Row: Centered Bet | Auto Toggle + Optional Panel 2 Collapse Button */}
        <div className="relative flex items-center justify-center">
          <div className="inline-flex items-center bg-[#111213] rounded-full p-0.5 border border-white/5">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, mode: 'bet' }))}
              className={`px-6 sm:px-8 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                state.mode === 'bet' ? 'bg-[#2c2d30] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Bet
            </button>
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, mode: 'auto' }))}
              className={`px-6 sm:px-8 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                state.mode === 'auto' ? 'bg-[#2c2d30] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Auto
            </button>
          </div>

          {collapsible && (
            <button
              type="button"
              onClick={() => setPanel2Collapsed((c) => !c)}
              className="absolute right-0 w-7 h-7 rounded-full bg-[#26282a] hover:bg-[#323438] border border-white/10 text-zinc-300 flex items-center justify-center cursor-pointer"
              title={panel2Collapsed ? 'Show second panel' : 'Hide second panel'}
            >
              {panel2Collapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Main Panel Body */}
        {(!collapsible || !panel2Collapsed) && (
          <>
            <div className="flex items-stretch gap-2.5">
              {/* Left Side: Stake Stepper + 2x2 Presets */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between bg-[#0e0f10] rounded-full px-2 py-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => adjustStake(-1)}
                    className="w-6 h-6 rounded-full bg-[#242628] hover:bg-[#323438] text-zinc-300 flex items-center justify-center transition cursor-pointer shrink-0"
                    aria-label="Decrease stake"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="1"
                    value={state.stakeInput}
                    onChange={(e) => setState((prev) => ({ ...prev, stakeInput: e.target.value }))}
                    onBlur={() => {
                      const v = Math.max(1, Math.min(100000, parseFloat(state.stakeInput) || 1));
                      setState((prev) => ({ ...prev, stakeInput: v.toFixed(2) }));
                    }}
                    className="w-full bg-transparent text-center text-white font-bold text-sm sm:text-base tabular-nums focus:outline-hidden px-1"
                  />
                  <button
                    type="button"
                    onClick={() => adjustStake(1)}
                    className="w-6 h-6 rounded-full bg-[#242628] hover:bg-[#323438] text-zinc-300 flex items-center justify-center transition cursor-pointer shrink-0"
                    aria-label="Increase stake"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2x2 Preset Pills matching Screenshot 2: 100, 200, 500, 10,000 */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '100', val: 100 },
                    { label: '200', val: 200 },
                    { label: '500', val: 500 },
                    { label: '10,000', val: 10000 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setPresetStake(preset.val)}
                      className="py-1 rounded-full bg-[#141517] hover:bg-[#232528] border border-white/[0.06] text-zinc-300 hover:text-white text-xs font-medium tabular-nums transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Big Tactile Action Button */}
              <div className="w-[47%] sm:w-[45%] flex">
                <button
                  type="button"
                  onClick={handleMainAction}
                  className={`w-full rounded-2xl flex flex-col items-center justify-center px-2 py-3 transition active:scale-[0.98] cursor-pointer shadow-lg border-t ${
                    btnKind === 'cashout'
                      ? 'bg-[#d07206] hover:bg-[#e37f0a] border-[#f6ad42] text-white'
                      : btnKind === 'cancel'
                      ? 'bg-[#cb2222] hover:bg-[#de2a2a] border-[#ff6b6b] text-white'
                      : 'bg-[#28a909] hover:bg-[#2ebf0b] border-[#61e73f] text-white'
                  }`}
                >
                  {btnKind === 'cashout' && activeBet ? (
                    <>
                      <span className="text-sm sm:text-base font-bold leading-tight uppercase tracking-wide">
                        Cash Out
                      </span>
                      <span className="text-sm sm:text-lg font-extrabold tabular-nums leading-tight mt-0.5">
                        {formatBdt(activeBet.stakeTk * currentMultiplier)} BDT
                      </span>
                    </>
                  ) : btnKind === 'cancel' ? (
                    <>
                      <span className="text-base sm:text-lg font-bold leading-tight">Cancel</span>
                      {btnSubLabel && (
                        <span className="text-[10px] text-white/90 font-medium mt-0.5 text-center leading-tight">
                          {btnSubLabel}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-base sm:text-lg font-bold leading-tight">Bet</span>
                      <span className="text-sm sm:text-base font-bold tabular-nums leading-tight mt-0.5">
                        {formatBdt(stakeNum)} <span className="font-semibold text-xs sm:text-sm">BDT</span>
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Auto Mode Controls (Shown cleanly when 'Auto' tab is selected) */}
            {state.mode === 'auto' && (
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, autoBet: !prev.autoBet }))}
                  className="flex items-center gap-2 text-zinc-300 cursor-pointer"
                >
                  <span
                    className={`w-9 h-5 rounded-full p-0.5 transition flex items-center ${
                      state.autoBet ? 'bg-[#28a909] justify-end' : 'bg-[#2c2d30] justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow" />
                  </span>
                  <span className="font-medium">Auto Bet</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, autoCashoutEnabled: !prev.autoCashoutEnabled }))
                    }
                    className="flex items-center gap-1.5 text-zinc-300 cursor-pointer"
                  >
                    <span
                      className={`w-9 h-5 rounded-full p-0.5 transition flex items-center ${
                        state.autoCashoutEnabled ? 'bg-[#28a909] justify-end' : 'bg-[#2c2d30] justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow" />
                    </span>
                    <span className="font-medium">Auto Cash Out</span>
                  </button>
                  <div className="flex items-center bg-[#0e0f10] border border-white/10 rounded-full px-2.5 py-0.5 w-20">
                    <input
                      type="number"
                      min="1.01"
                      max="100"
                      step="0.1"
                      disabled={!state.autoCashoutEnabled}
                      value={state.autoCashoutInput}
                      onChange={(e) => setState((prev) => ({ ...prev, autoCashoutInput: e.target.value }))}
                      className="w-full bg-transparent text-white font-bold text-xs text-center tabular-nums focus:outline-hidden disabled:opacity-40"
                    />
                    <span className="text-zinc-400 text-[11px] font-bold">x</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0e0e0e] text-white flex flex-col overflow-hidden select-none">
      {/* ================================================================= */}
      {/* TOP BAR (Exact Screenshot 2, 3, 4 Header)                         */}
      {/* ================================================================= */}
      <header className="h-11 px-3 bg-[#1b1c1d] border-b border-white/[0.06] flex items-center justify-between shrink-0 relative">
        {/* Left: Iconic Red Aviator Wordmark + Back to Lobby button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#27282a] hover:bg-[#35373a] text-zinc-300 hover:text-white transition cursor-pointer"
            title={lang === 'bn' ? 'লবিতে ফিরুন' : 'Back to Lobby'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-serif italic font-black text-xl sm:text-2xl tracking-tight text-[#e50934] leading-none">
            Aviator
          </span>
        </div>

        {/* Center Top Notch Tab (matching screenshot) */}
        <button
          type="button"
          onClick={() => setShowHistoryModal((v) => !v)}
          className="hidden sm:flex items-center justify-center px-4 h-5 bg-[#20233a] hover:bg-[#292d4a] rounded-b-lg text-[10px] text-zinc-300 border-x border-b border-white/10 cursor-pointer"
          title="Round History & Fairness"
        >
          ▼
        </button>

        {/* Right: Green Live Balance BDT + Menu ≡ + Chat 💬 */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onOpenDeposit}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
            title={lang === 'bn' ? 'ডিপোজিট করুন' : 'Deposit'}
          >
            <span className="text-[#28a909] font-extrabold text-sm sm:text-base tabular-nums">
              {formatBdt(balanceTk)}
            </span>
            <span className="text-zinc-400 font-semibold text-xs sm:text-sm">BDT</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMenuDrawer(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowChatDrawer((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer relative"
            aria-label="Live Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {chatMessages.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#28a909]" />
            )}
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* SCROLLABLE MAIN WORKSPACE                                         */}
      {/* ================================================================= */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-2 max-w-4xl w-full mx-auto">
        {/* MULTIPLIER HISTORY RIBBON */}
        <div className="flex items-center justify-between gap-2 px-1 py-0.5">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {history.length === 0 ? (
              <span className="text-[11px] text-zinc-500 font-medium">
                {lang === 'bn' ? 'লাইভ রাউন্ড হিস্টোরি এখানে যুক্ত হবে...' : 'Waiting for live round history...'}
              </span>
            ) : (
              history.slice(0, 14).map((item) => (
                <button
                  key={item.roundId}
                  type="button"
                  onClick={() => setSelectedFairRound(item)}
                  className={`text-xs font-bold tabular-nums shrink-0 hover:opacity-80 cursor-pointer ${getMultiplierTextColor(item.crashPoint)}`}
                >
                  {item.crashPoint.toFixed(2)}x
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="w-8 h-6 rounded-full bg-[#252628] hover:bg-[#323438] text-zinc-300 flex items-center justify-center shrink-0 cursor-pointer border border-white/10"
            title="Full History"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* =============================================================== */}
        {/* FLIGHT RADAR STAGE (Matching Screenshots 2, 3, 4)               */}
        {/* =============================================================== */}
        <div
          ref={stageWrapperRef}
          className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/10 bg-[#08080a] shadow-2xl"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Live WebSocket Connection Status Dot (subtle top-left) */}
          <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
            {wsConnected ? (
              <>
                <Wifi className="w-3 h-3 text-[#28a909]" />
                <span className="text-zinc-400">LIVE WS</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-500 animate-pulse" />
                <span className="text-rose-400">Reconnecting...</span>
              </>
            )}
          </div>

          {/* Win / Error Toast Overlay */}
          {toastMsg && (
            <div
              className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full border shadow-2xl flex items-center gap-2 text-xs font-bold whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${
                toastMsg.kind === 'win'
                  ? 'bg-[#122e12]/95 border-[#28a909] text-white'
                  : 'bg-[#351015]/95 border-rose-500 text-rose-200'
              }`}
            >
              <span>{toastMsg.title}</span>
              {toastMsg.sub && (
                <span className="px-2 py-0.5 rounded-full bg-[#28a909] text-white text-[10px]">
                  {toastMsg.sub}
                </span>
              )}
            </div>
          )}

          {/* CENTER STAGE OVERLAY BY PHASE */}
          {phase === 'WAITING' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
              {/* Red OFFICIAL PARTNERS header matching Screenshot 2 */}
              <div className="flex items-center justify-center gap-3 mb-1.5">
                <span className="text-white/95 font-black italic text-lg sm:text-xl tracking-tight">
                  LIVE ARENA
                </span>
                <span className="h-5 w-px bg-white/30" />
                <span className="font-serif italic font-black text-lg sm:text-xl text-[#e50934]">
                  Aviator
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-extrabold tracking-[0.2em] text-white uppercase mb-2">
                OFFICIAL PARTNERS
              </div>

              {/* Crimson Countdown Progress Bar using SVG (No inline style width!) */}
              <div className="w-44 sm:w-52 h-1.5 rounded-full overflow-hidden bg-white/15 mb-3">
                <svg className="w-full h-full block" preserveAspectRatio="none">
                  <rect
                    x="0"
                    y="0"
                    width={`${waitingProgressPct}%`}
                    height="100%"
                    rx="3"
                    fill="#e50934"
                  />
                </svg>
              </div>

              {/* Official Game Status Card */}
              <div className="px-5 py-2.5 rounded-2xl bg-[#101809]/85 border border-[#4a7c22]/60 shadow-xl space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-[10px] font-black text-white">
                    A
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-wide text-white">
                    CRASH LIVE
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#13290b] border border-[#28a909]/60 text-[10px] text-zinc-200 font-semibold">
                  <span>Official Game</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#28a909] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>
                <div className="text-[9px] text-zinc-300/80 font-medium">Real-Time Multiplayer</div>
              </div>
            </div>
          )}

          {phase === 'FLYING' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-5xl sm:text-7xl font-black text-white tabular-nums tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
                {currentMultiplier.toFixed(2)}x
              </div>
            </div>
          )}

          {phase === 'CRASHED' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none space-y-1">
              <div className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-white">
                {(crashPoint ?? currentMultiplier) <= 1.01
                  ? (lang === 'bn' ? 'ব্লাস্ট হয়েছে! (INSTANT BLAST)' : 'BLASTED!')
                  : 'FLEW AWAY!'}
              </div>
              <div className="text-5xl sm:text-7xl font-black text-[#e50934] tabular-nums tracking-tight drop-shadow-[0_4px_20px_rgba(229,9,52,0.5)]">
                {(crashPoint ?? currentMultiplier).toFixed(2)}x
              </div>
            </div>
          )}

          {/* Bottom-Right Live Connected Players Badge (Exact match to Screenshots 2, 3, 4) */}
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 flex items-center gap-1.5 backdrop-blur-xs">
            <div className="flex -space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 border border-black text-[9px] font-black text-white flex items-center justify-center">
                {user.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="w-4 h-4 rounded-full bg-amber-500 border border-black text-[9px] font-black text-slate-950 flex items-center justify-center">
                ★
              </span>
            </div>
            <span className="text-xs font-bold text-white tabular-nums">
              {connectedPlayers.toLocaleString()}
            </span>
          </div>
        </div>

        {/* =============================================================== */}
        {/* DUAL BETTING PANELS (Exact Match to Screenshots 2, 3, 4)        */}
        {/* =============================================================== */}
        <div className="space-y-2">
          {renderBetPanel(1, panel1, setPanel1, false)}
          {renderBetPanel(2, panel2, setPanel2, true)}
        </div>

        {/* =============================================================== */}
        {/* BOTTOM LIVE BETS FEED: All Bets | Previous | Top                */}
        {/* =============================================================== */}
        <div className="bg-[#1b1c1d] rounded-2xl p-3 border border-white/[0.06] space-y-2.5">
          {/* Segmented Tabs */}
          <div className="flex items-center bg-[#111213] rounded-full p-0.5 border border-white/5">
            {([
              { id: 'all', label: 'All Bets' },
              { id: 'previous', label: 'Previous' },
              { id: 'top', label: 'Top' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFeedTab(tab.id)}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeFeedTab === tab.id
                    ? 'bg-[#2c2d30] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Summary Bar: X/Y Bets + Total win BDT + Green Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 border border-[#1b1c1d] text-[10px] font-bold flex items-center justify-center">
                    {user.username.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#28a909] border border-[#1b1c1d] text-[10px] font-bold flex items-center justify-center">
                    ♣
                  </span>
                </div>
                <div className="text-xs text-zinc-300 font-semibold tabular-nums">
                  <span className="text-white font-bold">
                    {cashedCount}/{totalBetsCount}
                  </span>{' '}
                  <span className="text-zinc-400 font-normal">Bets</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm sm:text-base font-extrabold text-white tabular-nums leading-tight">
                  {formatBdt(totalWinBdt)}
                </div>
                <div className="text-[11px] text-zinc-400">Total win BDT</div>
              </div>
            </div>

            <div className="w-full h-1 rounded-full bg-[#111213] overflow-hidden">
              <svg className="w-full h-full block" preserveAspectRatio="none">
                <rect
                  x="0"
                  y="0"
                  width={`${betsProgressPct}%`}
                  height="100%"
                  rx="2"
                  fill="#28a909"
                />
              </svg>
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-12 text-[11px] text-zinc-500 px-2 pt-1 font-medium">
            <div className="col-span-4">Player</div>
            <div className="col-span-3 text-right">Bet BDT</div>
            <div className="col-span-2 text-center">X</div>
            <div className="col-span-3 text-right">Win BDT</div>
          </div>

          {/* Live Bet Rows */}
          <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
            {feedRows.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                {lang === 'bn'
                  ? 'এই রাউন্ডে এখনো কোনো বাজি ধরা হয়নি। প্রথম বাজিটি ধরুন!'
                  : 'No live bets in this round yet.'}
              </div>
            ) : (
              feedRows.map((row) => {
                const isSelf = row.userId === user.id;
                const isWin = row.status === 'CASHED_OUT';
                return (
                  <div
                    key={row.betId}
                    className={`grid grid-cols-12 items-center px-2 py-1.5 rounded-xl text-xs border ${
                      isWin
                        ? 'bg-[#132b11]/70 border-[#28a909]/40'
                        : isSelf
                        ? 'bg-[#222426] border-white/10'
                        : 'bg-[#141517] border-transparent'
                    }`}
                  >
                    <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isSelf ? 'bg-[#28a909] text-white' : 'bg-zinc-700 text-zinc-200'
                        }`}
                      >
                        {row.username.slice(0, 1).toUpperCase()}
                      </span>
                      <span className={`truncate font-medium ${isSelf ? 'text-white font-bold' : 'text-zinc-300'}`}>
                        {maskUsername(row.username, isSelf)}
                      </span>
                    </div>

                    <div className="col-span-3 text-right font-semibold text-zinc-200 tabular-nums">
                      {formatBdt(row.stakeTk)}
                    </div>

                    <div className="col-span-2 flex justify-center">
                      {row.cashoutMultiplier ? (
                        <span
                          className={`px-1.5 py-0.5 rounded-full border text-[10px] font-bold tabular-nums ${getMultiplierBadgeClass(
                            row.cashoutMultiplier
                          )}`}
                        >
                          {row.cashoutMultiplier.toFixed(2)}x
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </div>

                    <div
                      className={`col-span-3 text-right font-bold tabular-nums ${
                        isWin ? 'text-[#28a909]' : 'text-zinc-500'
                      }`}
                    >
                      {isWin ? formatBdt(row.payoutTk || 0) : '—'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ROUND HISTORY MODAL (••• button)                                  */}
      {/* ================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[10010] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1b1c1d] border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#28a909]" />
                <span>Round History</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center w-full">No completed rounds yet.</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.roundId}
                    type="button"
                    onClick={() => {
                      setShowHistoryModal(false);
                      setSelectedFairRound(item);
                    }}
                    className={`px-2.5 py-1 rounded-full border text-xs font-bold tabular-nums cursor-pointer ${getMultiplierBadgeClass(
                      item.crashPoint
                    )}`}
                  >
                    {item.crashPoint.toFixed(2)}x
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* PROVABLY FAIR SEED VERIFIER MODAL                                 */}
      {/* ================================================================= */}
      {selectedFairRound && (
        <div className="fixed inset-0 z-[10020] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1b1c1d] border border-[#28a909]/40 rounded-2xl p-4 space-y-3 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-[#28a909]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFairRound(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono">
              <div className="p-2.5 rounded-xl bg-[#111213] border border-white/5">
                <div className="text-[10px] text-zinc-400">Round ID & Crash Multiplier</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-zinc-200">{selectedFairRound.roundId}</span>
                  <span className="font-bold text-[#e50934]">{selectedFairRound.crashPoint.toFixed(2)}x</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111213] border border-white/5 break-all">
                <div className="text-[10px] text-zinc-400">Pre-Round SHA-256 Seed Hash</div>
                <div className="text-emerald-400 mt-0.5">{selectedFairRound.serverSeedHash}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111213] border border-white/5 break-all">
                <div className="text-[10px] text-zinc-400">Revealed Server Seed</div>
                <div className="text-zinc-200 mt-0.5">{selectedFairRound.serverSeed}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MENU DRAWER (Sound FX, Current Hash, Game Limits, Back to Lobby)  */}
      {/* ================================================================= */}
      {showMenuDrawer && (
        <div className="fixed inset-0 z-[10010] bg-black/75 flex justify-end">
          <div className="w-72 max-w-[85vw] h-full bg-[#1b1c1d] border-l border-white/10 p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-black text-xl text-[#e50934]">Aviator</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#28a909]/20 text-[#28a909] font-bold">
                    CRASH LIVE
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMenuDrawer(false)}
                  className="p-1 rounded-full bg-white/10 text-zinc-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#141517] hover:bg-[#232528] text-xs font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#28a909]" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
                  <span>Sound FX</span>
                </span>
                <span className={soundEnabled ? 'text-[#28a909]' : 'text-zinc-500'}>
                  {soundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <div className="p-3 rounded-xl bg-[#141517] space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-[#28a909]" />
                  <span>Current Round SHA-256</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400 break-all">
                  {serverSeedHash || 'Initializing...'}
                </div>
                {revealedServerSeed && (
                  <div className="font-mono text-[10px] text-zinc-400 break-all pt-1 border-t border-white/5">
                    Seed: {revealedServerSeed}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#141517] space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Info className="w-4 h-4 text-[#34b4ff]" />
                  <span>Game Limits (BDT)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Min Bet:</span>
                  <span className="font-bold tabular-nums">1.00 BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Max Bet:</span>
                  <span className="font-bold tabular-nums">100,000.00 BDT</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#e50934] hover:bg-[#ff1b47] text-white font-bold text-xs cursor-pointer"
            >
              {lang === 'bn' ? 'লবিতে ফিরে যান' : 'Exit to Lobby'}
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* LIVE PLAYER CHAT DRAWER                                           */}
      {/* ================================================================= */}
      {showChatDrawer && (
        <div className="fixed inset-0 z-[10010] bg-black/75 flex justify-end">
          <div className="w-80 max-w-[90vw] h-full bg-[#1b1c1d] border-l border-white/10 flex flex-col">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <MessageSquare className="w-4 h-4 text-[#28a909]" />
                <span>Live Chat</span>
              </div>
              <button
                type="button"
                onClick={() => setShowChatDrawer(false)}
                className="p-1 rounded-full bg-white/10 text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">
                  {lang === 'bn' ? 'এখনো কোনো মেসেজ নেই। কথা বলুন!' : 'No chat messages yet.'}
                </div>
              ) : (
                chatMessages.map((m) => (
                  <div key={m.id} className="p-2 rounded-xl bg-[#141517] border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#34b4ff]">{m.username}</span>
                      <span className="text-zinc-500">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-zinc-200 break-words">{m.message}</div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendChat} className="p-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                maxLength={200}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
                className="flex-1 px-3 py-2 rounded-full bg-[#0e0f10] border border-white/10 text-xs text-white focus:outline-hidden focus:border-[#28a909]"
              />
              <button
                type="submit"
                className="p-2 rounded-full bg-[#28a909] hover:bg-[#31c40c] text-white cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
