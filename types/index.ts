export interface Position {
  id: string;
  marketId: string;
  marketUrl: string;
  marketQuestion: string;
  outcome: string; // "YES", "NO", or specific option name
  entryPrice: number;
  quantity: number;
  takeProfit: number;
  stopLoss: number;
  currentPrice?: number;
  lastUpdated?: string;
  alertsSent?: {
    takeProfit?: boolean;
    stopLoss?: boolean;
  };
  createdAt: string;
}

export interface MarketPrice {
  marketId: string;
  outcome: string;
  price: number;
  timestamp: string;
}

export interface Alert {
  positionId: string;
  type: 'takeProfit' | 'stopLoss' | 'pnl';
  message: string;
  timestamp: string;
}

