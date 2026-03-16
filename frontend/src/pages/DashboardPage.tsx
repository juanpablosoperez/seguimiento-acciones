import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { ScanFiltersBar } from '../components/filters/ScanFiltersBar'
import { TopWidgets } from '../components/dashboard/TopWidgets'
import { TickerSignalCard } from '../components/cards/TickerSignalCard'
import { ScannerTable } from '../components/tables/ScannerTable'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAlerts } from '../hooks/useResources'
import { useScanner } from '../hooks/useScanner'
import { formatDateTime } from '../lib/utils'
import type { ScanFilters } from '../types/domain'

const defaultFilters: ScanFilters = {
  market: 'Todos',
  sector: 'Todos',
  search: '',
  rsiMin: '',
  rsiMax: '',
  relativeVolumeMin: '',
  technicalState: 'todos',
  ema200Position: 'todos',
  sma50Position: 'todos',
}

export function DashboardPage() {
  const [draftFilters, setDraftFilters] = useState<ScanFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<ScanFilters>(defaultFilters)
  const { rows, allRows, updatedAt, isLoading, isError, error, refetch } = useScanner(appliedFilters)
  const { data: alertsData } = useAlerts()
  const triggeredToday =
    alertsData?.alerts.filter((alert) => alert.lastTriggeredAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length ?? 0

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">Ultima actualizacion</p>
          <p className="text-sm text-slate-100">{updatedAt ? formatDateTime(updatedAt) : 'Sin datos'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Alertas disparadas hoy</p>
          <p className="text-lg font-bold text-white">{triggeredToday}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCsv(rows)}>
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw size={14} /> Recarga manual
          </Button>
        </div>
      </Card>

      {isError ? (
        <Card className="border-danger/40 bg-danger/10 text-sm text-red-200">
          Error consultando API: {error instanceof Error ? error.message : 'Error desconocido'}. Revisa `VITE_API_BASE_URL`.
        </Card>
      ) : null}

      <ScanFiltersBar
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => setAppliedFilters(draftFilters)}
        onClear={() => {
          setDraftFilters(defaultFilters)
          setAppliedFilters(defaultFilters)
        }}
      />

      <TopWidgets rows={rows} />

      <ScannerTable rows={rows} />

      <div>
        <h2 className="mb-2 text-lg font-semibold">Semaforo por ticker</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {allRows.map((row) => (
            <TickerSignalCard key={row.symbol} row={row} />
          ))}
        </div>
      </div>
    </div>
  )
}

function exportCsv(rows: ReturnType<typeof useScanner>['rows']) {
  const headers = [
    'Ticker',
    'Nombre',
    'Mercado',
    'Sector',
    'Precio',
    'VarDiariaPct',
    'RSI14',
    'RSI7',
    'VolRel20',
    'DistEMA200Pct',
    'DistSMA50Pct',
    'DistMax52wPct',
    'Score',
    'Estado',
  ]

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.symbol,
        row.name,
        row.market,
        row.sector,
        row.price,
        row.dailyChangePct,
        row.rsi14,
        row.rsi7,
        row.relativeVolume20,
        row.distanceToEma200Pct,
        row.distanceToSma50Pct,
        row.distanceToHigh52wPct,
        row.technicalScore,
        row.technicalState,
      ]
        .map((value) => `"${String(value ?? '')}"`)
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'scanner.csv'
  link.click()
  URL.revokeObjectURL(url)
}
