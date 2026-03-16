import type { AlertRule, AppSettings, WatchlistItem } from '../types/domain'
import type { Env } from '../types/env'

const WATCHLIST_KEY = 'watchlist'
const ALERTS_KEY = 'alerts'
const SETTINGS_KEY = 'settings'

const defaultWatchlist: WatchlistItem[] = [
  { symbol: 'AAPL', market: 'CEDEARs', favorite: true },
  { symbol: 'MSFT', market: 'CEDEARs', favorite: false },
  { symbol: 'NVDA', market: 'CEDEARs', favorite: true },
  { symbol: 'MELI', market: 'CEDEARs', favorite: true },
  { symbol: 'META', market: 'CEDEARs', favorite: false },
  { symbol: 'AMZN', market: 'CEDEARs', favorite: false },
  { symbol: 'KO', market: 'CEDEARs', favorite: false },
  { symbol: 'XOM', market: 'CEDEARs', favorite: false },
  { symbol: 'JNJ', market: 'CEDEARs', favorite: false },
  { symbol: 'GGAL', market: 'Argentina', favorite: true },
  { symbol: 'YPFD', market: 'Argentina', favorite: true },
  { symbol: 'PAMP', market: 'Argentina', favorite: false },
  { symbol: 'TXAR', market: 'Argentina', favorite: false },
  { symbol: 'TGSU2', market: 'Argentina', favorite: false },
  { symbol: 'CEPU', market: 'Argentina', favorite: false },
  { symbol: 'BYMA', market: 'Argentina', favorite: false },
  { symbol: 'SUPV', market: 'Argentina', favorite: false },
  { symbol: 'VALO', market: 'Argentina', favorite: false },
  { symbol: 'COME', market: 'Argentina', favorite: false },
]

const defaultSettings: AppSettings = {
  emailFrom: 'scanner@cedear-ar.app',
  emailProvider: 'mock',
  cronIntervalMinutes: 15,
  defaultRsiHigh: 70,
  defaultRsiLow: 30,
  marketProvider: 'yahoo',
  defaultDashboardMarket: 'Todos',
  compactCards: false,
}

export async function getWatchlist(env: Env): Promise<WatchlistItem[]> {
  const data = await env.APP_KV.get(WATCHLIST_KEY, { type: 'json' })
  if (data) return data as WatchlistItem[]
  await env.APP_KV.put(WATCHLIST_KEY, JSON.stringify(defaultWatchlist))
  return defaultWatchlist
}

export async function setWatchlist(env: Env, items: WatchlistItem[]): Promise<void> {
  await env.APP_KV.put(WATCHLIST_KEY, JSON.stringify(items))
}

export async function getAlerts(env: Env): Promise<AlertRule[]> {
  const data = await env.APP_KV.get(ALERTS_KEY, { type: 'json' })
  if (data) return data as AlertRule[]
  await env.APP_KV.put(ALERTS_KEY, JSON.stringify([]))
  return []
}

export async function setAlerts(env: Env, alerts: AlertRule[]): Promise<void> {
  await env.APP_KV.put(ALERTS_KEY, JSON.stringify(alerts))
}

export async function getSettings(env: Env): Promise<AppSettings> {
  const data = await env.APP_KV.get(SETTINGS_KEY, { type: 'json' })
  if (data) return data as AppSettings
  await env.APP_KV.put(SETTINGS_KEY, JSON.stringify(defaultSettings))
  return defaultSettings
}

export async function setSettings(env: Env, settings: AppSettings): Promise<void> {
  await env.APP_KV.put(SETTINGS_KEY, JSON.stringify(settings))
}
