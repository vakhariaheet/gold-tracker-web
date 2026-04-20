import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePurchases } from '../context/PurchasesContext';
import type { Purity } from '../types';
import { useGoldRate } from '../context/GoldRateContext';

const PURITIES: { value: Purity; label: string; factor: string }[] = [
  { value: '24k', label: '24K', factor: '99.9%' },
  { value: '22k', label: '22K', factor: '91.6%' },
  { value: '18k', label: '18K', factor: '75.0%' },
];

function fmt(n: number, d = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: d }).format(n);
}

export default function AddEditPurchasePage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { purchases, addPurchase, updatePurchase, getPurityFactor } = usePurchases();
  const { ratePerGram } = useGoldRate();

  const existing = isEdit ? purchases.find(p => p.id === Number(id)) : null;

  const [weight, setWeight] = useState(existing?.weight?.toString() || '');
  const [totalPrice, setTotalPrice] = useState(
    existing ? (existing.weight * existing.purchasePricePerGram).toString() : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(
    existing?.purchaseDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [purity, setPurity] = useState<Purity>(existing?.purity || '24k');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const weightNum = parseFloat(weight) || 0;
  const totalPriceNum = parseFloat(totalPrice) || 0;
  const pricePerGram = weightNum > 0 ? totalPriceNum / weightNum : 0;
  const currentValue = ratePerGram > 0 ? weightNum * ratePerGram * getPurityFactor(purity) : 0;
  const hasSummary = weightNum > 0 && pricePerGram > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weightNum <= 0) { setError('Weight must be greater than 0'); return; }
    if (totalPriceNum <= 0) { setError('Total price must be greater than 0'); return; }
    setError('');
    setIsLoading(true);
    try {
      const data = {
        weight: weightNum,
        purchasePricePerGram: pricePerGram,
        purchaseDate: new Date(purchaseDate).toISOString(),
        purity,
        notes: notes.trim() || undefined,
      };
      if (isEdit && existing) {
        await updatePurchase(existing.id, data);
      } else {
        await addPurchase(data as any);
      }
      navigate('/purchases');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate(-1)}
          className="text-muted hover:text-warm transition-colors p-1 -ml-1"
        >
          <ArrowLeft size={18} strokeWidth={1.75} />
        </button>
        <h1 className="font-display text-2xl font-medium text-warm">
          {isEdit ? 'Edit Purchase' : 'New Purchase'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Weight */}
        <div>
          <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Weight (grams)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 10.000"
            step="0.001"
            min="0"
            className="vault-input font-mono"
            required
          />
        </div>

        {/* Total Price */}
        <div>
          <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Total Purchase Price (₹)</label>
          <input
            type="number"
            value={totalPrice}
            onChange={e => setTotalPrice(e.target.value)}
            placeholder="e.g. 94000"
            step="0.01"
            min="0"
            className="vault-input font-mono"
            required
          />
          {pricePerGram > 0 && (
            <p className="text-xs text-gold mt-1.5 font-mono">≈ ₹{fmt(pricePerGram, 2)} per gram</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Purchase Date</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="vault-input [color-scheme:dark]"
            required
          />
        </div>

        {/* Purity */}
        <div>
          <label className="text-xs text-muted block mb-2 uppercase tracking-wider">Gold Purity</label>
          <div className="grid grid-cols-3 gap-2">
            {PURITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPurity(p.value)}
                className={`py-3 rounded-lg text-sm transition-colors border ${
                  purity === p.value
                    ? 'bg-gold/15 border-gold/40 text-gold font-medium'
                    : 'bg-s2 border-gold/[0.08] text-muted hover:text-warm hover:border-gold/20'
                }`}
              >
                <span className="font-mono font-medium block">{p.label}</span>
                <span className="text-[10px] mt-0.5 block opacity-60">{p.factor}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Bought for wedding, store name…"
            rows={3}
            className="vault-input resize-none"
          />
        </div>

        {/* Summary */}
        {hasSummary && (
          <div className="bg-gold/[0.05] border border-gold/[0.12] rounded-lg p-4">
            <p className="text-xs text-gold uppercase tracking-wider mb-3">Summary</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Weight</p>
                <p className="font-mono text-sm text-warm">{fmt(weightNum, 3)}g</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Price / gram</p>
                <p className="font-mono text-sm text-warm">₹{fmt(pricePerGram, 2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Total Invested</p>
                <p className="font-mono text-sm text-warm">₹{fmt(totalPriceNum)}</p>
              </div>
              {currentValue > 0 && (
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Current Value</p>
                  <p className={`font-mono text-sm font-medium ${currentValue >= totalPriceNum ? 'text-emerge-light' : 'text-crimson-light'}`}>
                    ₹{fmt(currentValue)}
                  </p>
                </div>
              )}
            </div>
            {ratePerGram > 0 && (
              <p className="text-[10px] text-muted mt-3 border-t border-gold/[0.08] pt-3">
                Current value = weight × market rate × purity factor ({getPurityFactor(purity)})
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-crimson-bg border border-crimson/20 rounded-lg px-4 py-3 text-crimson-light text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost flex-1 py-3 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold flex-1 py-3 rounded-lg text-sm"
          >
            {isLoading ? 'Saving…' : isEdit ? 'Update Purchase' : 'Add Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
}
