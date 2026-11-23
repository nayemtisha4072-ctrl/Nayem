/**
 * WeeklyBettingChart.tsx
 * High-performance D3.js line & area chart visualizing the player's
 * weekly betting performance, turnover, and profit/loss history.
 * Designed for Banglabaji Personal Center with luxury crimson & gold casino theme.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Award,
  Calendar,
  Sparkles,
  Layers,
  BarChart2,
  HelpCircle,
} from 'lucide-react';

export interface DailyPerformancePoint {
  date: string;
  dayLabel: string;
  dayLabelBn: string;
  totalStakeTk: number;
  totalPayoutTk: number;
  netPnlTk: number;
  cumulativePnlTk: number;
  betsCount: number;
  winsCount: number;
  winRate: number;
}

interface WeeklyBettingChartProps {
  data?: DailyPerformancePoint[];
  bettingRecords?: any[];
  pnlSummary?: {
    totalBetTk: number;
    totalWonTk: number;
    netPnlTk: number;
    winRate: number;
    totalBets: number;
  };
  lang: 'bn' | 'en';
}

type ChartMetric = 'netPnl' | 'cumulative' | 'turnoverVsPayout';

export const WeeklyBettingChart: React.FC<WeeklyBettingChartProps> = ({
  data: initialData,
  bettingRecords = [],
  pnlSummary,
  lang,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [metric, setMetric] = useState<ChartMetric>('netPnl');
  const [hoveredPoint, setHoveredPoint] = useState<DailyPerformancePoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');

  // Compute or sanitize weekly points from bettingRecords or initialData or realistic baseline
  const chartData = useMemo<DailyPerformancePoint[]>(() => {
    const daysCount = timeRange === '14d' ? 14 : 7;
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    const now = new Date();

    // Check if initialData covers the requested range
    if (initialData && initialData.length >= daysCount) {
      return initialData.slice(-daysCount);
    }

    // Build day slots
    const days: DailyPerformancePoint[] = [];
    let runningCumulative = 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      // Find matching bets from bettingRecords if any
      const matchingBets = bettingRecords.filter((b) => {
        const betDate = (b.placedAt || b.createdAt || '').substring(0, 10);
        return betDate === dateStr;
      });

      let stake = 0;
      let payout = 0;
      let wins = 0;

      matchingBets.forEach((b) => {
        const st = (b.stakePaisa || 0) / 100;
        stake += st;
        if (b.status === 'WON') {
          wins++;
          payout += (b.payoutPaisa || 0) / 100;
        }
      });

      const dayPnl = payout - stake;
      runningCumulative += dayPnl;

      days.push({
        date: dateStr,
        dayLabel: dayNamesEn[dayOfWeek],
        dayLabelBn: dayNamesBn[dayOfWeek],
        totalStakeTk: stake,
        totalPayoutTk: payout,
        netPnlTk: dayPnl,
        cumulativePnlTk: runningCumulative,
        betsCount: matchingBets.length,
        winsCount: wins,
        winRate: matchingBets.length > 0 ? Math.round((wins / matchingBets.length) * 100) : 0,
      });
    }

    return days;
  }, [initialData, bettingRecords, timeRange]);

  // Aggregate summary metrics for the selected timeframe
  const summary = useMemo<{
    totalStake: number;
    totalPayout: number;
    totalPnl: number;
    totalBets: number;
    avgWinRate: number;
    bestDay: DailyPerformancePoint | null;
  }>(() => {
    let totalStake = 0;
    let totalPayout = 0;
    let totalPnl = 0;
    let totalBets = 0;
    let totalWins = 0;
    let bestDay: DailyPerformancePoint | null = null;

    for (const d of chartData) {
      totalStake += d.totalStakeTk;
      totalPayout += d.totalPayoutTk;
      totalPnl += d.netPnlTk;
      totalBets += d.betsCount;
      totalWins += d.winsCount;

      if (!bestDay || d.netPnlTk > bestDay.netPnlTk) {
        bestDay = d;
      }
    }

    const avgWinRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0;

    return {
      totalStake,
      totalPayout,
      totalPnl,
      totalBets,
      avgWinRate,
      bestDay,
    };
  }, [chartData]);

  // Render D3 Line Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = container.clientWidth || 640;
    const height = Math.max(260, Math.min(320, container.clientHeight || 280));
    const margin = { top: 28, right: 30, bottom: 42, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');

    // 1. Gradients
    // Green gradient for profit
    const pnlGreenGrad = defs
      .append('linearGradient')
      .attr('id', 'pnl-green-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    pnlGreenGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.45);
    pnlGreenGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Rose gradient for drawdown
    const pnlRoseGrad = defs
      .append('linearGradient')
      .attr('id', 'pnl-rose-grad')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');
    pnlRoseGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.4);
    pnlRoseGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.0);

    // Amber gradient for turnover
    const turnoverGrad = defs
      .append('linearGradient')
      .attr('id', 'turnover-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    turnoverGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24').attr('stop-opacity', 0.4);
    turnoverGrad.append('stop').attr('offset', '100%').attr('stop-color', '#fbbf24').attr('stop-opacity', 0.0);

    // Cyan gradient for payout
    const payoutGrad = defs
      .append('linearGradient')
      .attr('id', 'payout-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    payoutGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.35);
    payoutGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // Filter for glowing dots
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 2. Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(chartData.map((d) => d.date))
      .range([0, innerWidth])
      .padding(0.2);

    // Compute Y domain depending on active metric
    let yMin = 0;
    let yMax = 100;

    if (metric === 'netPnl') {
      const vals = chartData.map((d) => d.netPnlTk);
      const minVal = Math.min(...vals, 0);
      const maxVal = Math.max(...vals, 0);
      const pad = Math.max(100, (maxVal - minVal) * 0.2);
      yMin = minVal - pad;
      yMax = maxVal + pad;
    } else if (metric === 'cumulative') {
      const vals = chartData.map((d) => d.cumulativePnlTk);
      const minVal = Math.min(...vals, 0);
      const maxVal = Math.max(...vals, 0);
      const pad = Math.max(100, (maxVal - minVal) * 0.2);
      yMin = minVal - pad;
      yMax = maxVal + pad;
    } else {
      // turnoverVsPayout
      const allVals = chartData.flatMap((d) => [d.totalStakeTk, d.totalPayoutTk]);
      yMin = 0;
      yMax = Math.max(...allVals, 500) * 1.25;
    }

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]).nice();

    // 3. Horizontal Grid lines
    const yAxisTicks = yScale.ticks(5);
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yAxisTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.08)')
      .attr('stroke-dasharray', '3,3');

    // 4. Zero Baseline (Break-even line) for P/L metrics
    if ((metric === 'netPnl' || metric === 'cumulative') && yMin < 0 && yMax > 0) {
      const zeroY = yScale(0);
      const zeroGroup = g.append('g').attr('class', 'zero-line');

      zeroGroup
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', zeroY)
        .attr('y2', zeroY)
        .attr('stroke', '#fbbf24')
        .attr('stroke-width', 1.25)
        .attr('stroke-dasharray', '5,4')
        .attr('opacity', 0.85);

      zeroGroup
        .append('text')
        .attr('x', innerWidth)
        .attr('y', zeroY - 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#fbbf24')
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .text(lang === 'bn' ? '৳০.০০ (ব্রেক-ইভেন)' : '৳0.00 (Break-Even)');
    }

    // 5. Line and Area paths
    if (metric === 'turnoverVsPayout') {
      // Stake line & area
      const stakeArea = d3
        .area<DailyPerformancePoint>()
        .x((d) => xScale(d.date) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.totalStakeTk))
        .curve(d3.curveMonotoneX);

      const stakeLine = d3
        .line<DailyPerformancePoint>()
        .x((d) => xScale(d.date) || 0)
        .y((d) => yScale(d.totalStakeTk))
        .curve(d3.curveMonotoneX);

      // Payout line & area
      const payoutArea = d3
        .area<DailyPerformancePoint>()
        .x((d) => xScale(d.date) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.totalPayoutTk))
        .curve(d3.curveMonotoneX);

      const payoutLine = d3
        .line<DailyPerformancePoint>()
        .x((d) => xScale(d.date) || 0)
        .y((d) => yScale(d.totalPayoutTk))
        .curve(d3.curveMonotoneX);

      // Stake Fill & Line
      g.append('path').datum(chartData).attr('fill', 'url(#turnover-grad)').attr('d', stakeArea);
      g.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', '#fbbf24')
        .attr('stroke-width', 2.5)
        .attr('d', stakeLine);

      // Payout Fill & Line
      g.append('path').datum(chartData).attr('fill', 'url(#payout-grad)').attr('d', payoutArea);
      g.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '4,2')
        .attr('d', payoutLine);
    } else {
      // PnL or Cumulative Single Series
      const getVal = (d: DailyPerformancePoint) => (metric === 'netPnl' ? d.netPnlTk : d.cumulativePnlTk);
      const zeroY = yScale(0);

      const area = d3
        .area<DailyPerformancePoint>()
        .x((d) => xScale(d.date) || 0)
        .y0(zeroY)
        .y1((d) => yScale(getVal(d)))
        .curve(d3.curveMonotoneX);

      const line = d3
        .line<DailyPerformancePoint>()
        .x((d) => xScale(d.date) || 0)
        .y((d) => yScale(getVal(d)))
        .curve(d3.curveMonotoneX);

      const isOverallProfitable = (metric === 'netPnl' ? summary.totalPnl : chartData[chartData.length - 1]?.cumulativePnlTk) >= 0;

      // Area fill
      g.append('path')
        .datum(chartData)
        .attr('fill', isOverallProfitable ? 'url(#pnl-green-grad)' : 'url(#pnl-rose-grad)')
        .attr('d', area);

      // Stroke Line
      g.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', isOverallProfitable ? '#10b981' : '#f43f5e')
        .attr('stroke-width', 3)
        .attr('filter', 'url(#glow)')
        .attr('d', line);
    }

    // 6. Data Nodes / Dots
    const dotsGroup = g.append('g').attr('class', 'data-nodes');
    chartData.forEach((d) => {
      const cx = xScale(d.date) || 0;
      let cy = 0;
      let color = '#10b981';

      if (metric === 'turnoverVsPayout') {
        // Draw both stake and payout circles
        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', yScale(d.totalStakeTk))
          .attr('r', 4)
          .attr('fill', '#fbbf24')
          .attr('stroke', '#1e0510')
          .attr('stroke-width', 2);

        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', yScale(d.totalPayoutTk))
          .attr('r', 4)
          .attr('fill', '#06b6d4')
          .attr('stroke', '#1e0510')
          .attr('stroke-width', 2);
        return;
      } else if (metric === 'netPnl') {
        cy = yScale(d.netPnlTk);
        color = d.netPnlTk >= 0 ? '#10b981' : '#f43f5e';
      } else {
        cy = yScale(d.cumulativePnlTk);
        color = d.cumulativePnlTk >= 0 ? '#10b981' : '#f43f5e';
      }

      // Outer halo for best day
      if (summary.bestDay && d.date === summary.bestDay.date && metric === 'netPnl') {
        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 8)
          .attr('fill', 'none')
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '2,2')
          .attr('opacity', 0.9);
      }

      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4.5)
        .attr('fill', color)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('class', 'cursor-pointer transition-all duration-150');
    });

    // 7. X-Axis (Bottom)
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(0)
          .tickPadding(10)
      );

    xAxis.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.15)');
    xAxis
      .selectAll('text')
      .attr('fill', '#cbd5e1')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d: any) => {
        const item = chartData.find((p) => p.date === d);
        if (!item) return d;
        const day = lang === 'bn' ? item.dayLabelBn : item.dayLabel;
        const dayNum = item.date.split('-')[2];
        return `${day} ${dayNum}`;
      });

    // 8. Y-Axis (Left)
    const yAxis = g
      .append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(0)
          .tickPadding(8)
          .tickFormat((d) => {
            const num = Number(d);
            if (Math.abs(num) >= 1000) {
              return `৳${(num / 1000).toFixed(1)}k`;
            }
            return `৳${num}`;
          })
      );

    yAxis.select('.domain').remove();
    yAxis
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    // 9. Interactive Mouse Overlay & Tooltip
    const focusLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(255, 255, 255, 0.35)')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        // Find closest point by x coordinate
        let closest: DailyPerformancePoint = chartData[0];
        let minDist = Infinity;

        chartData.forEach((d) => {
          const px = xScale(d.date) || 0;
          const dist = Math.abs(px - mx);
          if (dist < minDist) {
            minDist = dist;
            closest = d;
          }
        });

        const cx = xScale(closest.date) || 0;
        focusLine.attr('x1', cx).attr('x2', cx).style('opacity', 1);

        setHoveredPoint(closest);

        // Compute tooltip coordinates relative to container
        const matrix = svgRef.current?.getBoundingClientRect();
        if (matrix) {
          setTooltipPos({
            x: cx + margin.left,
            y: Math.max(20, Math.min(innerHeight - 40, event.offsetY)),
          });
        }
      })
      .on('mouseleave', () => {
        focusLine.style('opacity', 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      });
  }, [chartData, metric, lang, summary]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Controls Cluster */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#940042]/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-white tracking-wide">
              {lang === 'bn' ? 'সাপ্তাহিক বেটিং পারফরম্যান্স ও P/L হিস্ট্রি' : 'Weekly Betting Performance & P/L Chart'}
            </h3>
          </div>
          <p className="text-xs text-rose-200/70 mt-0.5">
            {lang === 'bn'
              ? 'D3.js চালিত ইন্টারেক্টিভ চার্টে আপনার লাভ, ক্ষতি ও টার্নওভার বিশ্লেষণ করুন'
              : 'Interactive D3.js chart tracking daily returns, turnover, and net yield'}
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#47001f] p-1 rounded-xl border border-[#940042] self-start sm:self-auto">
          <button
            onClick={() => setMetric('netPnl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              metric === 'netPnl'
                ? 'bg-[#940042] text-white shadow font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'দৈনিক লাভ/ক্ষতি' : 'Daily P/L'}</span>
          </button>

          <button
            onClick={() => setMetric('cumulative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              metric === 'cumulative'
                ? 'bg-[#940042] text-white shadow font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'সঞ্চিত P/L' : 'Cumulative'}</span>
          </button>

          <button
            onClick={() => setMetric('turnoverVsPayout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              metric === 'turnoverVsPayout'
                ? 'bg-[#940042] text-white shadow font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'টার্নওভার বনাম পেআউট' : 'Turnover / Payout'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* KPI 1: Net P/L */}
        <div className="p-3 rounded-2xl bg-[#47001f] border border-[#940042] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>{lang === 'bn' ? '৭ দিনের নীট লাভ/ক্ষতি' : '7-Day Net P/L'}</span>
            {summary.totalPnl >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div
            className={`text-lg font-mono font-black mt-1 ${
              summary.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {summary.totalPnl >= 0 ? '+' : ''}৳{summary.totalPnl.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">
            {summary.totalPnl >= 0
              ? lang === 'bn'
                ? '🟢 প্রফিটেবল রান'
                : '🟢 In Profit'
              : lang === 'bn'
              ? '🔴 রিকভারি মোড'
              : '🔴 Drawdown'}
          </span>
        </div>

        {/* KPI 2: Total Turnover */}
        <div className="p-3 rounded-2xl bg-[#47001f] border border-[#940042] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>{lang === 'bn' ? 'মোট স্টেক / টার্নওভার' : 'Weekly Turnover'}</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-mono font-black text-amber-300 mt-1">
            ৳{summary.totalStake.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">
            {summary.totalBets} {lang === 'bn' ? 'টি রাউন্ড খেলা হয়েছে' : 'bets settled'}
          </span>
        </div>

        {/* KPI 3: Best Day */}
        <div className="p-3 rounded-2xl bg-[#47001f] border border-[#940042] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>{lang === 'bn' ? 'সর্বোচ্চ জয়ের দিন' : 'Best Return Day'}</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-mono font-black text-white mt-1">
            {summary.bestDay && summary.totalBets > 0
              ? `${summary.bestDay.netPnlTk >= 0 ? '+' : ''}৳${summary.bestDay.netPnlTk.toFixed(2)}`
              : '৳0.00'}
          </div>
          <span className="text-[10px] text-amber-400 font-bold">
            {summary.bestDay && summary.totalBets > 0
              ? `${lang === 'bn' ? summary.bestDay.dayLabelBn : summary.bestDay.dayLabel} (${summary.bestDay.date.substring(5)})`
              : (lang === 'bn' ? 'কোনো বাজি নেই' : 'No bets yet')}
          </span>
        </div>

        {/* KPI 4: Win Rate */}
        <div className="p-3 rounded-2xl bg-[#47001f] border border-[#940042] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>{lang === 'bn' ? 'সাপ্তাহিক উইন রেট' : 'Weekly Win Rate'}</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-mono font-black text-cyan-300 mt-1">
            {summary.avgWinRate}%
          </div>
          <span className="text-[10px] text-slate-400">
            {lang === 'bn' ? 'স্ট্র্যাটেজিক পারফরম্যান্স' : 'Consistent accuracy'}
          </span>
        </div>
      </div>

      {/* 3. D3 SVG Canvas Container with Relative Tooltip */}
      <div className="relative rounded-2xl bg-[#42001c] border border-[#940042] p-2 sm:p-3 overflow-hidden shadow-inner">
        {/* Timeframe selector pill inside chart box */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10 text-[10px]">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-1.5 py-0.5 rounded font-bold transition ${
              timeRange === '7d' ? 'bg-[#940042] text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? '৭ দিন' : '7 Days'}
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-1.5 py-0.5 rounded font-bold transition ${
              timeRange === '14d' ? 'bg-[#940042] text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? '১৪ দিন' : '14 Days'}
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-300 px-2 pt-1 pb-2">
          {metric === 'turnoverVsPayout' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded bg-[#fbbf24]"></span>
                <span className="text-amber-300 font-bold">{lang === 'bn' ? 'স্টেক (টার্নওভার)' : 'Stake / Turnover'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded bg-[#06b6d4] border-t border-dashed"></span>
                <span className="text-cyan-300 font-bold">{lang === 'bn' ? 'পেআউট (জিত)' : 'Payout'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded bg-[#10b981]"></span>
                <span className="text-emerald-400 font-bold">{lang === 'bn' ? 'লাভের ট্রেন্ড (Profit)' : 'Profit Trend'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded bg-[#f43f5e]"></span>
                <span className="text-rose-400 font-bold">{lang === 'bn' ? 'ড্রডাউন (Loss)' : 'Drawdown'}</span>
              </div>
            </>
          )}
        </div>

        {/* Chart Drawing Surface */}
        <div ref={containerRef} className="w-full h-64 sm:h-72 select-none relative">
          <svg ref={svgRef} className="w-full h-full overflow-visible" />

          {/* Interactive Floating Tooltip Card */}
          {hoveredPoint && tooltipPos && (
            <div
              className="absolute pointer-events-none z-30 transition-transform duration-75 ease-out"
              style={{
                left: Math.min(
                  Math.max(10, tooltipPos.x - 90),
                  (containerRef.current?.clientWidth || 300) - 190
                ),
                top: Math.max(10, tooltipPos.y - 70),
              }}
            >
              <div className="w-48 bg-[#1a0510]/95 border border-amber-400/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-white text-xs space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className="font-extrabold text-amber-300">
                    {lang === 'bn' ? hoveredPoint.dayLabelBn : hoveredPoint.dayLabel} ({hoveredPoint.date})
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-slate-300">
                    {hoveredPoint.betsCount} {lang === 'bn' ? 'বেট' : 'bets'}
                  </span>
                </div>

                <div className="space-y-0.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>{lang === 'bn' ? 'টার্নওভার:' : 'Turnover:'}</span>
                    <span className="font-bold text-amber-300">৳{hoveredPoint.totalStakeTk.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{lang === 'bn' ? 'পেআউট:' : 'Payout:'}</span>
                    <span className="font-bold text-cyan-300">৳{hoveredPoint.totalPayoutTk.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10">
                    <span className="font-sans font-bold">{lang === 'bn' ? 'দৈনিক P/L:' : 'Daily P/L:'}</span>
                    <span
                      className={`font-black ${
                        hoveredPoint.netPnlTk >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {hoveredPoint.netPnlTk >= 0 ? '+' : ''}৳{hoveredPoint.netPnlTk.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{lang === 'bn' ? 'সঞ্চিত P/L:' : 'Cumulative:'}</span>
                    <span className={hoveredPoint.cumulativePnlTk >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                      ৳{hoveredPoint.cumulativePnlTk.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Helper Hint */}
        <div className="pt-2 px-1 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-1 border-t border-white/5">
          <span>
            {lang === 'bn'
              ? '💡 চার্টের যেকোনো পয়েন্টের উপর মাউস বা আঙুল রেখে বিশদ তথ্য দেখুন'
              : '💡 Hover or touch any data point on the chart for full day breakdown'}
          </span>
          <span className="text-amber-400/80 font-bold">
            {lang === 'bn' ? 'লাইভ ফেয়ার গেম ইঞ্জিন ভেরিফাইড' : 'Live Engine Verified'}
          </span>
        </div>
      </div>
    </div>
  );
};
