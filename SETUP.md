# Quick Setup Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   ALERT_EMAIL_TO=your_email@example.com
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

## Getting Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Create an API key in the dashboard
3. For free tier, you can use the test domain or verify your own domain
4. Update the `from` email in `lib/alerts.ts` if needed

## Polymarket API Notes

The app uses Polymarket's public CLOB (Central Limit Order Book) API which doesn't require authentication for reading prices. The implementation:

- Extracts market IDs from Polymarket URLs
- Fetches prices from the orderbook
- Uses mid-price (average of best bid and ask) for tracking

If you encounter issues with price fetching:
1. Verify the market URL is correct
2. Check that the outcome (YES/NO) matches exactly
3. The market must be active on Polymarket

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The cron job will automatically run every 10 minutes to poll prices.

