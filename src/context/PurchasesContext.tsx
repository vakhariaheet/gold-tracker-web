import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { GoldPurchase, Purity, PortfolioStats, SortOption } from '../types';
import { useAuth } from './AuthContext';

interface PurchasesContextType {
  purchases: GoldPurchase[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  sortOption: SortOption;
  setSortOption: (opt: SortOption) => void;
  addPurchase: (data: Omit<GoldPurchase, 'id' | 'createdAt'>) => Promise<void>;
  updatePurchase: (id: number, data: Partial<GoldPurchase>) => Promise<void>;
  deletePurchase: (id: number) => Promise<void>;
  syncFromServer: () => Promise<void>;
  calculateStats: (ratePerGram: number) => PortfolioStats;
  getPurityFactor: (purity: Purity) => number;
}

const STORAGE_KEY = 'goldPurchases';

function loadLocal(): GoldPurchase[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocal(purchases: GoldPurchase[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
}

const PurchasesContext = createContext<PurchasesContextType | null>(null);

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [purchases, setPurchases] = useState<GoldPurchase[]>([]);
  const [isLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');

  const getPurityFactor = useCallback((purity: Purity): number => {
    switch (purity) {
      case '24k': return 1.0;
      case '22k': return 0.916;
      case '18k': return 0.75;
    }
  }, []);

  const applySort = useCallback((list: GoldPurchase[], opt: SortOption): GoldPurchase[] => {
    return [...list].sort((a, b) => {
      switch (opt) {
        case 'date_desc': return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        case 'date_asc': return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        case 'weight_desc': return b.weight - a.weight;
        case 'weight_asc': return a.weight - b.weight;
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setPurchases([]);
      return;
    }
    const local = loadLocal();
    if (local.length > 0) {
      setPurchases(applySort(local, sortOption));
    } else {
      syncFromServer();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setPurchases(prev => applySort(prev, sortOption));
  }, [sortOption]);

  const syncFromServer = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const data = await apiClient.get<any[]>('/api/purchases');
      const mapped: GoldPurchase[] = data.map((item, idx) => ({
        id: idx + 1,
        serverId: item._id || item.id,
        weight: item.weight,
        purchasePricePerGram: item.purchasePricePerGram,
        purchaseDate: item.purchaseDate,
        purity: item.purity,
        notes: item.notes,
        createdAt: item.createdAt,
      }));
      saveLocal(mapped);
      setPurchases(applySort(mapped, sortOption));
    } catch (err: any) {
      setError('Failed to sync from server');
    } finally {
      setIsSyncing(false);
    }
  }, [sortOption, applySort]);

  const addPurchase = useCallback(async (data: Omit<GoldPurchase, 'id' | 'createdAt'>) => {
    setError(null);
    const local = loadLocal();
    const newId = local.length > 0 ? Math.max(...local.map(p => p.id)) + 1 : 1;
    const newPurchase: GoldPurchase = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post<any>('/api/purchases', {
        weight: data.weight,
        purchasePricePerGram: data.purchasePricePerGram,
        purchaseDate: data.purchaseDate,
        purity: data.purity,
        notes: data.notes,
      });
      newPurchase.serverId = response._id || response.id;
    } catch {}

    const updated = [...local, newPurchase];
    saveLocal(updated);
    setPurchases(applySort(updated, sortOption));
  }, [sortOption, applySort]);

  const updatePurchase = useCallback(async (id: number, data: Partial<GoldPurchase>) => {
    setError(null);
    const local = loadLocal();
    const idx = local.findIndex(p => p.id === id);
    if (idx === -1) return;

    const updated = { ...local[idx], ...data };
    local[idx] = updated;

    try {
      if (updated.serverId) {
        await apiClient.put(`/api/purchases/${updated.serverId}`, {
          weight: updated.weight,
          purchasePricePerGram: updated.purchasePricePerGram,
          purchaseDate: updated.purchaseDate,
          purity: updated.purity,
          notes: updated.notes,
        });
      }
    } catch {}

    saveLocal(local);
    setPurchases(applySort(local, sortOption));
  }, [sortOption, applySort]);

  const deletePurchase = useCallback(async (id: number) => {
    setError(null);
    const local = loadLocal();
    const purchase = local.find(p => p.id === id);

    try {
      if (purchase?.serverId) {
        await apiClient.delete(`/api/purchases/${purchase.serverId}`);
      }
    } catch {}

    const updated = local.filter(p => p.id !== id);
    saveLocal(updated);
    setPurchases(applySort(updated, sortOption));
  }, [sortOption, applySort]);

  const calculateStats = useCallback((ratePerGram: number): PortfolioStats => {
    if (purchases.length === 0 || ratePerGram === 0) {
      return {
        totalInvestment: 0,
        currentValue: 0,
        totalWeight: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        averagePurchasePrice: 0,
      };
    }

    let totalInvestment = 0;
    let currentValue = 0;
    let totalWeight = 0;

    for (const p of purchases) {
      const factor = getPurityFactor(p.purity);
      totalInvestment += p.weight * p.purchasePricePerGram;
      currentValue += p.weight * ratePerGram * factor;
      totalWeight += p.weight;
    }

    const profitLoss = currentValue - totalInvestment;
    const profitLossPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;
    const averagePurchasePrice = totalWeight > 0 ? totalInvestment / totalWeight : 0;

    return { totalInvestment, currentValue, totalWeight, profitLoss, profitLossPercentage, averagePurchasePrice };
  }, [purchases, getPurityFactor]);

  return (
    <PurchasesContext.Provider value={{
      purchases,
      isLoading,
      isSyncing,
      error,
      sortOption,
      setSortOption,
      addPurchase,
      updatePurchase,
      deletePurchase,
      syncFromServer,
      calculateStats,
      getPurityFactor,
    }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within PurchasesProvider');
  return ctx;
}
