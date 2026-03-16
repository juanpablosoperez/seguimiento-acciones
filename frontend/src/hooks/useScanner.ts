import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchScan } from '../api/client'
import type { ScanFilters, ScannerRow } from '../types/domain'

export function useScanner(filters: ScanFilters) {
  const query = useQuery({ queryKey: ['scan'], queryFn: fetchScan, refetchInterval: 90_000 })
  const allRows = query.data?.rows ?? []

  const rows = useMemo(() => {
    if (!query.data) return []
    return query.data.rows.filter((row) => filterRow(row, filters))
  }, [query.data, filters])

  return {
    ...query,
    allRows,
    rows,
    updatedAt: query.data?.updatedAt,
  }
}

function filterRow(row: ScannerRow, filters: ScanFilters): boolean {
  if (filters.market !== 'Todos' && row.market !== filters.market) return false
  if (filters.sector !== 'Todos' && row.sector !== filters.sector) return false
  if (filters.search && !row.symbol.toLowerCase().includes(filters.search.toLowerCase())) return false

  const rsiMin = toOptionalNumber(filters.rsiMin)
  if (!Number.isNaN(rsiMin) && row.rsi14 !== null && row.rsi14 < rsiMin) return false

  const rsiMax = toOptionalNumber(filters.rsiMax)
  if (!Number.isNaN(rsiMax) && row.rsi14 !== null && row.rsi14 > rsiMax) return false

  const volumeMin = toOptionalNumber(filters.relativeVolumeMin)
  if (!Number.isNaN(volumeMin) && row.relativeVolume20 !== null && row.relativeVolume20 < volumeMin) {
    return false
  }

  if (filters.technicalState !== 'todos' && row.technicalState !== filters.technicalState) return false

  if (filters.ema200Position !== 'todos' && row.distanceToEma200Pct !== null) {
    if (filters.ema200Position === 'above' && row.distanceToEma200Pct < 0) return false
    if (filters.ema200Position === 'below' && row.distanceToEma200Pct > 0) return false
  }

  if (filters.sma50Position !== 'todos' && row.distanceToSma50Pct !== null) {
    if (filters.sma50Position === 'above' && row.distanceToSma50Pct < 0) return false
    if (filters.sma50Position === 'below' && row.distanceToSma50Pct > 0) return false
  }

  return true
}

function toOptionalNumber(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return Number.NaN
  return Number(trimmed)
}
