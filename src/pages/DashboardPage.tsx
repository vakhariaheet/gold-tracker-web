import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Plus } from 'lucide-react';
import { useGoldRate } from '../context/GoldRateContext';
import { usePurchases } from '../context/PurchasesContext';

function fmt(n: number, digits = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(n);
}

function fmtCurrency(n: number) {
  return '₹' + fmt(n, 0);
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = Date.now();
    const from = prevTarget.current;
    prevTarget.current = target;
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

export default function DashboardPage() {
  const { goldRate, ratePerGram, isLoading: rateLoading, history, selectedDays, setSelectedDays, fetchGoldRate, getPriceChangeInfo } = useGoldRate();
  const { purchases, calculateStats } = usePurchases();
  const navigate = useNavigate();

  const stats = calculateStats(ratePerGram);
  const priceChange = getPriceChangeInfo();
  const isProfit = stats.profitLoss >= 0;
  const hasPurchases = purchases.length > 0;

  const animCurrentValue = useCountUp(stats.currentValue);
  const animInvestment = useCountUp(stats.totalInvestment);
  const animProfitLoss = useCountUp(Math.abs(stats.profitLoss));
  const animRatePerGram = useCountUp(ratePerGram, 700);

  const chartData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: Math.round(h.price / 10),
  }));

  return (
    <div className="space-y-5">

      {/* Portfolio */}
      <section className="fade-up fade-up-1">
        <p className="section-label mb-3">Portfolio</p>
        <div className="vault-card p-5">
          {hasPurchases ? (
            <>
              <p className="text-xs text-muted mb-1.5">Current Value</p>
              <p className="font-display text-5xl font-light text-warm leading-none mb-2 number-reveal">
                {fmtCurrency(animCurrentValue)}
              </p>

              <div className={`flex items-center gap-1.5 mb-5 ${isProfit ? 'text-emerge' : 'text-crimson'}`}>
                {isProfit ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />}
                <span className="font-mono text-sm">
                  {isProfit ? '+' : '-'}{fmtCurrency(animProfitLoss)}
                  <span className="text-muted font-sans text-xs ml-1.5">
                    ({isProfit ? '+' : ''}{stats.profitLossPercentage.toFixed(2)}%)
                  </span>
                </span>
              </div>

              <div className="stat-divider pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1">Total Invested</p>
                  <p className="font-mono text-sm text-warm">{fmtCurrency(animInvestment)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Unrealised P&amp;L</p>
                  <p className={`font-mono text-sm ${isProfit ? 'text-emerge' : 'text-crimson'}`}>
                    {isProfit ? '+' : '-'}{fmtCurrency(animProfitLoss)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted text-sm mb-5">No investments tracked yet.</p>
              <button
                onClick={() => navigate('/add')}
                className="btn-gold px-5 py-2.5 rounded-lg text-sm gap-2"
              >
                <Plus size={14} />
                Add First Purchase
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Gold Rate */}
      <section className="fade-up fade-up-2">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Gold Rate</p>
          <button
            onClick={fetchGoldRate}
            disabled={rateLoading}
            className="text-faint hover:text-gold transition-colors p-1"
            title="Refresh rate"
          >
            <RefreshCw size={13} className={rateLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="vault-card p-5 glow-pulse">
          {goldRate ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <p className="font-mono text-3xl font-light gold-shimmer-text number-reveal">
                  {fmtCurrency(animRatePerGram)}
                </p>
                <span className="text-muted text-sm">/gram</span>
              </div>

              <p className="text-xs text-muted mb-3">
                <span className="font-mono">{fmtCurrency(goldRate.priceNumeric)}</span>
                {' '}/10g&nbsp; · &nbsp;{goldRate.purity}&nbsp; · &nbsp;{goldRate.location}
              </p>

              {priceChange && (
                <div className={`flex items-center gap-1.5 text-sm ${priceChange.change >= 0 ? 'text-emerge' : 'text-crimson'}`}>
                  {priceChange.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span className="font-mono text-xs">
                    {priceChange.change >= 0 ? '+' : ''}{fmtCurrency(priceChange.change / 10)}/g
                    &nbsp;({priceChange.percent.toFixed(2)}%) today
                  </span>
                </div>
              )}

              {goldRate.timestamp && (
                <p className="text-xs text-faint mt-2">
                  Updated {new Date(goldRate.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </>
          ) : rateLoading ? (
            <div className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 border border-gold/40 border-t-transparent rounded-full animate-spin" />
              <p className="text-muted text-sm">Fetching rate…</p>
            </div>
          ) : (
            <p className="text-muted text-sm">Rate unavailable</p>
          )}
        </div>
      </section>

      {/* Holdings */}
      {hasPurchases && (
        <section className="fade-up fade-up-3">
          <p className="section-label mb-3">Holdings</p>
          <div className="vault-card divide-y divide-gold/[0.06]">
            <div className="grid grid-cols-3 divide-x divide-gold/[0.06]">
              <div className="p-4 text-center">
                <p className="text-xs text-muted mb-1.5">Total Weight</p>
                <p className="font-mono text-sm text-warm">{fmt(stats.totalWeight, 3)}g</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-muted mb-1.5">Avg Buy Price</p>
                <p className="font-mono text-sm text-warm">{fmtCurrency(stats.averagePurchasePrice)}/g</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-muted mb-1.5">Market Price</p>
                <p className="font-mono text-sm text-gold">{fmtCurrency(animRatePerGram)}/g</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Price Chart */}
      {chartData.length > 0 && (
        <section className="fade-up fade-up-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Price Trend</p>
            <div className="flex gap-1">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDays(d)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors font-mono ${
                    selectedDays === d
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : 'text-faint hover:text-muted border border-transparent'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="vault-card p-5 pt-4">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C29C44" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#C29C44" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(194,156,68,0.07)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#3D3830', fontSize: 10, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#3D3830', fontSize: 10, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${v}`}
                  width={52}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181715',
                    border: '1px solid rgba(194,156,68,0.15)',
                    borderRadius: 8,
                    fontFamily: 'DM Mono',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#7A6E62', marginBottom: 4 }}
                  itemStyle={{ color: '#C29C44' }}
                  formatter={(v: any) => [`₹${v}`, 'Price/g']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#C29C44"
                  strokeWidth={1.5}
                  fill="url(#goldGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
