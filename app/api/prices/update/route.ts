import { NextRequest, NextResponse } from 'next/server';
import { getPosition, updatePosition } from '@/lib/storage';
import { fetchMarketPrices } from '@/lib/polymarket';
import { processAlerts } from '@/lib/alerts';

/**
 * Update price for a specific position
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { positionId } = body;

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    const position = getPosition(positionId);
    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    const currentPrice = await fetchMarketPrices(position.marketId, position.outcome);
    
    if (currentPrice === null) {
      return NextResponse.json(
        { error: 'Failed to fetch price' },
        { status: 500 }
      );
    }

    updatePosition(positionId, {
      currentPrice,
      lastUpdated: new Date().toISOString(),
    });

    // Check for alerts
    const updatedPosition = getPosition(positionId);
    if (updatedPosition) {
      await processAlerts([updatedPosition]);
    }

    return NextResponse.json({
      success: true,
      position: updatedPosition,
      price: currentPrice,
    });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}

