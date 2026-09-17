import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Wheat, DollarSign, Calendar, BarChart3, HelpCircle } from 'lucide-react';
import { DailyReport } from '../types';
import { calculateDailyMetrics, formatRupiah, formatNumber, formatDateIndo } from '../utils/calculations';

interface ProductivityChartsProps {
  reports: DailyReport[];
}

type ChartTab = 'hdp' | 'feed_fcr' | 'finance';

export const ProductivityCharts: React.FC<ProductivityChartsProps> = ({ reports }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('hdp');
  const [rangeDays, setRangeDays] = useState<number>(14);

  // Filter & sort chronologically for charts (earliest to latest)
  const chartData = useMemo(() => {
    const sorted = [...reports].sort((a, b) => a.date.localeCompare(b.date));
    const sliced = rangeDays > 0 ? sorted.slice(-rangeDays) : sorted;

    return sliced.map((report) => {
      const metrics = calculateDailyMetrics(report);
      return {
        date: report.date,
        displayDate: formatDateIndo(report.date),
        shortDate: report.date.slice(5), // MM-DD
        activeHens: report.activeHens,
        eggGoodPieces: report.eggGoodPieces,
        eggBrokenPieces: report.eggBrokenPieces,
        totalEggs: metrics.totalEggsPieces,
        eggWeightKg: report.eggWeightKg,
        hdpPercent: Number(metrics.hdpPercent.toFixed(1)),
        feedKg: report.feedConsumptionKg,
        feedIntakeGram: Number(metrics.feedIntakeGram.toFixed(1)),
        fcr: Number(metrics.fcr.toFixed(2)),
        feedCost: metrics.feedCost,
        otherExpensesTotal: metrics.otherExpensesTotal,
        totalCost: metrics.totalCost,
        revenue: metrics.estimatedRevenue,
        netIncome: metrics.netIncome,
        notes: report.notes || '',
      };
    });
  }, [reports, rangeDays]);

  // Summary stats over selected period
  const periodStats = useMemo(() => {
    if (chartData.length === 0) return null;
    const totalEggs = chartData.reduce((s, d) => s + d.totalEggs, 0);
    const totalEggKg = chartData.reduce((s, d) => s + d.eggWeightKg, 0);
    const totalFeedKg = chartData.reduce((s, d) => s + d.feedKg, 0);
    const avgHdp = chartData.reduce((s, d) => s + d.hdpPercent, 0) / chartData.length;
    const avgFcr = totalEggKg > 0 ? totalFeedKg / totalEggKg : 0;
    const avgIntake = chartData.reduce((s, d) => s + d.feedIntakeGram, 0) / chartData.length;
    const totalCost = chartData.reduce((s, d) => s + d.totalCost, 0);
    const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
    const totalNet = totalRevenue - totalCost;

    return {
      days: chartData.length,
      totalEggs,
      totalEggKg,
      totalFeedKg,
      avgHdp,
      avgFcr,
      avgIntake,
      totalCost,
      totalRevenue,
      totalNet,
    };
  }, [chartData]);

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Grafik Produktivitas & Analisis Kandang
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Tren harian produksi telur, efisiensi pakan (FCR), dan performa biaya operasional.
          </p>
        </div>

        {/* Tab & Range Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Tabs */}
          <div className="inline-flex rounded-lg bg-stone-100 p-1 text-xs font-medium">
            <button
              type="button"
              id="tab-chart-hdp"
              onClick={() => setActiveTab('hdp')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hdp' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>HDP & Telur</span>
            </button>
            <button
              type="button"
              id="tab-chart-feed"
              onClick={() => setActiveTab('feed_fcr')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feed_fcr' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Wheat className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pakan & FCR</span>
            </button>
            <button
              type="button"
              id="tab-chart-finance"
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'finance' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>Biaya & Omzet</span>
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 text-xs bg-stone-50 border border-stone-200 rounded-lg p-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400 ml-1.5" />
            <select
              id="select-chart-range"
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="bg-transparent text-stone-700 font-medium py-1 px-1.5 rounded outline-hidden cursor-pointer"
            >
              <option value={7}>7 Hari</option>
              <option value={14}>14 Hari</option>
              <option value={30}>30 Hari</option>
              <option value={0}>Semua Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="p-4 sm:p-5">
        <div className="h-72 sm:h-80 w-full">
          {activeTab === 'hdp' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f0" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Butir Telur', angle: -90, position: 'insideLeft', fill: '#a8a29e', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[60, 100]}
                  tick={{ fontSize: 11, fill: '#d97706' }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                  label={{ value: 'HDP (%)', angle: 90, position: 'insideRight', fill: '#d97706', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white text-xs p-3 rounded-lg shadow-lg border border-stone-800 space-y-1">
                          <p className="font-bold text-amber-300">{data.displayDate}</p>
                          <div className="border-t border-stone-700 pt-1 space-y-0.5">
                            <p className="flex justify-between gap-4">
                              <span>HDP:</span>
                              <strong className="text-amber-400">{data.hdpPercent}%</strong>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span>Telur Utuh:</span>
                              <strong>{data.eggGoodPieces} butir</strong>
                            </p>
                            {data.eggBrokenPieces > 0 && (
                              <p className="flex justify-between gap-4 text-rose-300">
                                <span>Telur Retak/Rusak:</span>
                                <strong>{data.eggBrokenPieces} butir</strong>
                              </p>
                            )}
                            <p className="flex justify-between gap-4">
                              <span>Total Berat:</span>
                              <strong>{data.eggWeightKg} kg</strong>
                            </p>
                            <p className="flex justify-between gap-4 text-stone-400">
                              <span>Populasi Ayam:</span>
                              <span>{data.activeHens} ekor</span>
                            </p>
                            {data.notes && (
                              <p className="text-[11px] text-stone-300 italic pt-1 border-t border-stone-800">
                                &ldquo;{data.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceLine yAxisId="right" y={90} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target 90%', fill: '#10b981', fontSize: 10, position: 'right' }} />
                <Bar yAxisId="left" dataKey="eggGoodPieces" name="Telur Utuh (Butir)" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar yAxisId="left" dataKey="eggBrokenPieces" name="Telur Rusak (Butir)" fill="#f43f5e" stackId="a" radius={[3, 3, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="hdpPercent" name="HDP (%)" stroke="#b45309" strokeWidth={2.5} dot={{ r: 3, fill: '#b45309' }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'feed_fcr' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f0" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Pakan (Kg)', angle: -90, position: 'insideLeft', fill: '#059669', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[1.5, 3.0]}
                  tick={{ fontSize: 11, fill: '#4f46e5' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'FCR (Rasio)', angle: 90, position: 'insideRight', fill: '#4f46e5', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white text-xs p-3 rounded-lg shadow-lg border border-stone-800 space-y-1">
                          <p className="font-bold text-emerald-300">{data.displayDate}</p>
                          <div className="border-t border-stone-700 pt-1 space-y-0.5">
                            <p className="flex justify-between gap-4">
                              <span>Konsumsi Pakan:</span>
                              <strong className="text-emerald-400">{data.feedKg} kg</strong>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span>Intake/Ekor:</span>
                              <strong>{data.feedIntakeGram} gram</strong>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span>FCR:</span>
                              <strong className="text-indigo-300">{data.fcr}</strong>
                            </p>
                            <p className="flex justify-between gap-4 text-stone-400">
                              <span>Bobot Telur:</span>
                              <span>{data.eggWeightKg} kg</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceLine yAxisId="right" y={2.2} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Ambang FCR 2.2', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                <Bar yAxisId="left" dataKey="feedKg" name="Konsumsi Pakan (Kg)" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="fcr" name="FCR (Pakan / Kg Telur)" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3, fill: '#4f46e5' }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'finance' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f0" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toLocaleString('id-ID')}rb`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white text-xs p-3 rounded-lg shadow-lg border border-stone-800 space-y-1">
                          <p className="font-bold text-sky-300">{data.displayDate}</p>
                          <div className="border-t border-stone-700 pt-1 space-y-1">
                            <p className="flex justify-between gap-4 text-emerald-400 font-semibold">
                              <span>Omzet Telur:</span>
                              <span>{formatRupiah(data.revenue)}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-stone-300">
                              <span>Biaya Pakan:</span>
                              <span>{formatRupiah(data.feedCost)}</span>
                            </p>
                            {data.otherExpensesTotal > 0 && (
                              <p className="flex justify-between gap-4 text-rose-300">
                                <span>Biaya Lain-lain:</span>
                                <span>{formatRupiah(data.otherExpensesTotal)}</span>
                              </p>
                            )}
                            <p className="flex justify-between gap-4 text-stone-200 border-t border-stone-800 pt-0.5">
                              <span>Total Biaya:</span>
                              <strong>{formatRupiah(data.totalCost)}</strong>
                            </p>
                            <p className={`flex justify-between gap-4 font-bold ${data.netIncome >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                              <span>Laba Bersih:</span>
                              <span>{formatRupiah(data.netIncome)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="feedCost" name="Biaya Pakan (Rp)" fill="#0d9488" stackId="cost" />
                <Bar dataKey="otherExpensesTotal" name="Pengeluaran Lain-lain (Rp)" fill="#f97316" stackId="cost" />
                <Line type="monotone" dataKey="revenue" name="Estimasi Omzet Telur (Rp)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Average Summary Row for the selected period */}
        {periodStats && (
          <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs bg-stone-50/70 p-3 rounded-lg">
            <div>
              <span className="text-stone-500 block">Rata-rata HDP:</span>
              <strong className="text-stone-800 text-sm font-bold">{formatNumber(periodStats.avgHdp, 1)}%</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Rata-rata FCR:</span>
              <strong className="text-stone-800 text-sm font-bold">{formatNumber(periodStats.avgFcr, 2)}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Rata-rata Intake:</span>
              <strong className="text-stone-800 text-sm font-bold">{formatNumber(periodStats.avgIntake, 1)} g/ekor</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Total Produksi ({periodStats.days} hari):</span>
              <strong className="text-stone-800 text-sm font-bold">
                {periodStats.totalEggs.toLocaleString('id-ID')} btr ({formatNumber(periodStats.totalEggKg, 1)} kg)
              </strong>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-stone-500 block">Total Estimasi Laba:</span>
              <strong className={`text-sm font-bold ${periodStats.totalNet >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {formatRupiah(periodStats.totalNet)}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
