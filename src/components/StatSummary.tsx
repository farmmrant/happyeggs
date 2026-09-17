import React from 'react';
import { Egg, Wheat, TrendingUp, DollarSign, AlertCircle, Scale, ShieldAlert } from 'lucide-react';
import { DailyReport } from '../types';
import { calculateDailyMetrics, formatRupiah, formatNumber, formatDateIndo } from '../utils/calculations';

interface StatSummaryProps {
  latestReport: DailyReport | null;
  totalDaysRecorded: number;
}

export const StatSummary: React.FC<StatSummaryProps> = ({ latestReport, totalDaysRecorded }) => {
  if (!latestReport) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-900">
        <p className="font-semibold">Belum ada data laporan harian.</p>
        <p className="text-sm text-amber-700 mt-1">
          Klik tombol &quot;Input Data Harian&quot; untuk memasukkan catatan kandang pertama Anda.
        </p>
      </div>
    );
  }

  const metrics = calculateDailyMetrics(latestReport);
  const totalEggs = metrics.totalEggsPieces;

  // HDP status color & text
  let hdpBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let hdpStatus = 'Optimal';
  if (metrics.hdpPercent < 80) {
    hdpBadgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    hdpStatus = 'Perlu Evaluasi (<80%)';
  } else if (metrics.hdpPercent < 88) {
    hdpBadgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    hdpStatus = 'Cukup (80-88%)';
  } else {
    hdpBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    hdpStatus = 'Sangat Baik (≥88%)';
  }

  // FCR status
  let fcrStatusColor = 'text-emerald-700';
  if (metrics.fcr > 2.3) {
    fcrStatusColor = 'text-rose-600';
  } else if (metrics.fcr > 2.15) {
    fcrStatusColor = 'text-amber-600';
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm text-stone-500">
        <div>
          <span>Ringkasan Catatan Terakhir: </span>
          <strong className="text-stone-800 font-semibold">{formatDateIndo(latestReport.date)}</strong>
          <span className="text-xs text-stone-400 ml-2">({totalDaysRecorded} hari tersimpan)</span>
        </div>
        {(latestReport.deadHens > 0 || latestReport.culledHens > 0) && (
          <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 self-start sm:self-auto">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              Mortalitas: <strong>{latestReport.deadHens}</strong> ekor
              {latestReport.culledHens > 0 && ` • Afkir: ${latestReport.culledHens} ekor`}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. HDP Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">HDP (Produktivitas)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-stone-900">{formatNumber(metrics.hdpPercent, 1)}%</span>
          </div>
          <div className="mt-2 flex items-center">
            <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border ${hdpBadgeColor}`}>
              {hdpStatus}
            </span>
          </div>
        </div>

        {/* 2. Total Telur */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Produksi Telur</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Egg className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-stone-900">{totalEggs.toLocaleString('id-ID')}</span>
            <span className="text-xs text-stone-500 font-medium">butir</span>
          </div>
          <div className="mt-1.5 text-xs text-stone-600 flex items-center justify-between">
            <span>Bobot: <strong>{formatNumber(latestReport.eggWeightKg, 1)} kg</strong></span>
            {latestReport.eggBrokenPieces > 0 && (
              <span className="text-rose-600 text-[11px]">
                Rusak: {latestReport.eggBrokenPieces} btr ({formatNumber(metrics.brokenRatePercent, 1)}%)
              </span>
            )}
          </div>
        </div>

        {/* 3. Konsumsi Pakan */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Konsumsi Pakan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-stone-900">{formatNumber(latestReport.feedConsumptionKg, 1)}</span>
            <span className="text-xs text-stone-500 font-medium">kg</span>
          </div>
          <div className="mt-1.5 text-xs text-stone-600">
            Intake: <strong className="text-emerald-700">{formatNumber(metrics.feedIntakeGram, 1)} g</strong> /ekor/hari
          </div>
        </div>

        {/* 4. FCR */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">FCR (Rasio Pakan)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold ${fcrStatusColor}`}>{formatNumber(metrics.fcr, 2)}</span>
          </div>
          <div className="mt-1.5 text-xs text-stone-500">
            Target ideal: <strong>2.0 - 2.2</strong>
          </div>
        </div>

        {/* 5. Total Pengeluaran */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Biaya Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-stone-900">{formatRupiah(metrics.totalCost)}</span>
          </div>
          <div className="mt-1.5 text-[11px] text-stone-500 flex justify-between">
            <span>Pakan: {formatRupiah(metrics.feedCost)}</span>
            {metrics.otherExpensesTotal > 0 && (
              <span className="text-rose-600 font-medium">+{formatRupiah(metrics.otherExpensesTotal)}</span>
            )}
          </div>
        </div>

        {/* 6. Estimasi Laba Bersih */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estimasi Laba Harian</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metrics.netIncome >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`text-lg sm:text-xl font-bold ${metrics.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatRupiah(metrics.netIncome)}
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-stone-500">
            Omzet: <strong>{formatRupiah(metrics.estimatedRevenue)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
