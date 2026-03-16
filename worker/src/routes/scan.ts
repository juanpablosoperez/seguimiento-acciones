import { getAlerts, getWatchlist } from '../services/kvService'
import { buildScanRows } from '../services/marketService'
import type { Env } from '../types/env'
import { json } from '../utils/http'

export async function handleScan(request: Request, env: Env): Promise<Response> {
  const [watchlist, alerts] = await Promise.all([getWatchlist(env), getAlerts(env)])
  const alertSymbols = new Set(alerts.filter((alert) => alert.active).map((alert) => alert.symbol))
  const rows = await buildScanRows(env, watchlist, alertSymbols)

  const url = new URL(request.url)
  if (url.searchParams.get('format') === 'compact') {
    return json(
      rows.map((row) => ({
        symbol: row.symbol,
        price: row.price,
        currency: row.currency,
        rsi: row.rsi14,
        ema200: row.ema200,
        sma50: row.sma50,
        volumeRelative: row.relativeVolume20,
        score: row.technicalState === 'fuerte' ? 'strong' : row.technicalState === 'debil' ? 'weak' : 'neutral',
      })),
    )
  }

  return json({
    updatedAt: new Date().toISOString(),
    rows,
  })
}
