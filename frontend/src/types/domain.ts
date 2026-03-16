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

export interface HistoricalPoint {
  timestamp: string
  close: number
  volume: number
  rsi14: number | null
}

export interface TickerDetail extends ScannerRow {
  currentVolume: number
  averageVolume20: number | null
  history: HistoricalPoint[]
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

export interface ScanFilters {
  market: 'Todos' | Market
  sector: 'Todos' | Sector
  search: string
  rsiMin: string
  rsiMax: string
  relativeVolumeMin: string
  technicalState: 'todos' | TechnicalState
  ema200Position: 'todos' | 'above' | 'below'
  sma50Position: 'todos' | 'above' | 'below'
}

export interface ScanResponse {
  updatedAt: string
  rows: ScannerRow[]
}
