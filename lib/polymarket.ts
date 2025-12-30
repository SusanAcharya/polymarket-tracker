import { MarketPrice } from '@/types';

// Polymarket API endpoints
const POLYMARKET_API_BASE = 'https://clob.polymarket.com';
const POLYMARKET_GRAPHQL = 'https://api.thegraph.com/subgraphs/name/polymarket/clob-v2';

/**
 * Extract market ID from Polymarket URL
 * Examples:
 * - https://polymarket.com/event/will-trump-win-2024 -> will-trump-win-2024
 * - https://polymarket.com/market/will-trump-win-2024 -> will-trump-win-2024
 */
export function extractMarketId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2 && (pathParts[0] === 'event' || pathParts[0] === 'market')) {
      return pathParts[1];
    }
    
    // If it's already just an ID/slug
    if (pathParts.length === 1) {
      return pathParts[0];
    }
    
    return null;
  } catch {
    // If it's not a URL, assume it's already a market ID
    return url;
  }
}

/**
 * Fetch market information and prices from Polymarket
 * Uses Polymarket's public CLOB API
 */
export async function fetchMarketPrices(marketId: string, outcome: string): Promise<number | null> {
  try {
    // Polymarket uses token IDs in format: {conditionId}-{outcomeIndex}
    // For YES/NO markets, outcomeIndex is typically 0 for YES and 1 for NO
    // We'll try to fetch from orderbook which is more reliable
    
    return await fetchPriceFromOrderbook(marketId, outcome);
  } catch (error) {
    console.error(`Error fetching price for market ${marketId}:`, error);
    return null;
  }
}

/**
 * Fetch price from Polymarket orderbook
 * Polymarket CLOB API: https://clob.polymarket.com
 */
async function fetchPriceFromOrderbook(marketId: string, outcome: string): Promise<number | null> {
  try {
    // Determine outcome index (0 for YES, 1 for NO, or use outcome name)
    let outcomeIndex = 0;
    if (outcome.toUpperCase() === 'NO') {
      outcomeIndex = 1;
    } else if (outcome.toUpperCase() === 'YES') {
      outcomeIndex = 0;
    } else {
      // For multi-outcome markets, we'd need to map the outcome name to an index
      // For now, default to 0
      outcomeIndex = 0;
    }

    // Construct token ID: conditionId-outcomeIndex
    const tokenId = `${marketId}-${outcomeIndex}`;
    
    // Fetch orderbook from Polymarket CLOB API
    const response = await fetch(`${POLYMARKET_API_BASE}/book?token_id=${tokenId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Try alternative endpoint format
      const altResponse = await fetch(`${POLYMARKET_API_BASE}/markets/${marketId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        // Try to extract price from market data
        if (altData.price !== undefined) {
          return parseFloat(altData.price);
        }
        if (altData.outcomes) {
          const outcomeData = altData.outcomes.find((o: any) => 
            o.outcome?.toUpperCase() === outcome.toUpperCase()
          );
          if (outcomeData?.price) {
            return parseFloat(outcomeData.price);
          }
        }
      }
      
      return null;
    }

    const data = await response.json();
    
    // Parse orderbook data
    // Format: { bids: [[price, size], ...], asks: [[price, size], ...] }
    if (data.bids && Array.isArray(data.bids) && data.bids.length > 0) {
      const bestBid = parseFloat(data.bids[0][0]);
      
      if (data.asks && Array.isArray(data.asks) && data.asks.length > 0) {
        const bestAsk = parseFloat(data.asks[0][0]);
        // Use mid price for tracking
        return (bestBid + bestAsk) / 2;
      }
      
      // If only bids available, use best bid
      return bestBid;
    }

    if (data.asks && Array.isArray(data.asks) && data.asks.length > 0) {
      // If only asks available, use best ask
      return parseFloat(data.asks[0][0]);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching from orderbook for ${marketId}:`, error);
    return null;
  }
}

/**
 * Fetch market question/title from Polymarket
 */
export async function fetchMarketInfo(marketId: string): Promise<{ question: string; outcomes: string[] } | null> {
  try {
    // This is a simplified version - adjust based on actual Polymarket API
    const response = await fetch(`https://clob.polymarket.com/markets/${marketId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      question: data.question || data.title || marketId,
      outcomes: data.outcomes?.map((o: any) => o.outcome || o.id) || ['YES', 'NO'],
    };
  } catch (error) {
    console.error(`Error fetching market info for ${marketId}:`, error);
    return null;
  }
}

/**
 * Alternative: Use Polymarket's public web scraping approach
 * This is more reliable as it doesn't depend on API changes
 */
export async function fetchPriceFromWeb(marketUrl: string, outcome: string): Promise<number | null> {
  try {
    // For a more robust solution, you could use a headless browser
    // For now, we'll rely on the API approach
    // This function can be enhanced later if needed
    const marketId = extractMarketId(marketUrl);
    if (!marketId) return null;
    
    return await fetchMarketPrices(marketId, outcome);
  } catch (error) {
    console.error(`Error fetching price from web for ${marketUrl}:`, error);
    return null;
  }
}

