import { Link } from 'react-router-dom'
import { formatCurrency, formatNumber, toPercent } from '../../lib/utils'
import type { ScannerRow } from '../../types/domain'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

interface TickerSignalCardProps {
  row: ScannerRow
}

export function TickerSignalCard({ row }: TickerSignalCardProps) {
  const tone = row.technicalState === 'fuerte' ? 'success' : row.technicalState === 'neutral' ? 'warning' : 'danger'
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">{row.symbol}</h3>
          <p className="text-xs text-slate-400">{row.name}</p>
        </div>
        <Badge tone={tone}>{row.technicalState}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Precio</p>
          <p className="font-semibold">{formatCurrency(row.price, row.currency)}</p>
        </div>
        <div>
          <p className="text-slate-400">Score</p>
          <p className="font-semibold">{formatNumber(row.technicalScore, 0)}</p>
        </div>
        <div>
          <p className="text-slate-400">EMA200%</p>
          <p>{row.distanceToEma200Pct !== null ? toPercent(row.distanceToEma200Pct) : '-'}</p>
        </div>
        <div>
          <p className="text-slate-400">SMA50%</p>
          <p>{row.distanceToSma50Pct !== null ? toPercent(row.distanceToSma50Pct) : '-'}</p>
        </div>
        <div>
          <p className="text-slate-400">RSI14</p>
          <p>{row.rsi14 !== null ? formatNumber(row.rsi14) : '-'}</p>
        </div>
        <div>
          <p className="text-slate-400">Vol Rel</p>
          <p>{row.relativeVolume20 !== null ? formatNumber(row.relativeVolume20) : '-'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge tone="muted">{row.sector}</Badge>
        <Link
          to={`/ticker/${row.symbol}`}
          className="inline-flex h-8 items-center rounded-lg border border-border px-2 text-xs font-semibold text-slate-200 transition hover:bg-muted/30"
        >
          Ver detalle
        </Link>
      </div>
      <p className="text-xs text-slate-300">{row.summary}</p>
    </Card>
  )
}
