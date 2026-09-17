export type ExpenseCategory =
  | 'Obat & Vitamin'
  | 'Listrik & Air'
  | 'Sekam & Sanitasi'
  | 'Tenaga Kerja'
  | 'Perawatan & Perbaikan'
  | 'Lain-lain';

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
}

export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  flockName?: string;
  activeHens: number; // Populasi ayam hidup saat ini
  deadHens: number; // Kematian (mortalitas) hari ini
  culledHens: number; // Afkir hari ini
  eggGoodPieces: number; // Telur utuh/bagus (butir)
  eggBrokenPieces: number; // Telur retak/rusak (butir)
  eggWeightKg: number; // Total berat telur (kg)
  feedConsumptionKg: number; // Konsumsi pakan (kg)
  feedType: string; // Nama/jenis pakan
  feedPricePerKg: number; // Harga pakan per kg (Rp)
  eggSellingPricePerKg: number; // Harga jual telur per kg (Rp)
  otherExpenses: ExpenseItem[]; // Rincian pengeluaran lain-lain
  notes?: string; // Catatan kondisi kandang/cuaca/vaksin
  createdAt: string;
}

export interface FarmSettings {
  farmName: string;
  flockName: string;
  chickenAgeWeeks: number;
  initialPopulation: number;
  defaultFeedPricePerKg: number;
  defaultEggPricePerKg: number;
  defaultFeedType: string;
}

export interface DailyMetrics {
  totalEggsPieces: number;
  hdpPercent: number; // Hen Day Production (%)
  brokenRatePercent: number; // % Telur retak
  feedIntakeGram: number; // Gram per ekor per hari
  fcr: number; // Feed Conversion Ratio (kg pakan / kg telur)
  averageEggWeightGram: number; // Rata-rata bobot telur (gram/butir)
  feedCost: number; // Biaya pakan (Rp)
  otherExpensesTotal: number; // Total pengeluaran lain (Rp)
  totalCost: number; // Total biaya operasional (Rp)
  estimatedRevenue: number; // Estimasi omzet telur (Rp)
  netIncome: number; // Estimasi keuntungan bersih harian (Rp)
}
