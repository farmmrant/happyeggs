import React, { useState } from 'react';
import { X, Settings, CheckCircle2 } from 'lucide-react';
import { FarmSettings } from '../types';

interface FarmSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FarmSettings;
  onSave: (newSettings: FarmSettings) => void;
}

export const FarmSettingsModal: React.FC<FarmSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [farmName, setFarmName] = useState(settings.farmName);
  const [flockName, setFlockName] = useState(settings.flockName);
  const [chickenAgeWeeks, setChickenAgeWeeks] = useState(settings.chickenAgeWeeks);
  const [initialPopulation, setInitialPopulation] = useState(settings.initialPopulation);
  const [defaultFeedPricePerKg, setDefaultFeedPricePerKg] = useState(settings.defaultFeedPricePerKg);
  const [defaultEggPricePerKg, setDefaultEggPricePerKg] = useState(settings.defaultEggPricePerKg);
  const [defaultFeedType, setDefaultFeedType] = useState(settings.defaultFeedType);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      farmName: farmName.trim() || 'Kandang Ayam Petelur',
      flockName: flockName.trim() || 'Kandang Utama',
      chickenAgeWeeks: Math.max(1, Number(chickenAgeWeeks) || 30),
      initialPopulation: Math.max(1, Number(initialPopulation) || 1000),
      defaultFeedPricePerKg: Math.max(0, Number(defaultFeedPricePerKg) || 8200),
      defaultEggPricePerKg: Math.max(0, Number(defaultEggPricePerKg) || 27000),
      defaultFeedType: defaultFeedType.trim() || 'Pakan Layer',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">Pengaturan Profil Kandang</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nama Peternakan / Farm</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="Contoh: FARM HAPPY EGGS"
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Blok / Kandang</label>
              <input
                type="text"
                value={flockName}
                onChange={(e) => setFlockName(e.target.value)}
                placeholder="Contoh: Kandang A (Lohmann)"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Umur Ayam (Minggu)</label>
              <input
                type="number"
                min="1"
                value={chickenAgeWeeks}
                onChange={(e) => setChickenAgeWeeks(parseInt(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Standar Jenis / Komposisi Pakan</label>
            <input
              type="text"
              value={defaultFeedType}
              onChange={(e) => setDefaultFeedType(e.target.value)}
              placeholder="Contoh: Konsentrat Layer + Jagung + Dedak"
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Standar Harga Pakan (Rp/Kg)</label>
              <input
                type="number"
                step="100"
                value={defaultFeedPricePerKg}
                onChange={(e) => setDefaultFeedPricePerKg(parseInt(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Standar Harga Jual Telur (Rp/Kg)</label>
              <input
                type="number"
                step="500"
                value={defaultEggPricePerKg}
                onChange={(e) => setDefaultEggPricePerKg(parseInt(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
