'use client';

import { useEffect, useState } from 'react';
import { Position } from '@/types';
import PositionList from '@/components/PositionList';
import AddPositionForm from '@/components/AddPositionForm';

// Client-side PnL calculation
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

export default function Home() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [polling, setPolling] = useState(false);

  // Fetch positions
  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      const data = await response.json();
      setPositions(data.positions || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll prices
  const pollPrices = async () => {
    if (polling) return;
    
    setPolling(true);
    try {
      await fetch('/api/prices/poll');
      await fetchPositions(); // Refresh positions after polling
    } catch (error) {
      console.error('Error polling prices:', error);
    } finally {
      setPolling(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPositions();
  }, []);

  // Auto-poll prices every 10 minutes (configurable)
  useEffect(() => {
    // Default to 10 minutes (600000ms)
    const interval = 600000;
    const pollInterval = setInterval(pollPrices, interval);

    // Poll immediately on mount
    pollPrices();

    return () => clearInterval(pollInterval);
  }, []);

  // Calculate total PnL
  const totalPnL = positions.reduce((sum: number, pos: Position) => {
    const { pnlDollar } = calculatePnL(pos);
    return sum + pnlDollar;
  }, 0);

  const totalPnLPercent = positions.length > 0
    ? positions.reduce((sum: number, pos: Position) => {
        const { pnlPercent } = calculatePnL(pos);
        return sum + pnlPercent;
      }, 0) / positions.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Polymarket Position Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Automated price tracking and alerts for your Polymarket positions
        </p>
      </div>

      {/* Summary Stats */}
      {positions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Positions</div>
            <div className="text-2xl font-bold">{positions.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total PnL</div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg PnL %</div>
            <div className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnLPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add Position'}
        </button>
        <button
          onClick={pollPrices}
          disabled={polling}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          {polling ? 'Polling...' : '🔄 Refresh Prices'}
        </button>
      </div>

      {/* Add Position Form */}
      {showAddForm && (
        <div className="mb-6">
          <AddPositionForm
            onSuccess={() => {
              setShowAddForm(false);
              fetchPositions();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Positions List */}
      <PositionList
        positions={positions}
        onUpdate={fetchPositions}
        onDelete={fetchPositions}
      />
    </main>
  );
}

