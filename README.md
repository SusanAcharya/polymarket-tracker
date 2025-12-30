# Polymarket Position Tracker

A fully automated web application for tracking Polymarket positions and receiving price alerts. This app monitors your Polymarket positions and sends email alerts when take-profit or stop-loss thresholds are hit.

## Features

- ✅ **Automated Price Tracking**: Polls Polymarket prices every 10 minutes (configurable)
- ✅ **Email Alerts**: Sends alerts when take-profit or stop-loss thresholds are reached
- ✅ **Real-time Dashboard**: View all positions with current prices and PnL
- ✅ **Position Management**: Add, edit, and remove tracked positions
- ✅ **PnL Calculation**: Automatic calculation of unrealized profit/loss
- ✅ **Status Indicators**: Visual status indicators (🟢 Normal, 🟡 Near Target, 🔴 Alert Triggered)
- ✅ **Free Tier Friendly**: Runs entirely on free tiers (Vercel, Resend)

## Important Notes

⚠️ **This app does NOT:**
- Connect to wallets
- Execute trades
- Sign transactions
- Automate buying/selling

This is an **alerts-only** system. You still manually execute trades on Polymarket.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Storage**: JSON file (no database required)
- **Email**: Resend (free tier)
- **Deployment**: Vercel (free tier)
- **Automation**: Vercel Cron Jobs

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
ALERT_EMAIL_TO=your_email@example.com
# Optional: Custom from email (defaults to onboarding@resend.dev for free tier)
RESEND_FROM_EMAIL=onboarding@resend.dev

# Optional: Telegram Bot (if implementing)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# App Configuration
NEXT_PUBLIC_POLL_INTERVAL=600000
# Poll interval in milliseconds (default: 10 minutes = 600000ms)
```

### 3. Set Up Resend (Email Alerts)

1. Sign up for a free account at [resend.com](https://resend.com)
2. Create an API key
3. Add your API key to `.env.local` as `RESEND_API_KEY`
4. Add your email address as `ALERT_EMAIL_TO`

**Note**: For the free tier, you can use Resend's test domain (`onboarding@resend.dev`) or verify your own domain. Set `RESEND_FROM_EMAIL` in your `.env.local` if using a custom domain.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

The Vercel cron job will automatically poll prices every 10 minutes.

## Usage

### Adding a Position

1. Click "+ Add Position"
2. Enter the Polymarket URL (e.g., `https://polymarket.com/event/will-trump-win-2024`)
3. Select the outcome (YES/NO)
4. Enter your entry price (0-1)
5. Enter quantity (shares)
6. Set take-profit and stop-loss thresholds (optional)
7. Click "Add Position"

### Viewing Positions

The dashboard shows:
- Current price vs entry price
- Unrealized PnL (% and $)
- Status indicators
- Take-profit and stop-loss levels

### Editing Positions

Click "Edit" on any position card to update:
- Entry price
- Quantity
- Take-profit threshold
- Stop-loss threshold

### Manual Price Refresh

Click "🔄 Refresh Prices" to manually trigger a price update for all positions.

## API Endpoints

### GET `/api/positions`
Get all tracked positions

### POST `/api/positions`
Add a new position
```json
{
  "marketUrl": "https://polymarket.com/event/...",
  "outcome": "YES",
  "entryPrice": 0.5,
  "quantity": 100,
  "takeProfit": 0.8,
  "stopLoss": 0.2
}
```

### PUT `/api/positions`
Update a position
```json
{
  "id": "123",
  "entryPrice": 0.55,
  "quantity": 150
}
```

### DELETE `/api/positions?id=123`
Delete a position

### GET `/api/prices/poll`
Poll prices for all positions (also triggers alerts)

### POST `/api/prices/update`
Update price for a specific position
```json
{
  "positionId": "123"
}
```

## Polymarket API Integration

The app uses Polymarket's public API endpoints:
- Market information: `https://clob.polymarket.com/markets/{marketId}`
- Orderbook: `https://clob.polymarket.com/book?token_id={marketId}-{outcome}`

Market IDs are extracted from Polymarket URLs automatically.

## Data Storage

Positions are stored in `data/positions.json`. This file is created automatically and should be committed to version control (or excluded if you prefer).

## Troubleshooting

### Email alerts not working
- Verify your Resend API key is correct
- Check that `ALERT_EMAIL_TO` is set
- Ensure your domain is verified in Resend (or use test domain)
- Check server logs for errors

### Prices not updating
- Check that the Polymarket API is accessible
- Verify market IDs are correct
- Check browser console for errors
- Ensure Vercel cron is enabled (for production)

### Position not found
- Verify the Polymarket URL is correct
- Check that the market ID extraction is working
- Ensure the outcome matches exactly (YES/NO or specific option name)

## Development

### Project Structure

```
polymarket-analysis/
├── app/
│   ├── api/
│   │   ├── positions/      # CRUD operations
│   │   └── prices/         # Price polling
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Main dashboard
├── components/
│   ├── AddPositionForm.tsx
│   ├── EditPositionForm.tsx
│   ├── PositionCard.tsx
│   └── PositionList.tsx
├── lib/
│   ├── alerts.ts          # Alert logic
│   ├── polymarket.ts      # API integration
│   └── storage.ts         # Data persistence
├── types/
│   └── index.ts           # TypeScript types
└── data/
    └── positions.json     # Position storage
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

# polymarket-tracker
