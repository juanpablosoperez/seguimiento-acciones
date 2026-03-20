import { z } from 'zod'
import type {
  AlertRule,
  AppSettings,
  ScanResponse,
  TickerDetail,
  WatchlistItem,
} from '../types/domain'

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim()

const API_BASE =
  configuredApiBase && configuredApiBase.length > 0
    ? configuredApiBase.replace(/\/$/, '')
    : typeof window !== 'undefined' && isLocalHost(window.location.hostname)
      ? '/api'
      : 'https://cedear-scanner-ar-api.seguimiento-inversiones.workers.dev/api'

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const raw = await response.text()
    throw new Error(`Respuesta no JSON desde ${url}. Verifica VITE_API_BASE_URL. Primeros bytes: ${raw.slice(0, 80)}`)
  }

  return response.json() as Promise<T>
}

const scanSchema = z.object({
  updatedAt: z.string(),
  rows: z.array(z.any()),
})

export async function fetchScan(): Promise<ScanResponse> {
  const data = await request<ScanResponse>('/scan')
  scanSchema.parse(data)
  return data
}

export function fetchTicker(symbol: string) {
  return request<TickerDetail>(`/ticker/${symbol}`)
}

export function fetchWatchlist() {
  return request<{ items: WatchlistItem[] }>('/watchlist')
}

export function addWatchlistItem(item: WatchlistItem) {
  return request<{ items: WatchlistItem[] }>('/watchlist', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export function deleteWatchlistItem(symbol: string) {
  return request<{ items: WatchlistItem[] }>(`/watchlist/${symbol}`, {
    method: 'DELETE',
  })
}

export function updateWatchlistItem(symbol: string, payload: Partial<WatchlistItem>) {
  return request<{ items: WatchlistItem[] }>(`/watchlist/${symbol}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function fetchAlerts() {
  return request<{ alerts: AlertRule[] }>('/alerts')
}

export function createAlert(payload: Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggeredAt'>) {
  return request<{ alerts: AlertRule[] }>('/alerts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAlert(id: string, payload: Partial<AlertRule>) {
  return request<{ alerts: AlertRule[] }>(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAlert(id: string) {
  return request<{ alerts: AlertRule[] }>(`/alerts/${id}`, {
    method: 'DELETE',
  })
}

export function fetchSettings() {
  return request<AppSettings>('/settings')
}

export function updateSettings(payload: AppSettings) {
  return request<AppSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function runAlertCheck() {
  return request<{ checkedAt: string; triggered: number }>('/check-alerts', {
    method: 'POST',
  })
}
