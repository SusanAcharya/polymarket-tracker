'use client';

import { useState } from 'react';

interface AddPositionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddPositionForm({ onSuccess, onCancel }: AddPositionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    marketUrl: '',
    outcome: 'YES',
    entryPrice: '',
    quantity: '',
    takeProfit: '',
    stopLoss: '',
    marketQuestion: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketUrl: formData.marketUrl,
          outcome: formData.outcome,
          entryPrice: parseFloat(formData.entryPrice),
          quantity: parseFloat(formData.quantity),
          takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
          stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
          marketQuestion: formData.marketQuestion || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
        // Reset form
        setFormData({
          marketUrl: '',
          outcome: 'YES',
          entryPrice: '',
          quantity: '',
          takeProfit: '',
          stopLoss: '',
          marketQuestion: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add position');
      }
    } catch (error) {
      console.error('Error adding position:', error);
      alert('Error adding position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Position</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Polymarket URL or Market ID *
          </label>
          <input
            type="text"
            required
            value={formData.marketUrl}
            onChange={(e) => setFormData({ ...formData, marketUrl: e.target.value })}
            placeholder="https://polymarket.com/event/..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Market Question (optional)
          </label>
          <input
            type="text"
            value={formData.marketQuestion}
            onChange={(e) => setFormData({ ...formData, marketQuestion: e.target.value })}
            placeholder="Will X happen?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Outcome *
          </label>
          <select
            required
            value={formData.outcome}
            onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
          >
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            For multi-outcome markets, enter the specific outcome name
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Entry Price * (0-1)
            </label>
            <input
              type="number"
              required
              min="0"
              max="1"
              step="0.0001"
              value={formData.entryPrice}
              onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
              placeholder="0.5000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity (shares) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Take Profit (0-1, optional)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.0001"
              value={formData.takeProfit}
              onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
              placeholder="0.8000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Stop Loss (0-1, optional)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.0001"
              value={formData.stopLoss}
              onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
              placeholder="0.2000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
          >
            {loading ? 'Adding...' : 'Add Position'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

