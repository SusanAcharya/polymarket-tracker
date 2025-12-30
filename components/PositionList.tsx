'use client';

import { Position } from '@/types';
import { calculatePnL } from '@/lib/alerts';
import PositionCard from './PositionCard';

interface PositionListProps {
  positions: Position[];
  onUpdate: () => void;
  onDelete: () => void;
}

export default function PositionList({ positions, onUpdate, onDelete }: PositionListProps) {
  if (positions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No positions tracked yet. Add your first position to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => (
        <PositionCard
          key={position.id}
          position={position}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

