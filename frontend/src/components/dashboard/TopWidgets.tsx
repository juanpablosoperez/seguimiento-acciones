import type { ScannerRow } from '../../types/domain'
import { Card } from '../ui/Card'

interface TopWidgetsProps {
  rows: ScannerRow[]
}

export function TopWidgets({ rows }: TopWidgetsProps) {
  const topRsi = [...rows].filter((r) => r.rsi14 !== null).sort((a, b) => (b.rsi14 ?? 0) - (a.rsi14 ?? 0)).slice(0, 5)
  const topStrong = [...rows].sort((a, b) => b.technicalScore - a.technicalScore).slice(0, 5)
  const nearBreakout = [...rows]
    .filter((r) => r.distanceToHigh52wPct !== null)
    .sort((a, b) => Math.abs(a.distanceToHigh52wPct ?? 0) - Math.abs(b.distanceToHigh52wPct ?? 0))
    .slice(0, 5)

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Widget title="Top RSI alto" items={topRsi.map((r) => `${r.symbol} (${(r.rsi14 ?? 0).toFixed(1)})`)} />
      <Widget title="Top mas fuertes" items={topStrong.map((r) => `${r.symbol} (${r.technicalScore.toFixed(0)})`)} />
      <Widget title="Cerca de breakout" items={nearBreakout.map((r) => `${r.symbol} (${(r.distanceToHigh52wPct ?? 0).toFixed(1)}%)`)} />
    </div>
  )
}

function Widget({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-1 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  )
}
