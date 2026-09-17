import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Egg,
  Wheat,
  DollarSign,
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { DailyReport, ExpenseItem, ExpenseCategory, FarmSettings } from '../types';
import { formatRupiah, formatNumber, getTodayDateString } from '../utils/calculations';

interface DailyInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: DailyReport) => void;
  initialReport?: DailyReport | null;
  settings: FarmSettings;
  latestActiveHens: number;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Obat & Vitamin',
  'Listrik & Air',
  'Sekam & Sanitasi',
  'Tenaga Kerja',
  'Perawatan & Perbaikan',
  'Lain-lain',
];

export const DailyInputModal: React.FC<DailyInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReport,
  settings,
  latestActiveHens,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [activeHens, setActiveHens] = useState<number>(latestActiveHens || settings.initialPopulation || 1500);
  const [deadHens, setDeadHens] = useState<number>(0);
  const [culledHens, setCulledHens] = useState<number>(0);

  // Egg fields
  const [eggGoodPieces, setEggGoodPieces] = useState<number>(0);
  const [eggBrokenPieces, setEggBrokenPieces] = useState<number>(0);
  const [eggWeightKg, setEggWeightKg] = useState<number>(0);

  // Feed fields
  const [feedConsumptionKg, setFeedConsumptionKg] = useState<number>(0);
  const [feedType, setFeedType] = useState<string>(settings.defaultFeedType || 'Pakan Campuran');
  const [feedPricePerKg, setFeedPricePerKg] = useState<number>(settings.defaultFeedPricePerKg || 8300);

  // Egg selling price
  const [eggSellingPricePerKg, setEggSellingPricePerKg] = useState<number>(settings.defaultEggPricePerKg || 27000);

  // Other Expenses list
  const [otherExpenses, setOtherExpenses] = useState<ExpenseItem[]>([]);

  // Notes
  const [notes, setNotes] = useState<string>('');

  // Populate when editing or opening
  useEffect(() => {
    if (isOpen) {
      if (initialReport) {
        setDate(initialReport.date);
        setActiveHens(initialReport.activeHens);
        setDeadHens(initialReport.deadHens || 0);
        setCulledHens(initialReport.culledHens || 0);
        setEggGoodPieces(initialReport.eggGoodPieces || 0);
        setEggBrokenPieces(initialReport.eggBrokenPieces || 0);
        setEggWeightKg(initialReport.eggWeightKg || 0);
        setFeedConsumptionKg(initialReport.feedConsumptionKg || 0);
        setFeedType(initialReport.feedType || settings.defaultFeedType);
        setFeedPricePerKg(initialReport.feedPricePerKg || settings.defaultFeedPricePerKg);
        setEggSellingPricePerKg(initialReport.eggSellingPricePerKg || settings.defaultEggPricePerKg);
        setOtherExpenses(initialReport.otherExpenses ? [...initialReport.otherExpenses] : []);
        setNotes(initialReport.notes || '');
      } else {
        // Reset for new report
        setDate(getTodayDateString());
        setActiveHens(latestActiveHens > 0 ? latestActiveHens : settings.initialPopulation);
        setDeadHens(0);
        setCulledHens(0);
        // Sensible defaults based on standard flock performance
        const estEggs = Math.round(latestActiveHens * 0.9);
        const estBroken = Math.round(estEggs * 0.02);
        setEggGoodPieces(estEggs - estBroken);
        setEggBrokenPieces(estBroken);
        setEggWeightKg(Number((estEggs * 0.062).toFixed(1)));
        setFeedConsumptionKg(Number(((latestActiveHens * 115) / 1000).toFixed(1)));
        setFeedType(settings.defaultFeedType);
        setFeedPricePerKg(settings.defaultFeedPricePerKg);
        setEggSellingPricePerKg(settings.defaultEggPricePerKg);
        setOtherExpenses([]);
        setNotes('');
      }
    }
  }, [isOpen, initialReport, settings, latestActiveHens]);

  if (!isOpen) return null;

  // Real-time calculations
  const totalEggs = (Number(eggGoodPieces) || 0) + (Number(eggBrokenPieces) || 0);
  const currentPop = Math.max(1, (Number(activeHens) || 1) - (Number(deadHens) || 0) - (Number(culledHens) || 0));
  const hdpPercent = (totalEggs / currentPop) * 100;
  const feedIntakeGram = ((Number(feedConsumptionKg) || 0) * 1000) / currentPop;
  const fcr = Number(eggWeightKg) > 0 ? (Number(feedConsumptionKg) || 0) / Number(eggWeightKg) : 0;
  const avgEggGram = totalEggs > 0 ? ((Number(eggWeightKg) || 0) * 1000) / totalEggs : 0;

  // Financial preview
  const feedCost = (Number(feedConsumptionKg) || 0) * (Number(feedPricePerKg) || 0);
  const otherExpensesTotal = otherExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalCost = feedCost + otherExpensesTotal;
  const estimatedRevenue = (Number(eggWeightKg) || 0) * (Number(eggSellingPricePerKg) || 0);
  const estimatedNet = estimatedRevenue - totalCost;

  // Expense handlers
  const handleAddExpense = () => {
    setOtherExpenses((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: 'Obat & Vitamin',
        description: '',
        amount: 0,
      },
    ]);
  };

  const handleUpdateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setOtherExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveExpense = (id: string) => {
    setOtherExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert('Silakan pilih tanggal laporan.');
      return;
    }

    const report: DailyReport = {
      id: initialReport?.id || `rep-${date}-${Date.now()}`,
      date,
      flockName: settings.flockName,
      activeHens: currentPop,
      deadHens: Number(deadHens) || 0,
      culledHens: Number(culledHens) || 0,
      eggGoodPieces: Number(eggGoodPieces) || 0,
      eggBrokenPieces: Number(eggBrokenPieces) || 0,
      eggWeightKg: Number(eggWeightKg) || 0,
      feedConsumptionKg: Number(feedConsumptionKg) || 0,
      feedType: feedType.trim() || settings.defaultFeedType,
      feedPricePerKg: Number(feedPricePerKg) || 0,
      eggSellingPricePerKg: Number(eggSellingPricePerKg) || 0,
      otherExpenses: otherExpenses.filter((e) => (Number(e.amount) || 0) > 0 || e.description.trim() !== ''),
      notes: notes.trim(),
      createdAt: initialReport?.createdAt || new Date().toISOString(),
    };

    onSave(report);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {initialReport ? 'Edit Laporan Harian' : 'Input Data Laporan Harian'}
            </h3>
            <p className="text-xs text-stone-500">
              Pencatatan produksi telur, konsumsi pakan, kematian, dan pengeluaran operasional.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-6 flex-1 text-sm">
          {/* Section 1: Tanggal & Populasi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              1. Tanggal & Populasi Ayam
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  id="input-report-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Populasi Awal (Ekor)</label>
                <input
                  type="number"
                  id="input-active-hens"
                  min="1"
                  value={activeHens}
                  onChange={(e) => setActiveHens(Math.max(1, parseInt(e.target.value) || 0))}
                  required
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kematian (Ekor)</label>
                <input
                  type="number"
                  id="input-dead-hens"
                  min="0"
                  value={deadHens}
                  onChange={(e) => setDeadHens(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Afkir / Culling (Ekor)</label>
                <input
                  type="number"
                  id="input-culled-hens"
                  min="0"
                  value={culledHens}
                  onChange={(e) => setCulledHens(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="text-xs text-stone-500 flex items-center justify-between px-1">
              <span>Populasi aktif setelah kematian/afkir:</span>
              <strong className="text-stone-800 font-bold">{currentPop.toLocaleString('id-ID')} ekor</strong>
            </div>
          </div>

          {/* Section 2: Produksi Telur */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Egg className="w-4 h-4 text-amber-600" />
                2. Produksi Telur Harian
              </h4>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                HDP: {formatNumber(hdpPercent, 1)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Telur Utuh / Bagus (Butir)</label>
                <input
                  type="number"
                  id="input-egg-good"
                  min="0"
                  value={eggGoodPieces}
                  onChange={(e) => setEggGoodPieces(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  placeholder="Contoh: 1350"
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Telur Retak / Rusak (Butir)</label>
                <input
                  type="number"
                  id="input-egg-broken"
                  min="0"
                  value={eggBrokenPieces}
                  onChange={(e) => setEggBrokenPieces(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 20"
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Total Berat Telur (Kg)</label>
                <input
                  type="number"
                  id="input-egg-weight"
                  step="0.1"
                  min="0"
                  value={eggWeightKg}
                  onChange={(e) => setEggWeightKg(Math.max(0, parseFloat(e.target.value) || 0))}
                  required
                  placeholder="Contoh: 82.5"
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 px-1 gap-2 bg-stone-50 p-2 rounded-lg">
              <span>Total: <strong>{totalEggs.toLocaleString('id-ID')} butir</strong></span>
              <span>Bobot rata-rata: <strong>{formatNumber(avgEggGram, 1)} g/butir</strong></span>
              <span>
                Telur Rusak: <strong>{totalEggs > 0 ? formatNumber((eggBrokenPieces / totalEggs) * 100, 1) : 0}%</strong>
              </span>
            </div>
          </div>

          {/* Section 3: Konsumsi Pakan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-emerald-600" />
                3. Konsumsi Pakan
              </h4>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                FCR: {formatNumber(fcr, 2)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200/70">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Konsumsi Pakan Hari Ini (Kg)</label>
                <input
                  type="number"
                  id="input-feed-consumption"
                  step="0.1"
                  min="0"
                  value={feedConsumptionKg}
                  onChange={(e) => setFeedConsumptionKg(Math.max(0, parseFloat(e.target.value) || 0))}
                  required
                  placeholder="Contoh: 172.5"
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama / Komposisi Pakan</label>
                <input
                  type="text"
                  id="input-feed-type"
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  placeholder="Contoh: Konsentrat + Jagung"
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Harga Pakan (Rp / Kg)</label>
                <input
                  type="number"
                  id="input-feed-price"
                  min="0"
                  step="100"
                  value={feedPricePerKg}
                  onChange={(e) => setFeedPricePerKg(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 8300"
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 px-1 gap-2 bg-stone-50 p-2 rounded-lg">
              <span>Feed Intake: <strong className="text-emerald-700">{formatNumber(feedIntakeGram, 1)} g/ekor/hari</strong> (Standar: 110-120g)</span>
              <span>Biaya Pakan Hari Ini: <strong>{formatRupiah(feedCost)}</strong></span>
            </div>
          </div>

          {/* Section 4: Pengeluaran Lain-lain (Fitur Utama) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-rose-600" />
                4. Pengeluaran Lain-lain (Biaya Operasional Harian)
              </h4>
              <button
                type="button"
                id="btn-add-expense-item"
                onClick={handleAddExpense}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengeluaran</span>
              </button>
            </div>

            {otherExpenses.length === 0 ? (
              <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300 text-center text-xs text-stone-500">
                <p>Tidak ada pengeluaran lain hari ini.</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Klik &quot;Tambah Pengeluaran&quot; untuk mencatat biaya obat/vitamin, sekam, listrik, upah tenaga kerja, atau perbaikan kandang.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {otherExpenses.map((expense, idx) => (
                  <div
                    key={expense.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-stone-500 mb-0.5 sm:hidden">Kategori</label>
                      <select
                        value={expense.category}
                        onChange={(e) => handleUpdateExpense(expense.id, 'category', e.target.value as ExpenseCategory)}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-stone-500 mb-0.5 sm:hidden">Deskripsi / Keterangan</label>
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => handleUpdateExpense(expense.id, 'description', e.target.value)}
                        placeholder="Contoh: Vitamin Vita Stress 2 bungkus"
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-stone-500 mb-0.5 sm:hidden">Nominal (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={expense.amount || ''}
                        onChange={(e) => handleUpdateExpense(expense.id, 'amount', parseInt(e.target.value) || 0)}
                        placeholder="Rp 0"
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveExpense(expense.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus baris pengeluaran"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-right text-xs text-stone-600 pr-2 pt-1 font-semibold">
                  Subtotal Pengeluaran Lain: <span className="text-rose-700">{formatRupiah(otherExpensesTotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Harga Jual Telur & Catatan Harian */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-600" />
              5. Harga Jual Telur & Catatan Lapangan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Harga Telur Hari Ini (Rp / Kg)</label>
                <input
                  type="number"
                  id="input-egg-price"
                  min="0"
                  step="500"
                  value={eggSellingPricePerKg}
                  onChange={(e) => setEggSellingPricePerKg(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 27000"
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-stone-500 block mt-1">
                  Omzet: {formatRupiah(estimatedRevenue)}
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Catatan Khusus Kandang (Opsional)</label>
                <textarea
                  id="input-report-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Jadwal vaksinasi ND, cuaca mendung/hujan, perbaikan pipa minum..."
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Bottom Summary Preview Bar */}
          <div className="bg-stone-900 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-stone-400 block text-[11px]">HDP:</span>
                <span className="font-bold text-amber-400 text-sm">{formatNumber(hdpPercent, 1)}%</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">FCR:</span>
                <span className="font-bold text-indigo-300 text-sm">{formatNumber(fcr, 2)}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Total Biaya:</span>
                <span className="font-bold text-rose-300 text-sm">{formatRupiah(totalCost)}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Estimasi Omzet:</span>
                <span className="font-bold text-sky-300 text-sm">{formatRupiah(estimatedRevenue)}</span>
              </div>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Estimasi Laba Bersih:</span>
              <span className={`font-bold text-base ${estimatedNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatRupiah(estimatedNet)}
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-submit-daily-report"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all cursor-pointer hover:shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialReport ? 'Perbarui Laporan' : 'Simpan Laporan Harian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
