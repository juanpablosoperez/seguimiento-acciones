import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  ComposedChart,
} from 'recharts'
import type { HistoricalPoint } from '../../types/domain'
import { Card } from '../ui/Card'

interface TickerChartsProps {
  history: HistoricalPoint[]
}

export function TickerCharts({ history }: TickerChartsProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-sm font-semibold">Precio historico</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3243" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} hide />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="close" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-sm font-semibold">RSI y volumen</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3243" />
              <XAxis dataKey="timestamp" hide />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="rsi14" stroke="#fbbf24" dot={false} strokeWidth={2} />
              <Bar yAxisId="right" dataKey="volume" fill="#34d399" opacity={0.3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
