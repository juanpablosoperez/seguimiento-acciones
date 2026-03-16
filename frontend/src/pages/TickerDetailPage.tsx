import { useParams } from 'react-router-dom'
import { TickerCharts } from '../components/charts/TickerCharts'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useTicker } from '../hooks/useResources'
import { formatCurrency, formatNumber, toPercent } from '../lib/utils'

export function TickerDetailPage() {
  const { symbol = '' } = useParams()
  const { data, isLoading, isError, error } = useTicker(symbol)

  if (isLoading) return <Card>Cargando detalle...</Card>
  if (isError) return <Card>Error cargando ticker: {error instanceof Error ? error.message : 'Error desconocido'}</Card>
  if (!data) return <Card>Sin datos para {symbol}.</Card>

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white">{data.symbol}</h2>
            <p className="text-sm text-slate-400">{data.name}</p>
          </div>
          <Badge tone={data.technicalState === 'fuerte' ? 'success' : data.technicalState === 'neutral' ? 'warning' : 'danger'}>
            {data.technicalState}
          </Badge>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Metric label="Mercado" value={data.market} />
          <Metric label="Sector" value={data.sector} />
          <Metric label="Precio" value={formatCurrency(data.price, data.currency)} />
          <Metric label="Moneda" value={data.currency} />
          <Metric label="Variacion diaria" value={toPercent(data.dailyChangePct)} />
          <Metric label="RSI14" value={data.rsi14 !== null ? formatNumber(data.rsi14) : '-'} />
          <Metric label="RSI7" value={data.rsi7 !== null ? formatNumber(data.rsi7) : '-'} />
          <Metric label="EMA200" value={data.ema200 !== null ? formatNumber(data.ema200) : '-'} />
          <Metric label="SMA50" value={data.sma50 !== null ? formatNumber(data.sma50) : '-'} />
          <Metric
            label="Dist EMA200"
            value={data.distanceToEma200Pct !== null ? toPercent(data.distanceToEma200Pct) : '-'}
          />
          <Metric
            label="Dist SMA50"
            value={data.distanceToSma50Pct !== null ? toPercent(data.distanceToSma50Pct) : '-'}
          />
          <Metric label="Max 52 semanas" value={data.high52w !== null ? formatNumber(data.high52w) : '-'} />
          <Metric
            label="Dist al max"
            value={data.distanceToHigh52wPct !== null ? toPercent(data.distanceToHigh52wPct) : '-'}
          />
          <Metric label="Volumen actual" value={formatNumber(data.currentVolume, 0)} />
          <Metric
            label="Volumen prom. 20"
            value={data.averageVolume20 !== null ? formatNumber(data.averageVolume20, 0) : '-'}
          />
          <Metric label="Volumen rel 20" value={data.relativeVolume20 !== null ? formatNumber(data.relativeVolume20) : '-'} />
        </div>
      </Card>

      <TickerCharts history={data.history} />

      <Card>
        <h3 className="mb-2 text-sm font-semibold">Interpretacion automatica</h3>
        <ul className="space-y-1 text-sm text-slate-300">
          {data.analysis.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-100">{value}</p>
    </div>
  )
}
