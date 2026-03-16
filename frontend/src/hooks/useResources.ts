import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addWatchlistItem,
  createAlert,
  deleteAlert,
  deleteWatchlistItem,
  fetchAlerts,
  fetchSettings,
  fetchTicker,
  fetchWatchlist,
  runAlertCheck,
  updateWatchlistItem,
  updateAlert,
  updateSettings,
} from '../api/client'
import type { AlertRule, AppSettings, WatchlistItem } from '../types/domain'

export function useTicker(symbol: string) {
  return useQuery({ queryKey: ['ticker', symbol], queryFn: () => fetchTicker(symbol), enabled: !!symbol })
}

export function useWatchlist() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['watchlist'], queryFn: fetchWatchlist })

  const add = useMutation({
    mutationFn: (item: WatchlistItem) => addWatchlistItem(item),
    onSuccess: () => client.invalidateQueries({ queryKey: ['watchlist'] }),
  })

  const remove = useMutation({
    mutationFn: (symbol: string) => deleteWatchlistItem(symbol),
    onSuccess: () => client.invalidateQueries({ queryKey: ['watchlist'] }),
  })

  const update = useMutation({
    mutationFn: ({ symbol, payload }: { symbol: string; payload: Partial<WatchlistItem> }) =>
      updateWatchlistItem(symbol, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ['watchlist'] }),
  })

  return { ...query, add, remove, update }
}

export function useAlerts() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['alerts'], queryFn: fetchAlerts })

  const create = useMutation({
    mutationFn: (payload: Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggeredAt'>) => createAlert(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AlertRule> }) => updateAlert(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const checkNow = useMutation({ mutationFn: runAlertCheck })

  return { ...query, create, update, remove, checkNow }
}

export function useSettings() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const update = useMutation({
    mutationFn: (payload: AppSettings) => updateSettings(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ['settings'] }),
  })
  return { ...query, update }
}
