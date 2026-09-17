import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  AlertTriangle,
  FileText,
  DollarSign,
  Egg,
  Filter,
  X,
} from 'lucide-react';
import { DailyReport } from '../types';
import { calculateDailyMetrics, formatRupiah, formatNumber, formatDateIndo } from '../utils/calculations';

interface DailyLogTableProps {
  reports: DailyReport[];
  onEdit: (report: DailyReport) => void;
  onDelete: (reportId: string) => void;
}

export const DailyLogTable: React.FC<DailyLogTableProps> = ({ reports, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyReport | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.date.includes(searchTerm) ||
        (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.otherExpenses &&
          r.otherExpenses.some(
            (e) =>
              e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.category.toLowerCase().includes(searchTerm.toLowerCase())
          ));
      return matchSearch;
    });
  }, [reports, searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Gagal menghapus laporan:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Riwayat Catatan Harian Kandang
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Daftar lengkap rekaman data produksi telur, pakan, mortalitas, dan pengeluaran harian.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-reports"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tanggal, obat, catatan..."
            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 text-center w-24">Aksi</th>
              <th className="py-3 px-3.5">Tanggal</th>
              <th className="py-3 px-3">Populasi</th>
              <th className="py-3 px-3">Telur (Butir / Kg)</th>
              <th className="py-3 px-3 text-center">HDP (%)</th>
              <th className="py-3 px-3">Pakan (Kg / Intake)</th>
              <th className="py-3 px-3 text-center">FCR</th>
              <th className="py-3 px-3">Pengeluaran Lain</th>
              <th className="py-3 px-3 text-right">Total Biaya</th>
              <th className="py-3 px-3 text-right">Omzet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-stone-400">
                  <Egg className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="font-medium text-stone-600">Tidak ada catatan ditemukan</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {searchTerm ? 'Coba ubah kata kunci pencarian.' : 'Belum ada data laporan harian.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const metrics = calculateDailyMetrics(report);
                const isExpanded = expandedId === report.id;
                const hasDetails =
                  (report.otherExpenses && report.otherExpenses.length > 0) ||
                  report.notes ||
                  report.deadHens > 0 ||
                  report.culledHens > 0;

                return (
                  <React.Fragment key={report.id}>
                    <tr
                      className={`hover:bg-stone-50/70 transition-colors ${
                        isExpanded ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {hasDetails && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(report.id)}
                              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                              title="Lihat rincian pengeluaran & catatan"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onEdit(report)}
                            className="p-1 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Edit data laporan ini"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(report)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus data laporan ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-stone-900">{formatDateIndo(report.date)}</div>
                        <div className="text-[10px] text-stone-400">{report.date}</div>
                      </td>

                      {/* Populasi */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-stone-800">
                          {report.activeHens.toLocaleString('id-ID')}
                        </span>
                        {(report.deadHens > 0 || report.culledHens > 0) && (
                          <div className="text-[10px] text-rose-600 font-medium">
                            {report.deadHens > 0 && `Mati: -${report.deadHens}`}
                            {report.culledHens > 0 && ` Afkir: -${report.culledHens}`}
                          </div>
                        )}
                      </td>

                      {/* Telur */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-stone-900">
                          {metrics.totalEggsPieces.toLocaleString('id-ID')}{' '}
                          <span className="font-normal text-stone-500 text-[11px]">btr</span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {formatNumber(report.eggWeightKg, 1)} kg
                          {report.eggBrokenPieces > 0 && (
                            <span className="text-rose-500 ml-1">({report.eggBrokenPieces} rsk)</span>
                          )}
                        </div>
                      </td>

                      {/* HDP */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            metrics.hdpPercent >= 88
                              ? 'bg-emerald-100 text-emerald-800'
                              : metrics.hdpPercent >= 80
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {formatNumber(metrics.hdpPercent, 1)}%
                        </span>
                      </td>

                      {/* Pakan */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-stone-800">
                          {formatNumber(report.feedConsumptionKg, 1)} kg
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {formatNumber(metrics.feedIntakeGram, 0)} g/ekor
                        </div>
                      </td>

                      {/* FCR */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-stone-800">
                        <span
                          className={
                            metrics.fcr > 2.3
                              ? 'text-rose-600'
                              : metrics.fcr > 2.15
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {formatNumber(metrics.fcr, 2)}
                        </span>
                      </td>

                      {/* Pengeluaran Lain-lain */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {metrics.otherExpensesTotal > 0 ? (
                          <div>
                            <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                              <DollarSign className="w-3 h-3" />
                              {formatRupiah(metrics.otherExpensesTotal)}
                            </span>
                            <div className="text-[10px] text-stone-400">
                              {report.otherExpenses.length} pos biaya
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>

                      {/* Total Biaya */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-medium text-stone-900">
                        {formatRupiah(metrics.totalCost)}
                      </td>

                      {/* Omzet */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="font-semibold text-emerald-700">
                          {formatRupiah(metrics.estimatedRevenue)}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="bg-stone-50/90 border-b border-stone-200">
                        <td colSpan={10} className="px-5 py-3.5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Rincian Pengeluaran Lain-lain */}
                            <div>
                              <span className="font-bold text-stone-700 block mb-1.5 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                                Rincian Pengeluaran Lain-lain:
                              </span>
                              {report.otherExpenses && report.otherExpenses.length > 0 ? (
                                <ul className="space-y-1 bg-white p-2.5 rounded-lg border border-stone-200">
                                  {report.otherExpenses.map((exp, i) => (
                                    <li
                                      key={exp.id || i}
                                      className="flex justify-between items-center py-0.5 text-stone-700"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.5 bg-stone-100 text-stone-700 text-[10px] rounded font-medium">
                                          {exp.category}
                                        </span>
                                        <span>{exp.description || 'Pengeluaran operasional'}</span>
                                      </span>
                                      <strong className="text-stone-900">{formatRupiah(exp.amount)}</strong>
                                    </li>
                                  ))}
                                  <li className="pt-1.5 border-t border-stone-100 flex justify-between font-bold text-stone-900">
                                    <span>Total Pengeluaran Lain:</span>
                                    <span className="text-rose-700">{formatRupiah(metrics.otherExpensesTotal)}</span>
                                  </li>
                                </ul>
                              ) : (
                                <p className="text-stone-400 italic">Tidak ada pengeluaran lain hari ini.</p>
                              )}
                            </div>

                            {/* Info Pakan, Catatan & Mortalitas */}
                            <div className="space-y-2">
                              <div>
                                <span className="font-bold text-stone-700 block mb-1">Informasi Pakan:</span>
                                <div className="bg-white p-2 rounded-lg border border-stone-200 text-stone-700 space-y-0.5">
                                  <p>
                                    Komposisi: <strong>{report.feedType}</strong>
                                  </p>
                                  <p>
                                    Harga Pakan: <strong>{formatRupiah(report.feedPricePerKg)} / kg</strong> • Biaya: <strong>{formatRupiah(metrics.feedCost)}</strong>
                                  </p>
                                </div>
                              </div>

                              {report.notes && (
                                <div>
                                  <span className="font-bold text-stone-700 block mb-1">Catatan Khusus:</span>
                                  <p className="bg-white p-2 rounded-lg border border-stone-200 text-stone-700 italic">
                                    &ldquo;{report.notes}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-stone-50 border-t border-stone-100 text-xs text-stone-500 flex justify-between items-center">
        <span>Menampilkan {filteredReports.length} laporan</span>
        <span>Kandang Ayam Petelur Modern</span>
      </div>

      {/* In-App Delete Confirmation Modal (Bypasses sandboxed iframe restrictions) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Hapus Laporan Harian</h3>
                  <p className="text-[11px] text-stone-500">Konfirmasi penghapusan data dari Firestore</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Apakah Anda yakin ingin menghapus rekaman data laporan tanggal{' '}
              <strong className="text-stone-900">{formatDateIndo(deleteTarget.date)}</strong>?
              Data ini akan dihapus secara permanen dari database Firebase Firestore.
            </p>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 mb-5 text-xs text-stone-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Tanggal:</span>
                <span className="font-semibold text-stone-800">{formatDateIndo(deleteTarget.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Populasi:</span>
                <span className="font-semibold text-stone-800">{formatNumber(deleteTarget.activeHens)} ekor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Produksi Telur:</span>
                <span className="font-semibold text-stone-800">
                  {formatNumber(deleteTarget.eggGoodPieces + deleteTarget.eggBrokenPieces)} butir ({formatNumber(deleteTarget.eggWeightKg)} kg)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
