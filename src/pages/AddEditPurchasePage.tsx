import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { usePurchases } from '../context/PurchasesContext';
import type { Purity } from '../types';
import { useGoldRate } from '../context/GoldRateContext';

const PURITIES: Purity[] = ['24k', '22k', '18k'];

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

  const currentValue = ratePerGram > 0
    ? weightNum * ratePerGram * getPurityFactor(purity)
    : 0;

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
    <div className="sm:pl-52">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">
          {isEdit ? 'Edit Purchase' : 'Add Purchase'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Weight */}
        <div className="glass rounded-xl p-4">
          <label className="text-sm text-gray-400 mb-1 block">Weight (grams)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 10"
            step="0.001"
            min="0"
            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
          />
        </div>

        {/* Total Purchase Price */}
        <div className="glass rounded-xl p-4">
          <label className="text-sm text-gray-400 mb-1 block">Total Purchase Price (₹)</label>
          <input
            type="number"
            value={totalPrice}
            onChange={e => setTotalPrice(e.target.value)}
            placeholder="e.g. 60000"
            step="0.01"
            min="0"
            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
          />
          {pricePerGram > 0 && (
            <p className="text-xs text-gold mt-2">≈ ₹{fmt(pricePerGram, 2)} per gram</p>
          )}
        </div>

        {/* Purchase Date */}
        <div className="glass rounded-xl p-4">
          <label className="text-sm text-gray-400 mb-1 block">Purchase Date</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
            required
          />
        </div>

        {/* Purity */}
        <div className="glass rounded-xl p-4">
          <label className="text-sm text-gray-400 mb-2 block">Gold Purity</label>
          <div className="flex gap-2">
            {PURITIES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPurity(p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  purity === p
                    ? 'gold-gradient text-black'
                    : 'bg-surface-light text-gray-300 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="glass rounded-xl p-4">
          <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Bought for wedding, store name..."
            rows={3}
            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors resize-none"
          />
        </div>

        {/* Summary card */}
        {weightNum > 0 && pricePerGram > 0 && (
          <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-gold" />
              <p className="text-sm text-gold font-semibold">Purchase Summary</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Weight</p>
                <p className="text-white font-medium">{fmt(weightNum, 3)}g</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Price / gram</p>
                <p className="text-white font-medium">₹{fmt(pricePerGram, 2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Invested</p>
                <p className="text-white font-medium">₹{fmt(totalPriceNum)}</p>
              </div>
              {currentValue > 0 && (
                <div>
                  <p className="text-gray-400 text-xs">Current Value</p>
                  <p className={`font-medium ${currentValue >= totalPriceNum ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{fmt(currentValue)}
                  </p>
                </div>
              )}
            </div>
            {ratePerGram > 0 && (
              <p className="text-xs text-gray-400 mt-3 flex items-start gap-1">
                <Info size={11} className="mt-0.5 shrink-0" />
                Current value = weight × market rate × purity factor ({getPurityFactor(purity)})
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 bg-surface-light rounded-xl text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 gold-gradient text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Add Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
}
