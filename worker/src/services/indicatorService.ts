import { EMA, RSI, SMA } from 'technicalindicators'
import type { AssetQuote, TechnicalState } from '../types/domain'

function latest(values: number[]): number | null {
  return values.length ? values[values.length - 1] : null
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((acc, value) => acc + value, 0) / values.length
}

function distancePercent(value: number, reference: number | null): number | null {
  if (!reference || reference === 0) return null
  return ((value - reference) / reference) * 100
}

function buildSummary(state: TechnicalState, rsi14: number | null, relativeVolume20: number | null): string {
  if (state === 'fuerte') return 'Estructura alcista con momentum sostenido y confirmacion de medias.'
  if (state === 'debil') return 'Estructura fragil con presion bajista o momentum extremo.'
  if (rsi14 !== null && rsi14 > 68) return 'Momentum acelerado, monitorear posible extension de corto plazo.'
  if (relativeVolume20 !== null && relativeVolume20 < 0.8) return 'Movimiento con bajo volumen relativo, confirmacion debil.'
  return 'Senales mixtas, mantener seguimiento tactico.'
}

export function computeIndicators(quote: AssetQuote) {
  const closes = quote.history.map((point) => point.close)
  const volumes = quote.history.map((point) => point.volume)

  const rsi14 = latest(RSI.calculate({ values: closes, period: 14 }))
  const rsi7 = latest(RSI.calculate({ values: closes, period: 7 }))
  const sma50 = latest(SMA.calculate({ values: closes, period: 50 }))
  const ema200 = latest(EMA.calculate({ values: closes, period: 200 }))
  const averageVolume20 = avg(volumes.slice(-20))
  const relativeVolume20 = averageVolume20 ? quote.history.at(-1)!.volume / averageVolume20 : null
  const high52w = closes.length >= 252 ? Math.max(...closes.slice(-252)) : null
  const distanceToHigh52wPct = distancePercent(quote.price, high52w)
  const distanceToEma200Pct = distancePercent(quote.price, ema200)
  const distanceToSma50Pct = distancePercent(quote.price, sma50)

  if (!sma50 || !ema200 || rsi14 === null || rsi7 === null || relativeVolume20 === null) {
    return {
      rsi14,
      rsi7,
      sma50,
      ema200,
      averageVolume20,
      relativeVolume20,
      high52w,
      distanceToHigh52wPct,
      distanceToEma200Pct,
      distanceToSma50Pct,
      technicalScore: 0,
      technicalState: 'datos_insuficientes' as const,
      summary: 'Datos insuficientes para calcular estructura tecnica completa.',
    }
  }

  let score = 0
  if (quote.price > ema200) score += 25
  if (quote.price > sma50) score += 20
  if (rsi14 >= 50 && rsi14 <= 70) score += 20
  if (rsi14 > 70 || rsi14 < 30) score -= 10
  if (relativeVolume20 >= 1) score += 20
  if (distanceToHigh52wPct !== null && distanceToHigh52wPct > -10) score += 15

  const technicalScore = Math.max(0, Math.min(100, score))

  let technicalState: TechnicalState = 'neutral'
  if (quote.price > ema200 && quote.price > sma50 && rsi14 >= 50 && rsi14 <= 70 && relativeVolume20 >= 0.9) {
    technicalState = 'fuerte'
  } else if (quote.price < ema200 || rsi14 > 78 || rsi14 < 28) {
    technicalState = 'debil'
  }

  return {
    rsi14,
    rsi7,
    sma50,
    ema200,
    averageVolume20,
    relativeVolume20,
    high52w,
    distanceToHigh52wPct,
    distanceToEma200Pct,
    distanceToSma50Pct,
    technicalScore,
    technicalState,
    summary: buildSummary(technicalState, rsi14, relativeVolume20),
  }
}

export function rsiSeries(closes: number[], period: number): Array<number | null> {
  const values = RSI.calculate({ values: closes, period })
  const padding = Array.from({ length: Math.max(0, closes.length - values.length) }, () => null)
  return [...padding, ...values]
}
