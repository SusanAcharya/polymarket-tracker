import { Position } from '@/types';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Calculate PnL for a position
 */
export function calculatePnL(position: Position): {
  pnlPercent: number;
  pnlDollar: number;
  currentPrice: number;
} {
  const currentPrice = position.currentPrice || position.entryPrice;
  const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
  const pnlDollar = (currentPrice - position.entryPrice) * position.quantity;

  return {
    pnlPercent,
    pnlDollar,
    currentPrice,
  };
}

/**
 * Check if position should trigger an alert
 */
export function shouldTriggerAlert(position: Position): {
  shouldAlert: boolean;
  alertType: 'takeProfit' | 'stopLoss' | null;
  message: string;
} {
  if (!position.currentPrice) {
    return { shouldAlert: false, alertType: null, message: '' };
  }

  const { pnlPercent, pnlDollar } = calculatePnL(position);

  // Check take profit
  if (position.currentPrice >= position.takeProfit && !position.alertsSent?.takeProfit) {
    return {
      shouldAlert: true,
      alertType: 'takeProfit',
      message: `🎯 TAKE PROFIT ALERT: ${position.marketQuestion}\n\n` +
        `Current Price: $${position.currentPrice.toFixed(4)}\n` +
        `Target Price: $${position.takeProfit.toFixed(4)}\n` +
        `PnL: ${pnlPercent.toFixed(2)}% ($${pnlDollar.toFixed(2)})\n` +
        `Quantity: ${position.quantity} shares\n` +
        `Market: ${position.marketUrl}`,
    };
  }

  // Check stop loss
  if (position.currentPrice <= position.stopLoss && !position.alertsSent?.stopLoss) {
    return {
      shouldAlert: true,
      alertType: 'stopLoss',
      message: `🛑 STOP LOSS ALERT: ${position.marketQuestion}\n\n` +
        `Current Price: $${position.currentPrice.toFixed(4)}\n` +
        `Stop Loss: $${position.stopLoss.toFixed(4)}\n` +
        `PnL: ${pnlPercent.toFixed(2)}% ($${pnlDollar.toFixed(2)})\n` +
        `Quantity: ${position.quantity} shares\n` +
        `Market: ${position.marketUrl}`,
    };
  }

  return { shouldAlert: false, alertType: null, message: '' };
}

/**
 * Send email alert
 */
export async function sendEmailAlert(message: string, subject: string): Promise<boolean> {
  const alertEmail = process.env.ALERT_EMAIL_TO;
  const apiKey = process.env.RESEND_API_KEY;

  if (!alertEmail || !apiKey) {
    console.warn('Email alert not configured. Set RESEND_API_KEY and ALERT_EMAIL_TO in environment variables.');
    return false;
  }

  try {
    // Use Resend's test domain or your verified domain
    // For free tier, use: onboarding@resend.dev (test domain)
    // Or set RESEND_FROM_EMAIL in env for your verified domain
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    await resend.emails.send({
      from: `Polymarket Alerts <${fromEmail}>`,
      to: alertEmail,
      subject: subject,
      text: message,
    });

    return true;
  } catch (error) {
    console.error('Error sending email alert:', error);
    return false;
  }
}

/**
 * Send Telegram alert (optional)
 */
export async function sendTelegramAlert(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false; // Telegram not configured
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
    return false;
  }
}

/**
 * Process alerts for all positions
 */
export async function processAlerts(positions: Position[]): Promise<void> {
  for (const position of positions) {
    if (!position.currentPrice) continue;

    const { shouldAlert, alertType, message } = shouldTriggerAlert(position);

    if (shouldAlert && alertType) {
      const subject = `Polymarket Alert: ${position.marketQuestion}`;
      
      // Send email alert
      await sendEmailAlert(message, subject);

      // Send Telegram alert if configured
      await sendTelegramAlert(message);

      // Mark alert as sent
      const alertsSent = position.alertsSent || {};
      alertsSent[alertType] = true;

      // Update position to mark alert as sent
      const { updatePosition } = await import('@/lib/storage');
      updatePosition(position.id, { alertsSent });
    }
  }
}

