import { DailyReport, FarmSettings } from '../types';

// Initial report generator and CSV export utilities (all data persistence is powered by Firebase Firestore)

export const DEFAULT_FARM_SETTINGS: FarmSettings = {
  farmName: 'FARM HAPPY EGGS',
  flockName: 'Kandang A (Lohmann Brown)',
  chickenAgeWeeks: 38,
  initialPopulation: 1500,
  defaultFeedPricePerKg: 8300,
  defaultEggPricePerKg: 27000,
  defaultFeedType: 'Konsentrat Layer + Jagung + Dedak',
};

// Generate 14 days of realistic sample data
export function generateInitialReports(): DailyReport[] {
  const reports: DailyReport[] = [];
  const baseHens = 1500;
  let currentPopulation = baseHens;

  // Generate 14 consecutive days ending today
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // occasional 0 or 1 mortality
    const dead = i === 10 ? 1 : i === 4 ? 2 : i === 1 ? 1 : 0;
    const culled = i === 7 ? 2 : 0;
    currentPopulation = currentPopulation - dead - culled;

    // Realistic HDP ~ 89% - 93%
    const hdpVariation = Math.sin(i * 0.7) * 2.2 + (Math.random() * 1.5 - 0.75);
    const hdp = Math.min(94, Math.max(86, 90.5 + hdpVariation));
    const totalEggs = Math.round((currentPopulation * hdp) / 100);
    const broken = Math.round(totalEggs * (0.015 + Math.random() * 0.01)); // 1.5% - 2.5% broken
    const good = totalEggs - broken;

    // Average egg weight ~ 61-63 gram
    const avgWeight = 0.0615 + (Math.random() * 0.002 - 0.001);
    const totalWeightKg = Number((totalEggs * avgWeight).toFixed(1));

    // Feed intake ~ 114 - 118 gram/hen/day
    const feedPerHenGram = 114 + Math.round(Math.random() * 3);
    const feedConsumptionKg = Number(((currentPopulation * feedPerHenGram) / 1000).toFixed(1));

    // Other expenses on some days
    const otherExpenses = [];
    if (i === 12) {
      otherExpenses.push({
        id: `exp-${dateStr}-1`,
        category: 'Obat & Vitamin' as const,
        description: 'Vitamin Vita Stress & Egg Stimulant',
        amount: 145000,
      });
    } else if (i === 8) {
      otherExpenses.push({
        id: `exp-${dateStr}-1`,
        category: 'Sekam & Sanitasi' as const,
        description: 'Beli sekam baru 1 pickup & desinfektan kandang',
        amount: 220000,
      });
    } else if (i === 6) {
      otherExpenses.push({
        id: `exp-${dateStr}-1`,
        category: 'Listrik & Air' as const,
        description: 'Token listrik pompa air kandang',
        amount: 100000,
      });
    } else if (i === 3) {
      otherExpenses.push({
        id: `exp-${dateStr}-1`,
        category: 'Perawatan & Perbaikan' as const,
        description: 'Ganti selang nipple minum & kawat sekat kandang',
        amount: 85000,
      });
    } else if (i === 0) {
      otherExpenses.push({
        id: `exp-${dateStr}-1`,
        category: 'Obat & Vitamin' as const,
        description: 'Suplemen kalsium & mineral cangkang',
        amount: 90000,
      });
    }

    reports.push({
      id: `rep-${dateStr}`,
      date: dateStr,
      flockName: 'Kandang A (Lohmann Brown)',
      activeHens: currentPopulation,
      deadHens: dead,
      culledHens: culled,
      eggGoodPieces: good,
      eggBrokenPieces: broken,
      eggWeightKg: totalWeightKg,
      feedConsumptionKg: feedConsumptionKg,
      feedType: 'Konsentrat Layer + Jagung + Dedak',
      feedPricePerKg: 8300,
      eggSellingPricePerKg: 27000,
      otherExpenses: otherExpenses,
      notes: i === 12 ? 'Pemberian vitamin anti-stress pasca cuaca terik.' : i === 0 ? 'Kondisi ayam lincah, produksi stabil.' : undefined,
      createdAt: new Date().toISOString(),
    });
  }

  return reports.sort((a, b) => b.date.localeCompare(a.date));
}


export function exportReportsToCSV(reports: DailyReport[]): void {
  const headers = [
    'Tanggal',
    'Populasi Ayam (Ekor)',
    'Kematian (Ekor)',
    'Afkir (Ekor)',
    'Telur Utuh (Butir)',
    'Telur Rusak (Butir)',
    'Total Telur (Butir)',
    'Total Berat (Kg)',
    'HDP (%)',
    'Konsumsi Pakan (Kg)',
    'Pakan per Ekor (Gram)',
    'FCR',
    'Biaya Pakan (Rp)',
    'Pengeluaran Lain (Rp)',
    'Total Biaya (Rp)',
    'Estimasi Penjualan Telur (Rp)',
    'Rincian Pengeluaran Lain',
    'Catatan',
  ];

  const rows = reports.map((r) => {
    const totalPieces = (r.eggGoodPieces || 0) + (r.eggBrokenPieces || 0);
    const pop = Math.max(1, r.activeHens || 1);
    const hdp = ((totalPieces / pop) * 100).toFixed(2);
    const intake = (((r.feedConsumptionKg || 0) * 1000) / pop).toFixed(1);
    const fcr = r.eggWeightKg > 0 ? ((r.feedConsumptionKg || 0) / r.eggWeightKg).toFixed(2) : '0';
    const feedCost = (r.feedConsumptionKg || 0) * (r.feedPricePerKg || 0);
    const otherCost = (r.otherExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    const totalCost = feedCost + otherCost;
    const revenue = (r.eggWeightKg || 0) * (r.eggSellingPricePerKg || 0);

    const expenseDetail = (r.otherExpenses || [])
      .map((e) => `${e.category}: ${e.description} (Rp ${e.amount})`)
      .join('; ');

    return [
      `"${r.date}"`,
      r.activeHens,
      r.deadHens || 0,
      r.culledHens || 0,
      r.eggGoodPieces || 0,
      r.eggBrokenPieces || 0,
      totalPieces,
      r.eggWeightKg || 0,
      hdp,
      r.feedConsumptionKg || 0,
      intake,
      fcr,
      feedCost,
      otherCost,
      totalCost,
      revenue,
      `"${expenseDetail.replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `laporan_kandang_ayam_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
