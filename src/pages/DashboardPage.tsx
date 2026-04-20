import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Plus, Scale, Coins } from 'lucide-react';
import { useGoldRate } from '../context/GoldRateContext';
import { usePurchases } from '../context/PurchasesContext';

function fmt(n: number, digits = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(n);
}

function fmtCurrency(n: number) {
  return '₹' + fmt(n, 0);
}

export default function DashboardPage() {
  const { goldRate, ratePerGram, isLoading: rateLoading, history, selectedDays, setSelectedDays, fetchGoldRate, getPriceChangeInfo } = useGoldRate();
  const { purchases, calculateStats } = usePurchases();
  const navigate = useNavigate();

  const stats = calculateStats(ratePerGram);
  const priceChange = getPriceChangeInfo();
  const isProfit = stats.profitLoss >= 0;
  const hasPurchases = purchases.length > 0;

  const chartData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: Math.round(h.price / 10),
  }));

  return (
    <div className="sm:pl-52 space-y-4">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>

      {/* Portfolio Summary */}
      <div className={`rounded-2xl p-5 ${hasPurchases ? (isProfit ? 'profit-gradient' : 'loss-gradient') : 'glass'}`}>
        <p className="text-sm text-gray-400 mb-1">Portfolio Summary</p>
        {hasPurchases ? (
          <>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs text-gray-400">Total Invested</p>
                <p className="text-lg font-bold text-white">{fmtCurrency(stats.totalInvestment)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Current Value</p>
                <p className="text-lg font-bold text-white">{fmtCurrency(stats.currentValue)}</p>
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-2 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-semibold">
                {isProfit ? '+' : ''}{fmtCurrency(stats.profitLoss)}
                {' '}({isProfit ? '+' : ''}{stats.profitLossPercentage.toFixed(2)}%)
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm mb-3">No investments yet. Start tracking!</p>
            <button
              onClick={() => navigate('/add')}
              className="gold-gradient text-black font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Add Purchase
            </button>
          </div>
        )}
      </div>

      {/* Gold Rate Card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">Current Gold Rate</p>
          <button
            onClick={fetchGoldRate}
            disabled={rateLoading}
            className="p-1.5 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-gold"
          >
            <RefreshCw size={16} className={rateLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {goldRate ? (
          <>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gold">
                {fmtCurrency(goldRate.priceNumeric)}
              </p>
              <p className="text-gray-400 text-sm mb-1">/ 10g</p>
            </div>
            <p className="text-sm text-gray-400">
              {fmtCurrency(ratePerGram)} / gram • {goldRate.purity} • {goldRate.location}
            </p>
            {priceChange && (
              <div className={`mt-2 flex items-center gap-1 text-sm ${priceChange.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>
                  {priceChange.change >= 0 ? '+' : ''}{fmtCurrency(priceChange.change / 10)}
                  {' '}({priceChange.percent.toFixed(2)}%) today
                </span>
              </div>
            )}
            {goldRate.timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                Updated: {new Date(goldRate.timestamp).toLocaleString('en-IN')}
              </p>
            )}
          </>
        ) : rateLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Fetching rate...</p>
          </div>
        ) : (
          <p className="text-gray-400">Rate unavailable</p>
        )}
      </div>

      {/* Quick Stats */}
      {hasPurchases && (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-3">Quick Stats</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-light rounded-xl p-3 text-center">
              <Scale size={16} className="text-gold mx-auto mb-1" />
              <p className="text-xs text-gray-400">Total Gold</p>
              <p className="font-bold text-white text-sm">{fmt(stats.totalWeight, 2)}g</p>
            </div>
            <div className="bg-surface-light rounded-xl p-3 text-center">
              <Coins size={16} className="text-gold mx-auto mb-1" />
              <p className="text-xs text-gray-400">Avg Buy Price</p>
              <p className="font-bold text-white text-sm">{fmtCurrency(stats.averagePurchasePrice)}/g</p>
            </div>
            <div className="bg-surface-light rounded-xl p-3 text-center">
              <TrendingUp size={16} className="text-gold mx-auto mb-1" />
              <p className="text-xs text-gray-400">Market Price</p>
              <p className="font-bold text-white text-sm">{fmtCurrency(ratePerGram)}/g</p>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart */}
      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">Gold Price Trend</p>
            <div className="flex gap-1">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDays(d)}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    selectedDays === d ? 'bg-gold text-black font-semibold' : 'bg-surface-light text-gray-400 hover:text-white'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB300" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFB300" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1D1E33', border: '1px solid #FFB30030', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#FFB300' }}
                formatter={(v: any) => [`₹${v}`, 'Price/g']}
              />
              <Area type="monotone" dataKey="price" stroke="#FFB300" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
