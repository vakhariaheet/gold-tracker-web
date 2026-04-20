import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, SlidersHorizontal, TrendingUp, TrendingDown, Edit2, Trash2, Plus } from 'lucide-react';
import { usePurchases } from '../context/PurchasesContext';
import { useGoldRate } from '../context/GoldRateContext';
import type { GoldPurchase, SortOption } from '../types';

function fmt(n: number, d = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: d }).format(n);
}

interface PurchaseCardProps {
  purchase: GoldPurchase;
  ratePerGram: number;
  onEdit: () => void;
  onDelete: () => void;
  getPurityFactor: (p: GoldPurchase['purity']) => number;
}

function PurchaseCard({ purchase, ratePerGram, onEdit, onDelete, getPurityFactor }: PurchaseCardProps) {
  const factor = getPurityFactor(purchase.purity);
  const purchaseValue = purchase.weight * purchase.purchasePricePerGram;
  const currentValue = purchase.weight * ratePerGram * factor;
  const profitLoss = currentValue - purchaseValue;
  const returnsPct = purchaseValue > 0 ? (profitLoss / purchaseValue) * 100 : 0;
  const isProfit = profitLoss >= 0;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gold/20 text-gold text-xs font-semibold px-2 py-0.5 rounded-full">
              {purchase.purity}
            </span>
            <span className="text-white font-semibold">{fmt(purchase.weight, 3)}g</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(purchase.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className={`text-right px-2 py-1 rounded-lg ${isProfit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <div className={`flex items-center gap-1 text-sm font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isProfit ? '+' : ''}{returnsPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-surface-light rounded-lg py-2 px-1">
          <p className="text-xs text-gray-500">Bought</p>
          <p className="text-xs font-semibold text-white">₹{fmt(purchase.purchasePricePerGram)}/g</p>
        </div>
        <div className="bg-surface-light rounded-lg py-2 px-1">
          <p className="text-xs text-gray-500">Invested</p>
          <p className="text-xs font-semibold text-white">₹{fmt(purchaseValue)}</p>
        </div>
        <div className={`rounded-lg py-2 px-1 ${isProfit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <p className="text-xs text-gray-500">P&L</p>
          <p className={`text-xs font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}₹{fmt(Math.abs(profitLoss))}
          </p>
        </div>
      </div>

      {purchase.notes && (
        <p className="text-xs text-gray-400 italic mb-3">{purchase.notes}</p>
      )}

      <div className="flex gap-2 pt-2 border-t border-white/5">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-surface-light rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gold/10 transition-colors"
        >
          <Edit2 size={14} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-surface-light rounded-lg text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}

const SORT_LABELS: Record<SortOption, string> = {
  date_desc: 'Newest First',
  date_asc: 'Oldest First',
  weight_desc: 'Heaviest First',
  weight_asc: 'Lightest First',
};

export default function PurchasesPage() {
  const { purchases, isSyncing, syncFromServer, deletePurchase, sortOption, setSortOption, getPurityFactor } = usePurchases();
  const { ratePerGram } = useGoldRate();
  const navigate = useNavigate();
  const [showSort, setShowSort] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    await deletePurchase(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="sm:pl-52 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Purchases</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSort(!showSort)}
            className="p-2 rounded-xl glass hover:bg-surface-light transition-colors text-gray-400 hover:text-gold relative"
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            onClick={syncFromServer}
            disabled={isSyncing}
            className="p-2 rounded-xl glass hover:bg-surface-light transition-colors text-gray-400 hover:text-gold"
            title="Sync from server"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Sort dropdown */}
      {showSort && (
        <div className="glass rounded-xl p-2 space-y-1">
          {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
            <button
              key={opt}
              onClick={() => { setSortOption(opt); setShowSort(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sortOption === opt ? 'bg-gold/20 text-gold' : 'text-gray-300 hover:bg-surface-light'
              }`}
            >
              {SORT_LABELS[opt]}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{purchases.length} purchase{purchases.length !== 1 ? 's' : ''} • sorted by {SORT_LABELS[sortOption].toLowerCase()}</span>
        <button
          onClick={() => navigate('/add')}
          className="flex items-center gap-1.5 text-gold hover:text-gold-light transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {purchases.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-gray-400 mb-4">No purchases yet.</p>
          <button
            onClick={() => navigate('/add')}
            className="gold-gradient text-black font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Add First Purchase
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map(p => (
            <PurchaseCard
              key={p.id}
              purchase={p}
              ratePerGram={ratePerGram}
              getPurityFactor={getPurityFactor}
              onEdit={() => navigate(`/edit/${p.id}`)}
              onDelete={() => setDeleteConfirm(p.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Purchase?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-surface-light rounded-xl text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
