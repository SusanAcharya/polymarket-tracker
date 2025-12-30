import { NextResponse } from 'next/server';
import { getPositions, updatePosition } from '@/lib/storage';
import { fetchMarketPrices } from '@/lib/polymarket';
import { processAlerts } from '@/lib/alerts';

/**
 * Poll prices for all positions and update them
 * This endpoint can be called by:
 * 1. Vercel cron job (server-side)
 * 2. Client-side polling (browser)
 */
export async function GET() {
  try {
    const positions = getPositions();
    
    if (positions.length === 0) {
      return NextResponse.json({ 
        message: 'No positions to poll',
        updated: 0 
      });
    }

    let updatedCount = 0;
    const updatePromises = positions.map(async (position) => {
      try {
        const currentPrice = await fetchMarketPrices(position.marketId, position.outcome);
        
        if (currentPrice !== null) {
          updatePosition(position.id, {
            currentPrice,
            lastUpdated: new Date().toISOString(),
          });
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating price for position ${position.id}:`, error);
      }
    });

    await Promise.all(updatePromises);

    // Process alerts after updating prices
    const updatedPositions = getPositions();
    await processAlerts(updatedPositions);

    return NextResponse.json({
      message: 'Prices updated successfully',
      updated: updatedCount,
      total: positions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error polling prices:', error);
    return NextResponse.json(
      { error: 'Failed to poll prices' },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggers
export async function POST() {
  return GET();
}

