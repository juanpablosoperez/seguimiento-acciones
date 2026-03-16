import { sendAlertEmail } from './emailService'
import { getAlerts, getSettings, getWatchlist, setAlerts } from './kvService'
import { buildScanRows } from './marketService'
import type { AlertRule } from '../types/domain'
import type { Env } from '../types/env'

export async function evaluateAlerts(env: Env) {
  const [alerts, settings, watchlist] = await Promise.all([getAlerts(env), getSettings(env), getWatchlist(env)])
  const rows = await buildScanRows(env, watchlist)
  const rowsMap = new Map(rows.map((row) => [row.symbol, row]))

  const now = Date.now()
  let triggered = 0

  const nextAlerts = await Promise.all(
    alerts.map(async (alert) => {
      if (!alert.active) return { ...alert, currentlyInCondition: false }

      const row = rowsMap.get(alert.symbol)
      if (!row) return alert

      const inCondition = checkCondition(alert, row)
      const lastTriggeredMs = alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt).getTime() : 0
      const cooldownMs = alert.cooldownMinutes * 60_000
      const cooldownPassed = now - lastTriggeredMs > cooldownMs
      const shouldTrigger = inCondition && !alert.currentlyInCondition && cooldownPassed

      if (shouldTrigger) {
        triggered += 1
        await sendAlertEmail(env, settings, {
          to: alert.destinationEmail,
          subject: `[Cedear Scanner AR] Alerta ${alert.symbol}`,
          html: `<p>${alert.tickerName} cumple la condicion ${alert.condition}.</p><p>Precio: ${row.price.toFixed(2)} | RSI14: ${row.rsi14?.toFixed(2) ?? '-'}</p>`,
        })
      }

      return {
        ...alert,
        currentlyInCondition: inCondition,
        lastTriggeredAt: shouldTrigger ? new Date(now).toISOString() : alert.lastTriggeredAt,
      }
    }),
  )

  await setAlerts(env, nextAlerts)
  return { checkedAt: new Date(now).toISOString(), triggered }
}

function checkCondition(alert: AlertRule, row: (Awaited<ReturnType<typeof buildScanRows>>)[number]): boolean {
  const target = alert.targetValue ?? 0

  switch (alert.condition) {
    case 'rsi_gt':
      return row.rsi14 !== null && row.rsi14 > target
    case 'rsi_lt':
      return row.rsi14 !== null && row.rsi14 < target
    case 'price_gt':
      return row.price > target
    case 'price_lt':
      return row.price < target
    case 'cross_above_ema200':
      return row.distanceToEma200Pct !== null && row.distanceToEma200Pct > 0
    case 'cross_below_ema200':
      return row.distanceToEma200Pct !== null && row.distanceToEma200Pct < 0
    case 'cross_above_sma50':
      return row.distanceToSma50Pct !== null && row.distanceToSma50Pct > 0
    case 'cross_below_sma50':
      return row.distanceToSma50Pct !== null && row.distanceToSma50Pct < 0
    case 'relative_volume_gt':
      return row.relativeVolume20 !== null && row.relativeVolume20 > target
    default:
      return false
  }
}
