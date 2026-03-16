import { ArrowUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn, formatCurrency, formatNumber, toPercent } from '../../lib/utils'
import type { ScannerRow } from '../../types/domain'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface ScannerTableProps {
  rows: ScannerRow[]
}

type SortKey = keyof ScannerRow

export function ScannerTable({ rows }: ScannerTableProps) {
  const navigate = useNavigate()
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'technicalScore',
    direction: 'desc',
  })
  const [page, setPage] = useState(1)
  const pageSize = 12

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = a[sort.key]
      const bVal = b[sort.key]
      const sign = sort.direction === 'asc' ? 1 : -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * sign
      }
      return String(aVal).localeCompare(String(bVal)) * sign
    })
  }, [rows, sort])

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))

  const setSortBy = (key: SortKey) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-2">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              {[
                ['symbol', 'Ticker'],
                ['name', 'Nombre'],
                ['market', 'Mercado'],
                ['sector', 'Sector'],
                ['price', 'Precio'],
                ['dailyChangePct', 'Var %'],
                ['rsi14', 'RSI14'],
                ['rsi7', 'RSI7'],
                ['relativeVolume20', 'Vol Rel'],
                ['distanceToEma200Pct', 'Dist EMA200 %'],
                ['distanceToSma50Pct', 'Dist SMA50 %'],
                ['high52w', 'Max 52w'],
                ['distanceToHigh52wPct', 'Dist Max52 %'],
                ['technicalScore', 'Score'],
                ['technicalState', 'Estado'],
                ['alertActive', 'Alerta'],
              ].map(([key, label]) => (
                <th key={key} className="px-3 py-2">
                  <button className="inline-flex items-center gap-1" onClick={() => setSortBy(key as SortKey)}>
                    {label}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr
                key={row.symbol}
                className="cursor-pointer border-t border-border/60 text-slate-100 transition hover:bg-muted/25"
                onClick={() => navigate(`/ticker/${row.symbol}`)}
              >
                <td className="px-3 py-2 font-semibold">
                  <Link
                    to={`/ticker/${row.symbol}`}
                    className="text-primary hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {row.symbol}
                  </Link>
                </td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">
                  <Badge tone="muted">{row.market}</Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge tone="muted">{row.sector}</Badge>
                </td>
                <td className="px-3 py-2">{formatCurrency(row.price, row.currency)}</td>
                <td className={cn('px-3 py-2', row.dailyChangePct >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {toPercent(row.dailyChangePct)}
                </td>
                <td className={cn('px-3 py-2', rsiTone(row.rsi14))}>{row.rsi14 !== null ? formatNumber(row.rsi14) : '-'}</td>
                <td className={cn('px-3 py-2', rsiTone(row.rsi7))}>{row.rsi7 !== null ? formatNumber(row.rsi7) : '-'}</td>
                <td className="px-3 py-2">{row.relativeVolume20 !== null ? formatNumber(row.relativeVolume20) : '-'}</td>
                <td className={cn('px-3 py-2', signedTone(row.distanceToEma200Pct))}>
                  {row.distanceToEma200Pct !== null ? toPercent(row.distanceToEma200Pct) : '-'}
                </td>
                <td className={cn('px-3 py-2', signedTone(row.distanceToSma50Pct))}>
                  {row.distanceToSma50Pct !== null ? toPercent(row.distanceToSma50Pct) : '-'}
                </td>
                <td className="px-3 py-2">{row.high52w !== null ? formatNumber(row.high52w) : '-'}</td>
                <td className="px-3 py-2">{row.distanceToHigh52wPct !== null ? toPercent(row.distanceToHigh52wPct) : '-'}</td>
                <td className="px-3 py-2">
                  <Badge tone={row.technicalScore > 70 ? 'success' : row.technicalScore > 40 ? 'warning' : 'danger'}>
                    {formatNumber(row.technicalScore, 0)}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge
                    tone={
                      row.technicalState === 'fuerte'
                        ? 'success'
                        : row.technicalState === 'neutral'
                          ? 'warning'
                          : row.technicalState === 'datos_insuficientes'
                            ? 'muted'
                            : 'danger'
                    }
                  >
                    {row.technicalState}
                  </Badge>
                </td>
                <td className="px-3 py-2">{row.alertActive ? <Badge tone="warning">Activa</Badge> : <Badge tone="muted">No</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-2 py-3 text-xs text-slate-400">
        <span>
          Pagina {page} de {pages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(pages, p + 1))}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

function rsiTone(value: number | null): string {
  if (value === null) return 'text-slate-300'
  if (value >= 70) return 'text-red-300'
  if (value >= 60) return 'text-amber-300'
  if (value >= 40) return 'text-yellow-300'
  return 'text-emerald-300'
}

function signedTone(value: number | null): string {
  if (value === null) return 'text-slate-300'
  return value >= 0 ? 'text-emerald-400' : 'text-red-400'
}
