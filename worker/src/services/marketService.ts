import { getSettings } from './kvService'
import { computeIndicators, rsiSeries } from './indicatorService'
import type { AssetQuote, Market, ScannerRow, Sector, TickerDetail, WatchlistItem } from '../types/domain'
import type { Env } from '../types/env'

interface MarketProvider {
  getQuote(symbol: string, market?: Market): Promise<AssetQuote | null>
}

const QUOTE_CACHE_TTL_SECONDS = 120

type AssetMeta = {
  name: string
  sector: Sector
  market: Market
  basePrice: number
  yahooSymbol?: string
}

const companyMap: Record<string, AssetMeta> = {
  AAPL: { name: 'Apple Inc', sector: 'Tecnologia', market: 'CEDEARs', basePrice: 220 },
  MSFT: { name: 'Microsoft Corp', sector: 'Tecnologia', market: 'CEDEARs', basePrice: 420 },
  NVDA: { name: 'NVIDIA Corp', sector: 'Tecnologia', market: 'CEDEARs', basePrice: 860 },
  MELI: { name: 'MercadoLibre', sector: 'Consumo', market: 'CEDEARs', basePrice: 1550 },
  META: { name: 'Meta Platforms', sector: 'Tecnologia', market: 'CEDEARs', basePrice: 510 },
  AMZN: { name: 'Amazon.com', sector: 'Consumo', market: 'CEDEARs', basePrice: 180 },
  KO: { name: 'Coca-Cola', sector: 'Consumo', market: 'CEDEARs', basePrice: 72 },
  XOM: { name: 'Exxon Mobil', sector: 'Energia', market: 'CEDEARs', basePrice: 116 },
  JNJ: { name: 'Johnson & Johnson', sector: 'Consumo', market: 'CEDEARs', basePrice: 160 },
  GGAL: { name: 'Grupo Financiero Galicia', sector: 'Bancos', market: 'Argentina', basePrice: 5800, yahooSymbol: 'GGAL.BA' },
  YPFD: { name: 'YPF', sector: 'Energia', market: 'Argentina', basePrice: 39200, yahooSymbol: 'YPFD.BA' },
  PAMP: { name: 'Pampa Energia', sector: 'Energia', market: 'Argentina', basePrice: 3250, yahooSymbol: 'PAMP.BA' },
  TXAR: { name: 'Ternium Argentina', sector: 'Industria', market: 'Argentina', basePrice: 1350, yahooSymbol: 'TXAR.BA' },
  TGSU2: {
    name: 'Transportadora de Gas del Sur',
    sector: 'Utilities',
    market: 'Argentina',
    basePrice: 2500,
    yahooSymbol: 'TGSU2.BA',
  },
  CEPU: { name: 'Central Puerto', sector: 'Utilities', market: 'Argentina', basePrice: 1820, yahooSymbol: 'CEPU.BA' },
  BYMA: {
    name: 'Bolsas y Mercados Argentinos',
    sector: 'Otros',
    market: 'Argentina',
    basePrice: 4450,
    yahooSymbol: 'BYMA.BA',
  },
  SUPV: { name: 'Grupo Supervielle', sector: 'Bancos', market: 'Argentina', basePrice: 1520, yahooSymbol: 'SUPV.BA' },
  VALO: { name: 'Banco de Valores', sector: 'Bancos', market: 'Argentina', basePrice: 920, yahooSymbol: 'VALO.BA' },
  COME: {
    name: 'Sociedad Comercial del Plata',
    sector: 'Industria',
    market: 'Argentina',
    basePrice: 185,
    yahooSymbol: 'COME.BA',
  },
}

class MockMarketProvider implements MarketProvider {
  async getQuote(symbol: string, market?: Market): Promise<AssetQuote | null> {
    const key = symbol.toUpperCase()
    const base = companyMap[key]
    if (!base && !market) return null

    const resolved =
      base ??
      ({
        name: key,
        sector: 'Otros',
        market: market ?? 'CEDEARs',
        basePrice: 100,
      } satisfies AssetMeta)

    const history = buildMockHistory(resolved.basePrice, key)
    const price = history[history.length - 1].close
    const previous = history[history.length - 2].close

    return {
      symbol: key,
      name: resolved.name,
      market: resolved.market,
      sector: resolved.sector,
      currency: resolved.market === 'Argentina' ? 'ARS' : 'USD',
      price,
      dailyChangePct: ((price - previous) / previous) * 100,
      history,
    }
  }
}

class YahooMarketProvider implements MarketProvider {
  async getQuote(symbol: string, market?: Market): Promise<AssetQuote | null> {
    const key = symbol.toUpperCase()
    const meta = companyMap[key]
    const resolvedMarket = market ?? meta?.market ?? 'CEDEARs'
    const candidates = getYahooCandidates(key, resolvedMarket, meta?.yahooSymbol)

    let result: YahooChartResult | null = null
    for (const yahooSymbol of candidates) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=18mo&interval=1d`
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 CedearScannerAR/1.0',
        },
      })

      if (!response.ok) continue
      const payload = (await response.json()) as YahooChartResponse
      const maybeResult = payload.chart?.result?.[0]
      if (maybeResult?.timestamp?.length) {
        result = maybeResult
        break
      }
    }

    if (!result?.timestamp?.length) return null

    const closes = result.indicators?.quote?.[0]?.close ?? []
    const volumes = result.indicators?.quote?.[0]?.volume ?? []

    const history: AssetQuote['history'] = []
    for (let index = 0; index < result.timestamp.length; index += 1) {
      const close = closes[index]
      const volume = volumes[index]
      if (close === null || close === undefined) continue
      history.push({
        timestamp: new Date(result.timestamp[index] * 1000).toISOString(),
        close: Number(close.toFixed(2)),
        volume: Number(volume ?? 0),
      })
    }

    if (history.length < 30) return null

    const price = Number((result.meta.regularMarketPrice ?? history.at(-1)?.close ?? 0).toFixed(2))
    const previous = Number((result.meta.previousClose ?? history.at(-2)?.close ?? history.at(-1)?.close ?? 1).toFixed(2))
    if (!price || !previous) return null

    return {
      symbol: key,
      name: result.meta.longName ?? result.meta.shortName ?? meta?.name ?? key,
      market: resolvedMarket,
      sector: meta?.sector ?? 'Otros',
      currency: result.meta.currency ?? (resolvedMarket === 'Argentina' ? 'ARS' : 'USD'),
      price,
      dailyChangePct: ((price - previous) / previous) * 100,
      history,
    }
  }
}

export async function buildScanRows(env: Env, items: WatchlistItem[], alertSymbols = new Set<string>()): Promise<ScannerRow[]> {
  const provider = await getProvider(env)

  const rows = await Promise.all(
    items.map(async (item) => {
      const quote = await provider.getQuote(item.symbol, item.market)
      const safeQuote = quote ?? (await new MockMarketProvider().getQuote(item.symbol, item.market))
      if (!safeQuote) return null

      const indicators = computeIndicators(safeQuote)
      return {
        symbol: safeQuote.symbol,
        name: safeQuote.name,
        market: safeQuote.market,
        sector: safeQuote.sector,
        currency: safeQuote.currency,
        price: safeQuote.price,
        dailyChangePct: safeQuote.dailyChangePct,
        rsi14: indicators.rsi14,
        rsi7: indicators.rsi7,
        ema200: indicators.ema200,
        sma50: indicators.sma50,
        relativeVolume20: indicators.relativeVolume20,
        distanceToEma200Pct: indicators.distanceToEma200Pct,
        distanceToSma50Pct: indicators.distanceToSma50Pct,
        high52w: indicators.high52w,
        distanceToHigh52wPct: indicators.distanceToHigh52wPct,
        technicalScore: indicators.technicalScore,
        technicalState: indicators.technicalState,
        alertActive: alertSymbols.has(safeQuote.symbol),
        summary: indicators.summary,
      } satisfies ScannerRow
    }),
  )

  return rows.filter((row): row is ScannerRow => row !== null)
}

export async function buildTickerDetail(env: Env, symbol: string): Promise<TickerDetail | null> {
  const provider = await getProvider(env)
  const quote = await provider.getQuote(symbol)
  const safeQuote = quote ?? (await new MockMarketProvider().getQuote(symbol))
  if (!safeQuote) return null

  const indicators = computeIndicators(safeQuote)
  const closes = safeQuote.history.map((point) => point.close)
  const rsi14Series = rsiSeries(closes, 14)

  const analysis = [
    safeQuote.price > (indicators.ema200 ?? Number.POSITIVE_INFINITY)
      ? 'El activo cotiza por encima de EMA200, con sesgo de tendencia positiva.'
      : 'El activo cotiza por debajo de EMA200, con estructura de largo plazo debil.',
    safeQuote.price > (indicators.sma50 ?? Number.POSITIVE_INFINITY)
      ? 'El precio se mantiene por encima de SMA50 en el corto/mediano plazo.'
      : 'El precio esta debajo de SMA50 y requiere recuperacion tactica.',
    indicators.rsi14 !== null && indicators.rsi14 > 70
      ? 'RSI en zona alta, posible extension de corto plazo.'
      : 'RSI en zona no extrema por ahora.',
    indicators.relativeVolume20 !== null && indicators.relativeVolume20 < 0.9
      ? 'Volumen relativo bajo, movimiento con menor confirmacion.'
      : 'Volumen relativo aceptable para validar el movimiento.',
  ]

  return {
    symbol: safeQuote.symbol,
    name: safeQuote.name,
    market: safeQuote.market,
    sector: safeQuote.sector,
    currency: safeQuote.currency,
    price: safeQuote.price,
    dailyChangePct: safeQuote.dailyChangePct,
    rsi14: indicators.rsi14,
    rsi7: indicators.rsi7,
    ema200: indicators.ema200,
    sma50: indicators.sma50,
    relativeVolume20: indicators.relativeVolume20,
    distanceToEma200Pct: indicators.distanceToEma200Pct,
    distanceToSma50Pct: indicators.distanceToSma50Pct,
    high52w: indicators.high52w,
    distanceToHigh52wPct: indicators.distanceToHigh52wPct,
    technicalScore: indicators.technicalScore,
    technicalState: indicators.technicalState,
    alertActive: false,
    summary: indicators.summary,
    currentVolume: safeQuote.history.at(-1)?.volume ?? 0,
    averageVolume20: indicators.averageVolume20,
    history: safeQuote.history.map((point, index) => ({
      ...point,
      rsi14: rsi14Series[index],
    })),
    analysis,
  }
}

async function getProvider(env: Env): Promise<MarketProvider> {
  const settings = await getSettings(env)
  const base = settings.marketProvider === 'yahoo' ? new YahooMarketProvider() : new MockMarketProvider()
  return new CachedMarketProvider(env, settings.marketProvider, base)
}

class CachedMarketProvider implements MarketProvider {
  constructor(
    private readonly env: Env,
    private readonly providerKey: string,
    private readonly baseProvider: MarketProvider,
  ) {}

  async getQuote(symbol: string, market?: Market): Promise<AssetQuote | null> {
    const cacheKey = this.buildCacheKey(symbol, market)
    const cached = await this.env.APP_KV.get(cacheKey, { type: 'json' })
    if (cached) return cached as AssetQuote

    const quote = await this.baseProvider.getQuote(symbol, market)
    if (!quote) return null

    await this.env.APP_KV.put(cacheKey, JSON.stringify(quote), {
      expirationTtl: QUOTE_CACHE_TTL_SECONDS,
    })

    return quote
  }

  private buildCacheKey(symbol: string, market?: Market): string {
    return `quote:${this.providerKey}:${(market ?? 'na').toLowerCase()}:${symbol.toUpperCase()}`
  }
}

function getYahooCandidates(symbol: string, market: Market, explicit?: string): string[] {
  if (explicit) return [explicit, symbol]

  if (market === 'Argentina') {
    const ba = symbol.endsWith('.BA') ? symbol : `${symbol}.BA`
    return [ba, symbol]
  }

  if (market === 'CEDEARs') {
    return [symbol]
  }

  return [symbol]
}

function buildMockHistory(basePrice: number, seedSource: string) {
  const seed = seedSource.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  let price = basePrice
  const points: AssetQuote['history'] = []
  const now = Date.now()

  for (let i = 320; i > 0; i -= 1) {
    const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString()
    const drift = Math.sin((seed + i) / 17) * 0.02
    const noise = Math.cos((seed + i) / 9) * 0.01
    price = Math.max(1, price * (1 + drift + noise))
    const volume = Math.floor(100_000 + Math.abs(Math.sin((seed + i) / 5)) * 800_000)
    points.push({ timestamp, close: Number(price.toFixed(2)), volume })
  }

  return points
}

type YahooChartResponse = {
  chart?: {
    result?: YahooChartResult[]
  }
}

type YahooChartResult = {
  timestamp: number[]
  indicators: {
    quote: Array<{
      close: Array<number | null>
      volume: Array<number | null>
    }>
  }
  meta: {
    regularMarketPrice?: number
    previousClose?: number
    currency?: string
    longName?: string
    shortName?: string
  }
}
