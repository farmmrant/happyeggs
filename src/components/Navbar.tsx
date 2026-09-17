import React from 'react';
import { Egg, Plus, Download, Settings, RefreshCw, Layers } from 'lucide-react';
import { FarmSettings } from '../types';

interface NavbarProps {
  settings: FarmSettings;
  activeHens: number;
  onOpenInputModal: () => void;
  onOpenSettingsModal: () => void;
  onExportCSV: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeHens,
  onOpenInputModal,
  onOpenSettingsModal,
  onExportCSV,
  onResetDemo,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Brand & Farm Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Egg className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  {settings.farmName || 'Kandang Ayam Petelur'}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Layer Farm
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
                <span className="flex items-center gap-1 font-medium text-stone-700">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  {settings.flockName || 'Kandang Utama'}
                </span>
                <span>•</span>
                <span>Umur: {settings.chickenAgeWeeks} Minggu</span>
                <span>•</span>
                <span>Populasi: <strong className="text-stone-800">{activeHens.toLocaleString('id-ID')}</strong> ekor</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              id="btn-export-csv"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              title="Ekspor laporan ke format CSV / Excel"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              id="btn-open-settings"
              onClick={onOpenSettingsModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              title="Pengaturan info kandang & harga"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>

            <button
              type="button"
              id="btn-reset-demo"
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Muat ulang data contoh 14 hari"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Data Demo</span>
            </button>

            <button
              type="button"
              id="btn-input-daily-report"
              onClick={onOpenInputModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Input Data Harian</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
