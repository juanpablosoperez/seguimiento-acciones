import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useAlerts } from '../hooks/useResources'
import { formatDateTime } from '../lib/utils'
import type { AlertConditionType } from '../types/domain'

const conditions: Array<{ value: AlertConditionType; label: string; numeric: boolean }> = [
  { value: 'rsi_gt', label: 'RSI mayor a X', numeric: true },
  { value: 'rsi_lt', label: 'RSI menor a X', numeric: true },
  { value: 'price_gt', label: 'Precio mayor a X', numeric: true },
  { value: 'price_lt', label: 'Precio menor a X', numeric: true },
  { value: 'cross_above_ema200', label: 'Cruce arriba EMA200', numeric: false },
  { value: 'cross_below_ema200', label: 'Cruce abajo EMA200', numeric: false },
  { value: 'cross_above_sma50', label: 'Cruce arriba SMA50', numeric: false },
  { value: 'cross_below_sma50', label: 'Cruce abajo SMA50', numeric: false },
  { value: 'relative_volume_gt', label: 'Volumen relativo mayor a X', numeric: true },
]

export function AlertsPage() {
  const { data, create, remove, update, checkNow } = useAlerts()
  const triggeredToday =
    data?.alerts.filter((alert) => alert.lastTriggeredAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length ?? 0
  const [form, setForm] = useState({
    symbol: 'AAPL',
    tickerName: 'Apple',
    condition: 'rsi_gt' as AlertConditionType,
    targetValue: '70',
    destinationEmail: '',
    cooldownMinutes: '120',
  })

  const conditionMeta = conditions.find((c) => c.value === form.condition)

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs text-slate-400">Alertas disparadas hoy</p>
        <p className="text-2xl font-bold text-white">{triggeredToday}</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Nueva alerta</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} placeholder="Ticker" />
          <Input value={form.tickerName} onChange={(e) => setForm({ ...form, tickerName: e.target.value })} placeholder="Nombre" />
          <Select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as AlertConditionType })}>
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </Select>
          <Input
            value={form.targetValue}
            onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
            placeholder="Valor objetivo"
            disabled={!conditionMeta?.numeric}
          />
          <Input
            value={form.destinationEmail}
            onChange={(e) => setForm({ ...form, destinationEmail: e.target.value })}
            placeholder="Email destino"
          />
          <Input
            value={form.cooldownMinutes}
            onChange={(e) => setForm({ ...form, cooldownMinutes: e.target.value })}
            placeholder="Cooldown minutos"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              create.mutate({
                symbol: form.symbol,
                tickerName: form.tickerName,
                condition: form.condition,
                targetValue: conditionMeta?.numeric ? Number(form.targetValue) : null,
                destinationEmail: form.destinationEmail,
                active: true,
                cooldownMinutes: Number(form.cooldownMinutes) || 60,
              })
            }
          >
            Crear alerta
          </Button>
          <Button variant="outline" onClick={() => checkNow.mutate()}>
            Ejecutar chequeo ahora
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold">Alertas activas</h3>
        <div className="space-y-2">
          {data?.alerts.map((alert) => (
            <div key={alert.id} className="flex flex-col gap-2 rounded-xl border border-border p-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <p className="font-semibold text-white">
                  {alert.symbol} - {alert.condition}
                </p>
                <p className="text-slate-400">{alert.destinationEmail}</p>
                <p className="text-slate-500">
                  Ultimo disparo: {alert.lastTriggeredAt ? formatDateTime(alert.lastTriggeredAt) : 'nunca'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    update.mutate({ id: alert.id, payload: { active: !alert.active } })
                  }
                >
                  {alert.active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button variant="danger" onClick={() => remove.mutate(alert.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
