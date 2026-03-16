import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import type { ScanFilters } from '../../types/domain'

interface ScanFiltersBarProps {
  filters: ScanFilters
  onChange: (filters: ScanFilters) => void
  onApply: () => void
  onClear: () => void
}

const sectors = ['Todos', 'Bancos', 'Energia', 'Tecnologia', 'Consumo', 'Utilities', 'ETF', 'Industria', 'Otros']

export function ScanFiltersBar({ filters, onChange, onApply, onClear }: ScanFiltersBarProps) {
  return (
    <div className="grid gap-2 rounded-2xl border border-border bg-card/70 p-3 md:grid-cols-6">
      <Select value={filters.market} onChange={(e) => onChange({ ...filters, market: e.target.value as ScanFilters['market'] })}>
        <option value="Todos">Todos</option>
        <option value="CEDEARs">CEDEARs</option>
        <option value="Argentina">Argentina</option>
      </Select>

      <Select value={filters.sector} onChange={(e) => onChange({ ...filters, sector: e.target.value as ScanFilters['sector'] })}>
        {sectors.map((sector) => (
          <option key={sector} value={sector}>
            {sector}
          </option>
        ))}
      </Select>

      <Input placeholder="Ticker" value={filters.search} onChange={(e) => onChange({ ...filters, search: e.target.value })} />
      <Input placeholder="RSI min" value={filters.rsiMin} onChange={(e) => onChange({ ...filters, rsiMin: e.target.value })} />
      <Input placeholder="RSI max" value={filters.rsiMax} onChange={(e) => onChange({ ...filters, rsiMax: e.target.value })} />
      <Input
        placeholder="Volumen rel min"
        value={filters.relativeVolumeMin}
        onChange={(e) => onChange({ ...filters, relativeVolumeMin: e.target.value })}
      />

      <Select
        value={filters.technicalState}
        onChange={(e) => onChange({ ...filters, technicalState: e.target.value as ScanFilters['technicalState'] })}
      >
        <option value="todos">Estado tecnico: todos</option>
        <option value="fuerte">fuerte</option>
        <option value="neutral">neutral</option>
        <option value="debil">debil</option>
      </Select>

      <Select
        value={filters.ema200Position}
        onChange={(e) => onChange({ ...filters, ema200Position: e.target.value as ScanFilters['ema200Position'] })}
      >
        <option value="todos">EMA200: todos</option>
        <option value="above">Arriba EMA200</option>
        <option value="below">Debajo EMA200</option>
      </Select>

      <Select
        value={filters.sma50Position}
        onChange={(e) => onChange({ ...filters, sma50Position: e.target.value as ScanFilters['sma50Position'] })}
      >
        <option value="todos">SMA50: todos</option>
        <option value="above">Arriba SMA50</option>
        <option value="below">Debajo SMA50</option>
      </Select>

      <div className="md:col-span-3 flex gap-2">
        <Button variant="outline" onClick={onApply}>
          Aplicar filtros
        </Button>
        <Button variant="ghost" onClick={onClear}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}
