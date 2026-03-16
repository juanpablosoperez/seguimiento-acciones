import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useSettings } from '../hooks/useResources'

export function SettingsPage() {
  const { data, isLoading, isError, error, update } = useSettings()
  const [form, setForm] = useState(data)

  useEffect(() => {
    setForm(data)
  }, [data])

  if (isLoading) return <Card>Cargando configuracion...</Card>
  if (isError) return <Card>Error cargando configuracion: {error instanceof Error ? error.message : 'Error desconocido'}</Card>
  if (!form) return <Card>Sin datos de configuracion.</Card>

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-semibold">Configuracion</h2>
      <div className="grid gap-2 md:grid-cols-2">
        <Input value={form.emailFrom} onChange={(e) => setForm({ ...form, emailFrom: e.target.value })} placeholder="Email remitente" />
        <Select
          value={form.emailProvider}
          onChange={(e) => setForm({ ...form, emailProvider: e.target.value as 'resend' | 'mock' })}
        >
          <option value="mock">Mock</option>
          <option value="resend">Resend</option>
        </Select>
        <Input
          value={String(form.cronIntervalMinutes)}
          onChange={(e) => setForm({ ...form, cronIntervalMinutes: Number(e.target.value) || 15 })}
          placeholder="Intervalo cron"
        />
        <Input
          value={String(form.defaultRsiHigh)}
          onChange={(e) => setForm({ ...form, defaultRsiHigh: Number(e.target.value) || 70 })}
          placeholder="RSI alto por defecto"
        />
        <Input
          value={String(form.defaultRsiLow)}
          onChange={(e) => setForm({ ...form, defaultRsiLow: Number(e.target.value) || 30 })}
          placeholder="RSI bajo por defecto"
        />
        <Select
          value={form.marketProvider}
          onChange={(e) => setForm({ ...form, marketProvider: e.target.value as 'mock' | 'yahoo' })}
        >
          <option value="yahoo">Yahoo Finance (real)</option>
          <option value="mock">Mock</option>
        </Select>
        <Select
          value={form.defaultDashboardMarket}
          onChange={(e) =>
            setForm({ ...form, defaultDashboardMarket: e.target.value as typeof form.defaultDashboardMarket })
          }
        >
          <option value="Todos">Todos</option>
          <option value="CEDEARs">CEDEARs</option>
          <option value="Argentina">Argentina</option>
        </Select>
      </div>
      <Button onClick={() => update.mutate(form)}>Guardar configuracion</Button>
    </Card>
  )
}
