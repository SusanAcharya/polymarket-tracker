'use client';

import { useState } from 'react';
import { Position } from '@/types';
import EditPositionForm from './EditPositionForm';

// Client-side PnL calculation (duplicated from lib/alerts to avoid server-side imports)
function calculatePnL(position: Position) {
  const currentPrice = position.currentPrice || position.entryPrice;
  const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
  const pnlDollar = (currentPrice - position.entryPrice) * position.quantity;

  return {
    pnlPercent,
    pnlDollar,
    currentPrice,
  };
}

interface PositionCardProps {
  position: Position;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function PositionCard({ position, onUpdate, onDelete }: PositionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { pnlPercent, pnlDollar, currentPrice } = calculatePnL(position);

  // Determine status
  const getStatus = () => {
    if (!currentPrice) return { emoji: '⚪', label: 'No Price', colorClass: 'border-gray-500', badgeClass: 'bg-gray-100 text-gray-800' };
    
    if (currentPrice >= position.takeProfit) {
      return { emoji: '🔴', label: 'Take Profit Hit', colorClass: 'border-red-500', badgeClass: 'bg-red-100 text-red-800' };
    }
    if (currentPrice <= position.stopLoss) {
      return { emoji: '🔴', label: 'Stop Loss Hit', colorClass: 'border-red-500', badgeClass: 'bg-red-100 text-red-800' };
    }
    
    const distanceToTP = Math.abs(currentPrice - position.takeProfit);
    const distanceToSL = Math.abs(currentPrice - position.stopLoss);
    const threshold = 0.05; // 5 cents
    
    if (distanceToTP < threshold || distanceToSL < threshold) {
      return { emoji: '🟡', label: 'Near Target', colorClass: 'border-yellow-500', badgeClass: 'bg-yellow-100 text-yellow-800' };
    }
    
    return { emoji: '🟢', label: 'Normal', colorClass: 'border-green-500', badgeClass: 'bg-green-100 text-green-800' };
  };

  const status = getStatus();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this position?')) {
      return;
    }

    try {
      const response = await fetch(`/api/positions?id=${position.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete();
      } else {
        alert('Failed to delete position');
      }
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('Error deleting position');
    }
  };

  if (isEditing) {
    return (
      <EditPositionForm
        position={position}
        onSuccess={() => {
          setIsEditing(false);
          onUpdate();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 ${status.colorClass}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{status.emoji}</span>
            <h3 className="text-xl font-semibold">{position.marketQuestion}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Outcome: <span className="font-medium">{position.outcome}</span>
          </div>
          <a
            href={position.marketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            View on Polymarket →
          </a>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-200 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
          <div className="text-lg font-semibold">
            {currentPrice ? `$${currentPrice.toFixed(4)}` : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Entry Price</div>
          <div className="text-lg font-semibold">${position.entryPrice.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">PnL</div>
          <div className={`text-lg font-semibold ${pnlDollar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {pnlPercent.toFixed(2)}% (${pnlDollar.toFixed(2)})
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Quantity</div>
          <div className="text-lg font-semibold">{position.quantity} shares</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Take Profit</div>
          <div className="text-sm font-medium">${position.takeProfit.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Stop Loss</div>
          <div className="text-sm font-medium">${position.stopLoss.toFixed(4)}</div>
        </div>
      </div>

      {position.lastUpdated && (
        <div className="text-xs text-gray-500 mt-2">
          Last updated: {new Date(position.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}

