import { DailyReport, DailyMetrics } from '../types';

export function calculateDailyMetrics(report: DailyReport): DailyMetrics {
  const totalEggsPieces = (report.eggGoodPieces || 0) + (report.eggBrokenPieces || 0);
  const activeHens = Math.max(1, report.activeHens || 1);

  // Hen Day Production (%) = (Total telur / Populasi ayam) * 100
  const hdpPercent = (totalEggsPieces / activeHens) * 100;

  // Persentase telur rusak (%)
  const brokenRatePercent = totalEggsPieces > 0 ? ((report.eggBrokenPieces || 0) / totalEggsPieces) * 100 : 0;

  // Feed Intake (g/ekor/hari) = (Konsumsi pakan kg * 1000) / Populasi ayam
  const feedIntakeGram = ((report.feedConsumptionKg || 0) * 1000) / activeHens;

  // FCR = Konsumsi pakan kg / Total berat telur kg
  const eggWeightKg = report.eggWeightKg || 0;
  const fcr = eggWeightKg > 0 ? (report.feedConsumptionKg || 0) / eggWeightKg : 0;

  // Rata-rata bobot telur (g/butir)
  const averageEggWeightGram = totalEggsPieces > 0 ? (eggWeightKg * 1000) / totalEggsPieces : 0;

  // Keuangan
  const feedCost = (report.feedConsumptionKg || 0) * (report.feedPricePerKg || 0);
  const otherExpensesTotal = (report.otherExpenses || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalCost = feedCost + otherExpensesTotal;

  const estimatedRevenue = eggWeightKg * (report.eggSellingPricePerKg || 0);
  const netIncome = estimatedRevenue - totalCost;

  return {
    totalEggsPieces,
    hdpPercent,
    brokenRatePercent,
    feedIntakeGram,
    fcr,
    averageEggWeightGram,
    feedCost,
    otherExpensesTotal,
    totalCost,
    estimatedRevenue,
    netIncome,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
