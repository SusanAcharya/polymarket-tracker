import { Position } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSITIONS_FILE = path.join(DATA_DIR, 'positions.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read positions from file
export function getPositions(): Position[] {
  ensureDataDir();
  
  if (!fs.existsSync(POSITIONS_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(POSITIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading positions:', error);
    return [];
  }
}

// Save positions to file
export function savePositions(positions: Position[]): void {
  ensureDataDir();
  
  try {
    fs.writeFileSync(POSITIONS_FILE, JSON.stringify(positions, null, 2));
  } catch (error) {
    console.error('Error saving positions:', error);
    throw error;
  }
}

// Add a new position
export function addPosition(position: Omit<Position, 'id' | 'createdAt' | 'alertsSent'>): Position {
  const positions = getPositions();
  const newPosition: Position = {
    ...position,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    alertsSent: {},
  };
  
  positions.push(newPosition);
  savePositions(positions);
  return newPosition;
}

// Update a position
export function updatePosition(id: string, updates: Partial<Position>): Position | null {
  const positions = getPositions();
  const index = positions.findIndex(p => p.id === id);
  
  if (index === -1) {
    return null;
  }
  
  positions[index] = { ...positions[index], ...updates };
  savePositions(positions);
  return positions[index];
}

// Delete a position
export function deletePosition(id: string): boolean {
  const positions = getPositions();
  const filtered = positions.filter(p => p.id !== id);
  
  if (filtered.length === positions.length) {
    return false; // Position not found
  }
  
  savePositions(filtered);
  return true;
}

// Get a single position by ID
export function getPosition(id: string): Position | null {
  const positions = getPositions();
  return positions.find(p => p.id === id) || null;
}

