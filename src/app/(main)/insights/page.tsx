'use client';

import { useState, useMemo } from 'react';
import { useStore, MONEY_SOURCES, EXPENSE_CATEGORIES, Expense, MoneyReceived } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingDown, TrendingUp, AlertTriangle, Target, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, ArrowDownRight, ArrowUpRight, CircleDollarSign,
  ReceiptIndianRupee, X
} from 'lucide-react';
import { Tip } from '@/components/Tip';

function getMonthKey(d: Date | string) { return typeof d === 'string' ? d.slice(0, 7) : d.toISOString().slice(0, 7); }
function prevMonthKey(mk: string) {
  const [y, m] = mk.split('-').map(Number);
  const d = new Date(y, m - 2, 15);
  return getMonthKey(d.toISOString().slice(0, 10));
}
function nextMonthKey(mk: string) {
  const [y, m] = mk.split('-').map(Number);
  const d = new Date(y, m, 15);
  return getMonthKey(d.toISOString().slice(0, 10));
}
function getMonthLabel(mk: string) {
  const [y, m] = mk.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1] + ' ' + y;
}
function getFullMonthLabel(mk: string) {
  const [y, m] = mk.split('-');
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][parseInt(m)-1] + ' ' + y;
}

const COLORS = ['#3b82f6','#ef4444','#22c55e','#f97316','#8b5cf6','#ec4899'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InsightsPage() {
  const { expenses, moneyReceived, savedMoneyEntries, getCurrentSavedMoney, getSpentByCategory, getTotalReceived, getTotalExpenses } = useStore();
  
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [month, setMonth] = useState(getMonthKey(todayStr));
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const prevMo = prevMonthKey(month);
  const byCat = getSpentByCategory(month);

  const totalReceived = getTotalReceived(month);
  const totalExpenses = getTotalExpenses(month);
  const prevExpenses = getTotalExpenses(prevMo);

  const catData = EXPENSE_CATEGORIES.filter(c => byCat[c.name]).map(c => ({ name: c.name, value: byCat[c.name], color: c.color }));
  const topCategory = catData.length > 0 ? catData.reduce((a, b) => a.value > b.value ? a : b) : null;

  const [yearNum, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const avgDaily = daysInMonth > 0 ? Math.round(totalExpenses / daysInMonth) : 0;
  const pctChange = prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;

  const savedThisMonth = savedMoneyEntries.filter(e => getMonthKey(e.date) === month);
  const savedAdditions = savedThisMonth.filter(e => e.type === 'add').reduce((s, e) => s + e.amount, 0);
  const savedRemovals = savedThisMonth.filter(e => e.type === 'remove').reduce((s, e) => s + e.amount, 0);

  const months6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return getMonthKey(d);
  });
  const trend = months6.map(m => {
    const exp = expenses.filter(e => getMonthKey(e.date) === m).reduce((s, e) => s + e.amount, 0);
    const rec = moneyReceived.filter(e => getMonthKey(e.date) === m).reduce((s, e) => s + e.amount, 0);
    return { month: getMonthLabel(m).split(' ')[0], expenses: exp, received: rec };
  });

  const paceDaysLeft = daysInMonth - new Date().getDate();
  const paceWarning = paceDaysLeft > 0 && totalExpenses / (daysInMonth - paceDaysLeft) * daysInMonth > totalReceived && totalReceived > 0;

  const allMonths = Array.from(new Set([...expenses.map(e => getMonthKey(e.date)), ...moneyReceived.map(e => getMonthKey(e.date))])).sort().reverse();
  const displayMonths = Array.from(new Set([getMonthKey(todayStr), ...allMonths])).sort().reverse();

  // ── CALENDAR AGGREGATIONS ──
  const dailyDataMap = useMemo(() => {
    const map = new Map<string, { spent: number; received: number; expList: Expense[]; recList: MoneyReceived[] }>();

    expenses.forEach((e) => {
      if (e.date.startsWith(month)) {
        if (!map.has(e.date)) map.set(e.date, { spent: 0, received: 0, expList: [], recList: [] });
        const entry = map.get(e.date)!;
        entry.spent += e.amount;
        entry.expList.push(e);
      }
    });

    moneyReceived.forEach((m) => {
      if (m.date.startsWith(month)) {
        if (!map.has(m.date)) map.set(m.date, { spent: 0, received: 0, expList: [], recList: [] });
        const entry = map.get(m.date)!;
        entry.received += m.amount;
        entry.recList.push(m);
      }
    });

    return map;
  }, [expenses, moneyReceived, month]);

  // Calendar Grid Days Calculation
  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay(); // 0 = Sun
    const daysInPrev = new Date(yearNum, monthNum - 1, 0).getDate();

    const cells = [];

    // Leading padding days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = daysInPrev - i;
      cells.push({ day: pDay, isCurrentMonth: false, dateStr: '' });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, isCurrentMonth: true, dateStr });
    }

    // Trailing padding days for next month
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      cells.push({ day: n, isCurrentMonth: false, dateStr: '' });
    }

    return cells;
  }, [yearNum, monthNum, daysInMonth]);

  // Selected date details
  const activeDayDetails = selectedDate && selectedDate.length === 10 ? dailyDataMap.get(selectedDate) : null;
  const selectedDateFormatted = selectedDate && selectedDate.length === 10 ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Insights</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Understand your spending and earning patterns.</p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex gap-2 flex-wrap items-center">
          {displayMonths.slice(0, 6).map(m => (
            <button
              key={m}
              onClick={() => { setMonth(m); setSelectedDate(`${m}-01`); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                month === m
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/70'
              }`}
            >
              {getMonthLabel(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Received</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{'\u20B9'}{totalReceived.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spent</p>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{'\u20B9'}{totalExpenses.toLocaleString('en-IN')}</p>
          {prevExpenses > 0 && (
            <p className={`text-xs mt-0.5 ${pctChange > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {pctChange > 0 ? '+' : ''}{pctChange}% vs last month
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Average</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{'\u20B9'}{avgDaily.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saved</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{'\u20B9'}{getCurrentSavedMoney().toLocaleString('en-IN')}</p>
        </div>
      </div>

      <Tip>Compare your spending with last month. If it went up, check which category grew the most — that&apos;s where to cut back.</Tip>

      {/* ── SPENDING & EARNINGS CALENDAR ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
              Spending &amp; Earnings Calendar
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Month Label */}
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mr-1 min-w-[120px] text-center">
              {getFullMonthLabel(month)}
            </span>

            {/* Today Button */}
            <button
              onClick={() => {
                const currentMo = getMonthKey(todayStr);
                setMonth(currentMo);
                setSelectedDate(todayStr);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
            >
              Today
            </button>

            {/* Prev / Next Month Buttons */}
            <button
              onClick={() => {
                const pm = prevMonthKey(month);
                setMonth(pm);
                setSelectedDate(`${pm}-01`);
              }}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => {
                const nm = nextMonthKey(month);
                setMonth(nm);
                setSelectedDate(`${nm}-01`);
              }}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 pt-1 pb-2 border-b border-gray-100 dark:border-gray-700/60 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Spent (Expenses)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Received (Earnings)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-indigo-500 inline-block bg-indigo-500/20" />
            <span>Selected / Today</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-1.5 text-center select-none">
          {/* Weekday headers */}
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-1 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
              {wd}
            </div>
          ))}

          {/* Day Cells */}
          {calendarCells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-14 md:h-16 rounded-xl bg-gray-50/40 dark:bg-gray-900/30 text-gray-300 dark:text-gray-700 text-xs flex items-start justify-start p-1.5"
                >
                  <span>{cell.day}</span>
                </div>
              );
            }

            const dataForDay = dailyDataMap.get(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;
            const hasSpent = dataForDay && dataForDay.spent > 0;
            const hasReceived = dataForDay && dataForDay.received > 0;

            const srLabel = `${cell.dateStr}: ${
              hasSpent ? `Spent ₹${dataForDay.spent}. ` : ''
            }${hasReceived ? `Received ₹${dataForDay.received}. ` : ''}${
              !hasSpent && !hasReceived ? 'No transactions.' : ''
            }`;

            return (
              <button
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr)}
                aria-label={srLabel}
                className={`
                  h-14 md:h-16 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all relative
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 ring-2 ring-indigo-500 dark:ring-indigo-400'
                    : isToday
                    ? 'bg-gray-100 dark:bg-gray-700/60 ring-1 ring-indigo-400 dark:ring-indigo-400'
                    : 'bg-gray-50/70 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700/50'
                  }
                `}
              >
                {/* Day number & Today dot */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-600 dark:text-indigo-300' : isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {cell.day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Today" />
                  )}
                </div>

                {/* Activity Badges */}
                <div className="space-y-0.5 overflow-hidden w-full">
                  {hasReceived && (
                    <div className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">+₹{dataForDay.received.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {hasSpent && (
                    <div className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="truncate">-₹{dataForDay.spent.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Transaction Detail Panel */}
        {selectedDate && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Details for {selectedDateFormatted}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg text-xs"
              >
                <X size={16} />
              </button>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-2.5 text-center">
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Received</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  +{'\u20B9'}{(activeDayDetails?.received || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-2.5 text-center">
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Spent</p>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                  -{'\u20B9'}{(activeDayDetails?.spent || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-2.5 text-center">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Net Day Total</p>
                {(() => {
                  const net = (activeDayDetails?.received || 0) - (activeDayDetails?.spent || 0);
                  const isPos = net > 0;
                  const isNeg = net < 0;
                  return (
                    <p className={`text-sm font-bold mt-0.5 ${isPos ? 'text-emerald-600 dark:text-emerald-400' : isNeg ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {isPos ? '+' : ''}{'\u20B9'}{net.toLocaleString('en-IN')}
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Individual Transactions List */}
            {activeDayDetails && (activeDayDetails.expList.length > 0 || activeDayDetails.recList.length > 0) ? (
              <div className="space-y-2 pt-1">
                {/* Money Received items */}
                {activeDayDetails.recList.map((m) => {
                  const src = MONEY_SOURCES.find((s) => s.name === m.source);
                  const Icon = src?.icon || CircleDollarSign;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/[0.06] border border-emerald-100 dark:border-emerald-500/15"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{m.source}</p>
                          {m.note && <p className="text-[11px] text-gray-500 dark:text-gray-400">{m.note}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{'\u20B9'}{m.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}

                {/* Expense items */}
                {activeDayDetails.expList.map((e) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.name === e.category);
                  const Icon = cat?.icon || ReceiptIndianRupee;
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 dark:bg-rose-500/[0.06] border border-rose-100 dark:border-rose-500/15"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-rose-600 dark:text-rose-400" style={{ color: cat?.color }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{e.category}</p>
                          {e.description && <p className="text-[11px] text-gray-500 dark:text-gray-400">{e.description}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        -{'\u20B9'}{e.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No spending or earnings recorded on this date.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insights Insights & Alerts */}
      <div className="space-y-3">
        {topCategory && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <TrendingDown size={18} className="text-rose-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">{topCategory.name}</span> is your biggest expense at {'\u20B9'}{topCategory.value.toLocaleString('en-IN')}.</p>
          </div>
        )}
        {pctChange > 0 && prevExpenses > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">You&apos;ve spent <span className="font-semibold text-rose-600 dark:text-rose-400">{pctChange}% more</span> than last month.</p>
          </div>
        )}
        {pctChange < 0 && prevExpenses > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <TrendingUp size={18} className="text-emerald-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Great! You&apos;ve spent <span className="font-semibold text-emerald-600 dark:text-emerald-400">{Math.abs(pctChange)}% less</span> than last month.</p>
          </div>
        )}
        {paceWarning && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">At your current pace, you may <span className="font-semibold">run out of your monthly allowance early</span>.</p>
          </div>
        )}
        {savedAdditions > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <Target size={18} className="text-indigo-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Your Saved Money <span className="font-semibold text-emerald-600 dark:text-emerald-400">increased by {'\u20B9'}{savedAdditions.toLocaleString('en-IN')}</span> this month.</p>
          </div>
        )}
        {savedRemovals > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <Target size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">You withdrew <span className="font-semibold text-amber-600 dark:text-amber-400">{'\u20B9'}{savedRemovals.toLocaleString('en-IN')}</span> from saved money this month.</p>
          </div>
        )}
        {totalReceived > 0 && totalExpenses > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <Target size={18} className="text-indigo-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">You&apos;ve used <span className="font-semibold">{Math.round((totalExpenses / totalReceived) * 100)}%</span> of your received money.</p>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
          {catData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="45%" height={200}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {catData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => ['\u20B9' + Number(v).toLocaleString('en-IN')]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#1f2937', color: '#f3f4f6' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {catData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{c.name}</span>
                    <span className="font-medium dark:text-gray-300">{'\u20B9'}{c.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No expenses recorded.</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">6-Month Trend</h2>
          {trend.some(t => t.expenses > 0 || t.received > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(v) => ['\u20B9' + Number(v).toLocaleString('en-IN')]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#1f2937', color: '#f3f4f6' }} />
                <Bar dataKey="received" fill="#22c55e" radius={[4, 4, 0, 0]} name="Received" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Not enough data for trend.</div>
          )}
        </div>
      </div>
    </div>
  );
}
