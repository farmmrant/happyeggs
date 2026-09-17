import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatSummary } from './components/StatSummary';
import { ProductivityCharts } from './components/ProductivityCharts';
import { DailyLogTable } from './components/DailyLogTable';
import { DailyInputModal } from './components/DailyInputModal';
import { FarmSettingsModal } from './components/FarmSettingsModal';
import { DailyReport, FarmSettings } from './types';
import { DEFAULT_FARM_SETTINGS, exportReportsToCSV } from './utils/storage';
import {
  subscribeDailyReports,
  subscribeFarmSettings,
  saveDailyReportToFirestore,
  deleteDailyReportFromFirestore,
  saveFarmSettingsToFirestore,
  resetDemoReportsInFirestore,
} from './services/firestoreService';
import { testFirebaseConnection } from './lib/firebase';
import { Plus, Egg, RotateCcw, X } from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [settings, setSettings] = useState<FarmSettings>(DEFAULT_FARM_SETTINGS);
  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize real-time listeners for Firestore
  useEffect(() => {
    // Validate connection to Firestore on boot
    testFirebaseConnection();

    // Subscribe to live reports updates
    const unsubReports = subscribeDailyReports(
      (updatedReports) => {
        setReports(updatedReports);
        setIsLoaded(true);
      },
      (error) => {
        console.error('Error listening to Firestore reports:', error);
        setIsLoaded(true);
      }
    );

    // Subscribe to live settings updates
    const unsubSettings = subscribeFarmSettings(
      (updatedSettings) => {
        setSettings(updatedSettings);
      },
      (error) => {
        console.error('Error listening to Firestore settings:', error);
      }
    );

    return () => {
      unsubReports();
      unsubSettings();
    };
  }, []);

  const handleSaveReport = async (report: DailyReport) => {
    try {
      await saveDailyReportToFirestore(report);
      setIsInputModalOpen(false);
      setEditingReport(null);
    } catch (err) {
      console.error('Gagal menyimpan laporan ke Firebase:', err);
      alert('Gagal menyimpan laporan ke database Firebase. Silakan periksa koneksi internet.');
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      // Optimistic update so UI reflects immediately
      setReports((prev) => prev.filter((r) => r.id !== id));
      await deleteDailyReportFromFirestore(id);
    } catch (err) {
      console.error('Gagal menghapus laporan dari Firebase:', err);
      throw err;
    }
  };

  const handleEditReport = (report: DailyReport) => {
    setEditingReport(report);
    setIsInputModalOpen(true);
  };

  const handleOpenNewReport = () => {
    setEditingReport(null);
    setIsInputModalOpen(true);
  };

  const handleConfirmResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoReportsInFirestore();
      setIsResetConfirmOpen(false);
    } catch (err) {
      console.error('Gagal memuat ulang data demo ke Firebase:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveSettings = async (newSettings: FarmSettings) => {
    try {
      await saveFarmSettingsToFirestore(newSettings);
      setIsSettingsModalOpen(false);
    } catch (err) {
      console.error('Gagal menyimpan pengaturan ke Firebase:', err);
    }
  };

  const latestReport = reports.length > 0 ? reports[0] : null;
  const activeHens = latestReport ? latestReport.activeHens : settings.initialPopulation;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-600">
        <div className="flex items-center gap-2">
          <Egg className="w-6 h-6 text-amber-500 animate-bounce" />
          <span className="font-semibold text-sm">Menghubungkan ke database Firebase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        settings={settings}
        activeHens={activeHens}
        onOpenInputModal={handleOpenNewReport}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onExportCSV={() => exportReportsToCSV(reports)}
        onResetDemo={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        {/* KPI Cards */}
        <StatSummary latestReport={latestReport} totalDaysRecorded={reports.length} />

        {/* Productivity Charts */}
        <ProductivityCharts reports={reports} />

        {/* Daily Log Table */}
        <DailyLogTable
          reports={reports}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
        />
      </main>

      {/* Floating Action Button for mobile devices */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          type="button"
          id="btn-mobile-input"
          onClick={handleOpenNewReport}
          className="w-13 h-13 rounded-full bg-amber-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Input Laporan Baru"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-400">
          Laporan Harian Kandang Ayam Petelur &bull; Database Cloud Firebase Firestore (Real-Time Sync)
        </div>
      </footer>

      {/* Modals */}
      <DailyInputModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
        initialReport={editingReport}
        settings={settings}
        latestActiveHens={activeHens}
      />

      <FarmSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Reset Demo Data Modal (in-app dialog) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Muat Ulang Data Contoh?</h3>
                  <p className="text-[11px] text-stone-500">Reset database demo ke Firebase Firestore</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetConfirmOpen(false)}
                className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              Tindakan ini akan menggantikan data laporan yang ada di database Firebase dengan 14 hari rekaman simulasi kandang ayam petelur baru.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmResetDemo}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'Memuat Ulang...' : 'Ya, Muat Ulang Demo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
