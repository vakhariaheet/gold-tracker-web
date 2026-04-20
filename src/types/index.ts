export interface User {
  id: string;
  name: string;
  email: string;
}

export type Purity = '24k' | '22k' | '18k';

export interface GoldPurchase {
  id: number;
  serverId?: string;
  weight: number;
  purchasePricePerGram: number;
  purchaseDate: string;
  purity: Purity;
  notes?: string;
  createdAt: string;
}

export interface GoldRateData {
  price: string;
  priceNumeric: number;
  currency: string;
  weight: string;
  purity: string;
  location: string;
  timestamp: string;
}

export interface GoldRateHistory {
  date: string;
  price: number;
  priceFormatted: string;
  timestamp: string;
}

export interface PortfolioStats {
  totalInvestment: number;
  currentValue: number;
  totalWeight: number;
  profitLoss: number;
  profitLossPercentage: number;
  averagePurchasePrice: number;
}

export type SortOption = 'date_desc' | 'date_asc' | 'weight_desc' | 'weight_asc';
