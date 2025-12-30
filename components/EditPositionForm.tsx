'use client';

import { useState } from 'react';
import { Position } from '@/types';

interface EditPositionFormProps {
  position: Position;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditPositionForm({ position, onSuccess, onCancel }: EditPositionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    entryPrice: position.entryPrice.toString(),
    quantity: position.quantity.toString(),
    takeProfit: position.takeProfit.toString(),
    stopLoss: position.stopLoss.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/positions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: position.id,
          entryPrice: parseFloat(formData.entryPrice),
          quantity: parseFloat(formData.quantity),
          takeProfit: parseFloat(formData.takeProfit),
          stopLoss: parseFloat(formData.stopLoss),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update position');
      }
    } catch (error) {
      console.error('Error updating position:', error);
      alert('Error updating position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
      <h3 className="text-xl font-semibold mb-4">Edit Position: {position.marketQuestion}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Entry Price (0-1)
            </label>
            <input
              type="number"
              required
              min="0"
              max="1"
              step="0.0001"
              value={formData.entryPrice}
              onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity (shares)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Take Profit (0-1)
            </label>
            <input
              type="number"
              required
              min="0"
              max="1"
              step="0.0001"
              value={formData.takeProfit}
              onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Stop Loss (0-1)
            </label>
            <input
              type="number"
              required
              min="0"
              max="1"
              step="0.0001"
              value={formData.stopLoss}
              onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
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
            {loading ? 'Updating...' : 'Update Position'}
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

