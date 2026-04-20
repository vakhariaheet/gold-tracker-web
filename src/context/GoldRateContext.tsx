import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { GoldRateData, GoldRateHistory } from '../types';

const CACHE_KEY = 'goldRateCache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface GoldRateContextType {
  goldRate: GoldRateData | null;
  history: GoldRateHistory[];
  selectedDays: number;
  isLoading: boolean;
  isHistoryLoading: boolean;
  error: string | null;
  ratePerGram: number;
  fetchGoldRate: () => Promise<void>;
  loadHistory: (days: number) => Promise<void>;
  setSelectedDays: (days: number) => void;
  getPriceChangeInfo: () => { change: number; percent: number } | null;
}

const GoldRateContext = createContext<GoldRateContextType | null>(null);

export function GoldRateProvider({ children }: { children: React.ReactNode }) {
  const [goldRate, setGoldRate] = useState<GoldRateData | null>(null);
  const [history, setHistory] = useState<GoldRateHistory[]>([]);
  const [selectedDays, setSelectedDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCached = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setGoldRate(data);
          return true;
        }
      }
    } catch {}
    return false;
  }, []);

  const fetchGoldRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<GoldRateData>('/api/gold-rate');
      setGoldRate(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err: any) {
      const cached = loadCached();
      if (!cached) {
        setError('Failed to fetch gold rate');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadCached]);

  const loadHistory = useCallback(async (days: number) => {
    setIsHistoryLoading(true);
    try {
      const {data} = await apiClient.get<{data: GoldRateHistory[]}>(`/api/gold-rate/history?days=${days}`);
      console.log('Fetched history data:', data);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = loadCached();
    if (!cached) fetchGoldRate();
  }, []);

  useEffect(() => {
    loadHistory(selectedDays);
  }, [selectedDays]);

  const ratePerGram = goldRate ? goldRate.priceNumeric / 10 : 0;

  const getPriceChangeInfo = useCallback(() => {
    console.log('Calculating price change info with history:', history);
    if (history.length < 2) return null;
    const latest = history[history.length - 1].price;
    const prev = history[history.length - 2].price;
    const change = latest - prev;
    const percent = (change / prev) * 100;
    return { change, percent };
  }, [history]);

  return (
    <GoldRateContext.Provider value={{
      goldRate,
      history,
      selectedDays,
      isLoading,
      isHistoryLoading,
      error,
      ratePerGram,
      fetchGoldRate,
      loadHistory,
      setSelectedDays,
      getPriceChangeInfo,
    }}>
      {children}
    </GoldRateContext.Provider>
  );
}

export function useGoldRate() {
  const ctx = useContext(GoldRateContext);
  if (!ctx) throw new Error('useGoldRate must be used within GoldRateProvider');
  return ctx;
}
