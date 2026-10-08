import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TrendingUp, Layers, CheckCircle2, Coins, ChevronRight } from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { CURRENCY_SYMBOLS } from '../../services/allegroData';
import { SupportedCurrency } from '../../types/allegro';
import { useTheme } from '../../context/ThemeContext';

interface WeeklyRawPoint {
  week: string;
  fullWeek: string;
  allegroPln: number;
  emagPln: number;
  allegroOrders: number;
  emagOrders: number;
}

const RAW_WEEKLY_DATA: WeeklyRawPoint[] = [
  { week: 'H32', fullWeek: 'Hafta 32 (Ağustos Başı)', allegroPln: 8450, emagPln: 1400, allegroOrders: 58, emagOrders: 16 },
  { week: 'H33', fullWeek: 'Hafta 33 (12-18 Ağu)', allegroPln: 9100, emagPln: 1650, allegroOrders: 64, emagOrders: 19 },
  { week: 'H34', fullWeek: 'Hafta 34 (19-25 Ağu)', allegroPln: 10250, emagPln: 1950, allegroOrders: 72, emagOrders: 23 },
  { week: 'H35', fullWeek: 'Hafta 35 (26 Ağu - 1 Eyl)', allegroPln: 9800, emagPln: 1850, allegroOrders: 69, emagOrders: 21 },
  { week: 'H36', fullWeek: 'Hafta 36 (2-8 Eyl)', allegroPln: 11400, emagPln: 2250, allegroOrders: 81, emagOrders: 26 },
  { week: 'H37', fullWeek: 'Hafta 37 (9-15 Eyl)', allegroPln: 12600, emagPln: 2500, allegroOrders: 89, emagOrders: 29 },
  { week: 'H38', fullWeek: 'Hafta 38 (16-22 Eyl)', allegroPln: 13150, emagPln: 2750, allegroOrders: 93, emagOrders: 32 },
  { week: 'H39', fullWeek: 'Hafta 39 (23-29 Eyl)', allegroPln: 14200, emagPln: 3050, allegroOrders: 101, emagOrders: 36 },
  { week: 'H40', fullWeek: 'Hafta 40 (Son Hafta - Güncel)', allegroPln: 15840, emagPln: 3450, allegroOrders: 114, emagOrders: 41 }
];

const CHANNELS = [
  { id: 'all', label: 'Tüm Kanallar', color: '#163300' },
  { id: 'allegro', label: 'Allegro', color: '#FF5A00' },
  { id: 'emag', label: 'eMAG', color: '#0056B3' }
];

export const WeeklySalesChart: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [metricMode, setMetricMode] = useState<'revenue' | 'orders'>('revenue');
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(store.getActiveCurrency());

  useEffect(() => {
    return store.subscribe(() => {
      setActiveCurrency(store.getActiveCurrency());
    });
  }, []);

  const currencySymbol = CURRENCY_SYMBOLS[activeCurrency] || activeCurrency;

  // Convert points dynamically based on real live orders in store
  const orders = store.getOrders();
  const emagOrdersList = orders.filter(o => o.platform === 'emag');
  const allegroOrdersList = orders.filter(o => o.platform === 'allegro');
  const emagRevenue = emagOrdersList.reduce((sum, o) => sum + (parseFloat(o.summary.totalToPay.amount) || 0), 0);
  const allegroRevenue = allegroOrdersList.reduce((sum, o) => sum + (parseFloat(o.summary.totalToPay.amount) || 0), 0);

  const allegroConverted = store.convertFromPln(allegroRevenue, activeCurrency);
  const emagConverted = store.convertFromPln(emagRevenue, activeCurrency);
  const totalConverted = parseFloat((allegroConverted + emagConverted).toFixed(2));

  const chartData = [
    { week: 'H33', fullWeek: 'Hafta 33', allegro: 0, emag: 0, total: 0, allegroOrders: 0, emagOrders: 0, totalOrders: 0 },
    { week: 'H34', fullWeek: 'Hafta 34', allegro: 0, emag: 0, total: 0, allegroOrders: 0, emagOrders: 0, totalOrders: 0 },
    { week: 'H35', fullWeek: 'Hafta 35', allegro: 0, emag: 0, total: 0, allegroOrders: 0, emagOrders: 0, totalOrders: 0 },
    { week: 'H36', fullWeek: 'Hafta 36', allegro: 0, emag: 0, total: 0, allegroOrders: 0, emagOrders: 0, totalOrders: 0 },
    { week: 'H37', fullWeek: 'Hafta 37', allegro: 0, emag: 0, total: 0, allegroOrders: 0, emagOrders: 0, totalOrders: 0 },
    { week: 'H38', fullWeek: 'Hafta 38', allegro: 0, emag: 0, total: 0, allegroOrders: 0, emagOrders: 0, totalOrders: 0 },
    { week: 'H39', fullWeek: 'Hafta 39', allegro: 0, emag: 0, total: 0, allegroOrders: 0, emagOrders: 0, totalOrders: 0 },
    {
      week: 'H40',
      fullWeek: 'Hafta 40 (Canlı Güncel)',
      allegro: allegroConverted,
      emag: emagConverted,
      total: totalConverted,
      allegroOrders: allegroOrdersList.length,
      emagOrders: emagOrdersList.length,
      totalOrders: orders.length
    }
  ];

  const currentWeek = chartData[chartData.length - 1];
  const previousWeek = chartData[chartData.length - 2];

  const currentVal = metricMode === 'revenue' ? currentWeek.total : currentWeek.totalOrders;
  const prevVal = metricMode === 'revenue' ? previousWeek.total : previousWeek.totalOrders;
  const growthRate = prevVal > 0 ? Math.round(((currentVal - prevVal) / prevVal) * 100) : (currentVal > 0 ? 100 : 0);

  const allegroShare = currentWeek.total > 0
    ? Math.round(
        metricMode === 'revenue'
          ? (currentWeek.allegro / currentWeek.total) * 100
          : (currentWeek.allegroOrders / (currentWeek.totalOrders || 1)) * 100
      )
    : 0;

  const emagShare = currentWeek.total > 0 ? 100 - allegroShare : 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = chartData.find(d => d.week === label);
      return (
        <div className={`backdrop-blur-md p-3 rounded-2xl shadow-xl border text-xs min-w-[200px] space-y-2 ${
          isDark ? 'bg-[#151D2A]/95 border-slate-700 text-[#F8FAFC]' : 'bg-white/95 border-slate-200 text-[#14171A]'
        }`}>
          <div className={`font-bold border-b pb-1.5 flex items-center justify-between ${
            isDark ? 'border-slate-700 text-[#F8FAFC]' : 'border-slate-100 text-[#14171A]'
          }`}>
            <span className="text-[11px]">{dataPoint?.fullWeek || label}</span>
            <span className="font-mono font-bold text-[#9FE870]">
              {metricMode === 'revenue'
                ? `${dataPoint?.total.toLocaleString('tr-TR')} ${currencySymbol}`
                : `${dataPoint?.totalOrders} Sipariş`}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#FF5A00] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FF5A00]" />
                Allegro:
              </span>
              <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-[#14171A]'}`}>
                {metricMode === 'revenue'
                  ? `${dataPoint?.allegro.toLocaleString('tr-TR')} ${currencySymbol}`
                  : `${dataPoint?.allegroOrders} sip.`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#38BDF8] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                eMAG:
              </span>
              <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-[#14171A]'}`}>
                {metricMode === 'revenue'
                  ? `${dataPoint?.emag.toLocaleString('tr-TR')} ${currencySymbol}`
                  : `${dataPoint?.emagOrders} sip.`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-2xs space-y-5">
      {/* Header with Title and Mode Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#14171A] tracking-tight">
              Haftalık Satış & Kanal Analizi
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9FE870]/30 text-[#163300] flex items-center gap-1">
              <span>{activeCurrency} ({currencySymbol})</span>
            </span>
          </div>
          <p className="text-[11px] text-[#5D7079]">
            Allegro ve eMAG pazaryerlerinin haftalık satış ve sipariş akışı
          </p>
        </div>

        {/* Metric Switcher: Ciro vs Sipariş */}
        <div className="flex items-center gap-1 bg-[#F4F5F7] p-1 rounded-full self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('revenue')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              metricMode === 'revenue'
                ? 'bg-[#14171A] text-white shadow-2xs'
                : 'text-[#5D7079] hover:text-[#14171A]'
            }`}
          >
            Ciro ({currencySymbol})
          </button>
          <button
            onClick={() => setMetricMode('orders')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              metricMode === 'orders'
                ? 'bg-[#14171A] text-white shadow-2xs'
                : 'text-[#5D7079] hover:text-[#14171A]'
            }`}
          >
            Sipariş
          </button>
        </div>
      </div>

      {/* Soft Modern KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Metric Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F8F9] border border-slate-200/70 space-y-1">
          <div className="text-[11px] font-medium text-[#7D8F99]">Son Hafta Toplamı</div>
          <div className="text-lg sm:text-xl font-black text-[#14171A] font-mono tracking-tight">
            {metricMode === 'revenue'
              ? `${currentWeek.total.toLocaleString('tr-TR')} ${currencySymbol}`
              : `${currentWeek.totalOrders} Sipariş`}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+%{growthRate} haftalık artış</span>
          </div>
        </div>

        {/* Allegro Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF6F0] border border-[#FF5A00]/20 space-y-1">
          <div className="text-[11px] font-medium text-[#FF5A00] flex items-center justify-between">
            <span>Allegro Marketplace</span>
            <span className="text-[10px] font-bold">%{allegroShare}</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#FF5A00] font-mono tracking-tight">
            {metricMode === 'revenue'
              ? `${currentWeek.allegro.toLocaleString('tr-TR')} ${currencySymbol}`
              : `${currentWeek.allegroOrders} Sipariş`}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Polonya, Çekya, Slovakya
          </div>
        </div>

        {/* eMAG Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F0F6FF] border border-[#0056B3]/20 space-y-1">
          <div className="text-[11px] font-medium text-[#0056B3] flex items-center justify-between">
            <span>eMAG Marketplace</span>
            <span className="text-[10px] font-bold">%{emagShare}</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#0056B3] font-mono tracking-tight">
            {metricMode === 'revenue'
              ? `${currentWeek.emag.toLocaleString('tr-TR')} ${currencySymbol}`
              : `${currentWeek.emagOrders} Sipariş`}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Romanya, Bulgaristan, Macaristan
          </div>
        </div>
      </div>

      {/* Channel Pill Filter Toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[10px] font-semibold text-[#7D8F99] shrink-0 mr-0.5">
          Filtrele:
        </span>
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelectedChannel(ch.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedChannel === ch.id
                ? 'bg-[#14171A] text-white shadow-2xs'
                : 'bg-[#F4F5F7] text-[#5D7079] hover:text-[#14171A]'
            }`}
          >
            {ch.id !== 'all' && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: ch.color }}
              />
            )}
            <span>{ch.label}</span>
          </button>
        ))}
      </div>

      {/* Recharts Area Visualization (Mobile-safe viewport margins) */}
      <div className="w-full h-56 sm:h-72 pt-1 -ml-2 sm:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAllegro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF5A00" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FF5A00" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorEmag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0056B3" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0056B3" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#243044' : '#F1F5F9'} />
            <XAxis
              dataKey="week"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#243044' : '#F1F5F9' }}
            />
            <YAxis
              width={42}
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) =>
                metricMode === 'revenue'
                  ? `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                  : `${val}`
              }
            />
            <Tooltip content={<CustomTooltip />} />

            {(selectedChannel === 'all' || selectedChannel === 'allegro') && (
              <Area
                type="monotone"
                dataKey={metricMode === 'revenue' ? 'allegro' : 'allegroOrders'}
                name="Allegro"
                stroke="#FF5A00"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#colorAllegro)"
                activeDot={{ r: 5, fill: '#FF5A00', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'emag') && (
              <Area
                type="monotone"
                dataKey={metricMode === 'revenue' ? 'emag' : 'emagOrders'}
                name="eMAG"
                stroke="#0056B3"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#colorEmag)"
                activeDot={{ r: 5, fill: '#0056B3', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Channel Legend & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-[#5D7079]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#FF5A00]" />
            <span className="text-[#14171A]">Allegro</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#0056B3]" />
            <span className="text-[#14171A]">eMAG</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
          <CheckCircle2 className="w-3 h-3" />
          <span>TRY ₺ Canlı Kurlar</span>
        </div>
      </div>
    </div>
  );
};
