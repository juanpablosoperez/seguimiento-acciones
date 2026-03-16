export type Market = 'CEDEARs' | 'Argentina'

export type Sector =
  | 'Bancos'
  | 'Energia'
  | 'Tecnologia'
  | 'Consumo'
  | 'Utilities'
  | 'ETF'
  | 'Industria'
  | 'Otros'

export type TechnicalState = 'fuerte' | 'neutral' | 'debil' | 'datos_insuficientes'

export interface HistoricalPoint {
  timestamp: string
  close: number
  volume: number
}

export interface AssetQuote {
  symbol: string
  name: string
  market: Market
  sector: Sector
  currency: string
  price: number
  dailyChangePct: number
  history: HistoricalPoint[]
}

export interface ScannerRow {
  symbol: string
  name: string
  market: Market
  sector: Sector
  currency: string
  price: number
  dailyChangePct: number
  rsi14: number | null
  rsi7: number | null
  ema200: number | null
  sma50: number | null
  relativeVolume20: number | null
  distanceToEma200Pct: number | null
  distanceToSma50Pct: number | null
  high52w: number | null
  distanceToHigh52wPct: number | null
  technicalScore: number
  technicalState: TechnicalState
  alertActive: boolean
  summary: string
}

export interface TickerDetail extends ScannerRow {
  currentVolume: number
  averageVolume20: number | null
  history: Array<HistoricalPoint & { rsi14: number | null }>
  analysis: string[]
}

export interface WatchlistItem {
  symbol: string
  market: Market
  favorite: boolean
}

export type AlertConditionType =
  | 'rsi_gt'
  | 'rsi_lt'
  | 'price_gt'
  | 'price_lt'
  | 'cross_above_ema200'
  | 'cross_below_ema200'
  | 'cross_above_sma50'
  | 'cross_below_sma50'
  | 'relative_volume_gt'

export interface AlertRule {
  id: string
  symbol: string
  tickerName: string
  condition: AlertConditionType
  targetValue: number | null
  destinationEmail: string
  active: boolean
  createdAt: string
  lastTriggeredAt: string | null
  cooldownMinutes: number
  currentlyInCondition?: boolean
}

export interface AppSettings {
  emailFrom: string
  emailProvider: 'resend' | 'mock'
  cronIntervalMinutes: number
  defaultRsiHigh: number
  defaultRsiLow: number
  marketProvider: 'mock' | 'yahoo'
  defaultDashboardMarket: 'Todos' | Market
  compactCards: boolean
}
