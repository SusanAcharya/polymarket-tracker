import { NextRequest, NextResponse } from 'next/server';
import { getPositions, addPosition, updatePosition, deletePosition } from '@/lib/storage';
import { extractMarketId, fetchMarketInfo } from '@/lib/polymarket';
import { Position } from '@/types';

// GET all positions
export async function GET() {
  try {
    const positions = getPositions();
    return NextResponse.json({ positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

// POST - Add a new position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      marketUrl,
      outcome,
      entryPrice,
      quantity,
      takeProfit,
      stopLoss,
      marketQuestion,
    } = body;

    // Validation
    if (!marketUrl || !outcome || entryPrice === undefined || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (entryPrice < 0 || entryPrice > 1) {
      return NextResponse.json(
        { error: 'Entry price must be between 0 and 1' },
        { status: 400 }
      );
    }

    if (takeProfit !== undefined && (takeProfit < 0 || takeProfit > 1)) {
      return NextResponse.json(
        { error: 'Take profit must be between 0 and 1' },
        { status: 400 }
      );
    }

    if (stopLoss !== undefined && (stopLoss < 0 || stopLoss > 1)) {
      return NextResponse.json(
        { error: 'Stop loss must be between 0 and 1' },
        { status: 400 }
      );
    }

    // Extract market ID
    const marketId = extractMarketId(marketUrl);
    if (!marketId) {
      return NextResponse.json(
        { error: 'Invalid market URL' },
        { status: 400 }
      );
    }

    // Fetch market info if question not provided
    let question = marketQuestion;
    if (!question) {
      const marketInfo = await fetchMarketInfo(marketId);
      question = marketInfo?.question || marketId;
    }

    // Fetch initial price
    const { fetchMarketPrices } = await import('@/lib/polymarket');
    const currentPrice = await fetchMarketPrices(marketId, outcome);

    const position = addPosition({
      marketId,
      marketUrl,
      marketQuestion: question,
      outcome,
      entryPrice: parseFloat(entryPrice),
      quantity: parseFloat(quantity),
      takeProfit: takeProfit !== undefined ? parseFloat(takeProfit) : 1.0,
      stopLoss: stopLoss !== undefined ? parseFloat(stopLoss) : 0.0,
      currentPrice: currentPrice || undefined,
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({ position }, { status: 201 });
  } catch (error) {
    console.error('Error adding position:', error);
    return NextResponse.json(
      { error: 'Failed to add position' },
      { status: 500 }
    );
  }
}

// PUT - Update a position
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    const position = updatePosition(id, updates);
    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ position });
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a position
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    const deleted = deletePosition(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { error: 'Failed to delete position' },
      { status: 500 }
    );
  }
}

