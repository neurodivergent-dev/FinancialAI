import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkv-storage';
import { Asset, Liability, Receivable, StrategicInstallment } from '../types';

interface FinanceStore {
  assets: Asset[];
  liabilities: Liability[];
  receivables: Receivable[];
  installments: StrategicInstallment[];

  addAsset: (asset: Omit<Asset, 'id'>) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  addLiability: (liability: Omit<Liability, 'id'>) => void;
  removeLiability: (id: string) => void;
  updateLiability: (id: string, liability: Partial<Liability>) => void;
  addReceivable: (receivable: Omit<Receivable, 'id'>) => void;
  removeReceivable: (id: string) => void;
  updateReceivable: (id: string, receivable: Partial<Receivable>) => void;
  addInstallment: (installment: Omit<StrategicInstallment, 'id'>) => void;
  removeInstallment: (id: string) => void;
  updateInstallment: (id: string, installment: Partial<StrategicInstallment>) => void;

  getTotalAssets: () => number;
  getTotalLiabilities: () => number;
  getNetWorth: () => number;
  getSafeToSpend: () => number;
  clearAllData: () => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      assets: [],
      liabilities: [],
      receivables: [],
      installments: [],

      addAsset: (asset) => set((state) => ({
        assets: [...state.assets, { ...asset, id: Date.now().toString() }]
      })),
      removeAsset: (id) => set((state) => ({
        assets: state.assets.filter(asset => asset.id !== id)
      })),
      updateAsset: (id, updatedAsset) => set((state) => ({
        assets: state.assets.map(asset => asset.id === id ? { ...asset, ...updatedAsset } : asset)
      })),

      addLiability: (liability) => set((state) => ({
        liabilities: [...state.liabilities, { ...liability, id: Date.now().toString() }]
      })),
      removeLiability: (id) => set((state) => ({
        liabilities: state.liabilities.filter(liability => liability.id !== id)
      })),
      updateLiability: (id, updatedLiability) => set((state) => ({
        liabilities: state.liabilities.map(liability =>
          liability.id === id ? { ...liability, ...updatedLiability } : liability
        )
      })),

      addReceivable: (receivable) => set((state) => ({
        receivables: [...state.receivables, { ...receivable, id: Date.now().toString() }]
      })),
      removeReceivable: (id) => set((state) => ({
        receivables: state.receivables.filter(receivable => receivable.id !== id)
      })),
      updateReceivable: (id, updatedReceivable) => set((state) => ({
        receivables: state.receivables.map(receivable =>
          receivable.id === id ? { ...receivable, ...updatedReceivable } : receivable
        )
      })),

      addInstallment: (installment) => set((state) => ({
        installments: [...state.installments, { ...installment, id: Date.now().toString() }]
      })),
      removeInstallment: (id) => set((state) => ({
        installments: state.installments.filter(installment => installment.id !== id)
      })),
      updateInstallment: (id, updatedInstallment) => set((state) => ({
        installments: state.installments.map(installment =>
          installment.id === id ? { ...installment, ...updatedInstallment } : installment
        )
      })),

      getTotalAssets: () => {
        return get().assets.reduce((total, item) => total + (Number(item.value) || 0), 0);
      },
      getTotalLiabilities: () => {
        return get().liabilities.reduce((total, item) => total + (Number(item.currentDebt) || 0), 0);
      },
      getNetWorth: () => {
        const assets = get().getTotalAssets();
        const liabilities = get().getTotalLiabilities();
        const receivables = get().receivables.reduce((t, i) => t + (Number(i.amount) || 0), 0);
        return (assets + receivables) - liabilities;
      },
      getSafeToSpend: () => {
        const liquidAssets = get().assets
          .filter(a => a.type === 'liquid')
          .reduce((total, item) => total + (Number(item.value) || 0), 0);
        const totalAssets = get().getTotalAssets();
        const totalDebt = get().getTotalLiabilities();
        return totalAssets - totalDebt;
      },
      clearAllData: () => set({
        assets: [],
        liabilities: [],
        receivables: [],
        installments: []
      })
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);