import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, TrendingUp, TrendingDown, Edit2, Trash2, Plus, ChevronDown } from 'lucide-react';
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
    <div className="vault-card overflow-hidden">
      {/* Top row */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded">
              {purchase.purity}
            </span>
            <span className="font-mono text-sm text-warm font-medium">{fmt(purchase.weight, 3)} g</span>
          </div>
          <p className="text-xs text-muted">
            {new Date(purchase.purchaseDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        <div className={`text-right px-2.5 py-1.5 rounded-md ${isProfit ? 'bg-emerge-bg/40 border border-emerge/20' : 'bg-crimson-bg/40 border border-crimson/20'}`}>
          <div className={`flex items-center gap-1 text-xs font-mono font-medium ${isProfit ? 'text-emerge-light' : 'text-crimson-light'}`}>
            {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{isProfit ? '+' : ''}{returnsPct.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gold/[0.06] border-t border-gold/[0.06]">
        <div className="px-3 py-3">
          <p className="text-[10px] text-muted mb-1 uppercase tracking-wider">Bought</p>
          <p className="font-mono text-xs text-warm">₹{fmt(purchase.purchasePricePerGram)}/g</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] text-muted mb-1 uppercase tracking-wider">Invested</p>
          <p className="font-mono text-xs text-warm">₹{fmt(purchaseValue)}</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] text-muted mb-1 uppercase tracking-wider">P&L</p>
          <p className={`font-mono text-xs font-medium ${isProfit ? 'text-emerge-light' : 'text-crimson-light'}`}>
            {isProfit ? '+' : ''}₹{fmt(Math.abs(profitLoss))}
          </p>
        </div>
      </div>

      {/* Notes */}
      {purchase.notes && (
        <div className="px-4 py-2 border-t border-gold/[0.06]">
          <p className="text-xs text-muted italic">{purchase.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex border-t border-gold/[0.06]">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted hover:text-gold hover:bg-gold/[0.04] transition-colors"
        >
          <Edit2 size={12} />
          Edit
        </button>
        <div className="w-px bg-gold/[0.06]" />
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted hover:text-crimson hover:bg-crimson/[0.04] transition-colors"
        >
          <Trash2 size={12} />
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="section-label">Purchases</p>
        <div className="flex items-center gap-2">
          <button
            onClick={syncFromServer}
            disabled={isSyncing}
            className="text-faint hover:text-gold transition-colors p-1.5"
            title="Sync from server"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/add')}
            className="btn-gold px-3 py-1.5 rounded-lg text-xs gap-1.5"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
        </p>
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-warm transition-colors"
          >
            {SORT_LABELS[sortOption]}
            <ChevronDown size={12} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
          </button>

          {showSort && (
            <div className="absolute right-0 top-7 z-20 vault-card min-w-[148px] overflow-hidden shadow-lg shadow-black/40">
              {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                <button
                  key={opt}
                  onClick={() => { setSortOption(opt); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                    sortOption === opt
                      ? 'text-gold bg-gold/8'
                      : 'text-muted hover:text-warm hover:bg-gold/[0.04]'
                  }`}
                >
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      {purchases.length === 0 ? (
        <div className="vault-card p-10 text-center">
          <p className="text-muted text-sm mb-5">No purchases recorded yet.</p>
          <button
            onClick={() => navigate('/add')}
            className="btn-gold px-6 py-2.5 rounded-lg text-sm gap-2"
          >
            <Plus size={14} />
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

      {/* Delete modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/75 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="vault-card w-full max-w-sm p-6 shadow-xl shadow-black/50">
            <h3 className="font-display text-xl font-medium text-warm mb-1">Delete Purchase?</h3>
            <p className="text-muted text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-ghost flex-1 py-2.5 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-crimson-light bg-crimson-bg border border-crimson/20 hover:bg-crimson/15 transition-colors"
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
