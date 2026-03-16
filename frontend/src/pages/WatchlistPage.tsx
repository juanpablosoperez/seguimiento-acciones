import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useWatchlist } from '../hooks/useResources'
import type { Market } from '../types/domain'

export function WatchlistPage() {
  const { data, isLoading, add, remove, update } = useWatchlist()
  const [symbol, setSymbol] = useState('')
  const [market, setMarket] = useState<Market>('CEDEARs')

  if (isLoading || !data) return <Card>Cargando watchlist...</Card>

  const groups = [
    { key: 'CEDEARs', title: 'CEDEARs', items: data.items.filter((item) => item.market === 'CEDEARs') },
    { key: 'Argentina', title: 'Argentina', items: data.items.filter((item) => item.market === 'Argentina') },
    { key: 'Favoritos', title: 'Favoritos', items: data.items.filter((item) => item.favorite) },
  ]

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Gestion de watchlist</h2>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Ticker" />
          <Select value={market} onChange={(e) => setMarket(e.target.value as Market)}>
            <option value="CEDEARs">CEDEARs</option>
            <option value="Argentina">Argentina</option>
          </Select>
          <Button
            onClick={() => {
              if (!symbol) return
              add.mutate({ symbol, market, favorite: false })
              setSymbol('')
            }}
          >
            Agregar
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold">Lista actual</h3>
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.key} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{group.title}</p>
              {group.items.map((item) => (
                <div key={`${group.key}-${item.symbol}`} className="flex items-center justify-between rounded-xl border border-border p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.symbol}</span>
                    <Badge tone="muted">{item.market}</Badge>
                    {item.favorite ? <Badge tone="warning">Favorito</Badge> : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => update.mutate({ symbol: item.symbol, payload: { favorite: !item.favorite } })}
                    >
                      {item.favorite ? 'Quitar favorito' : 'Favorito'}
                    </Button>
                    <Button variant="danger" onClick={() => remove.mutate(item.symbol)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              {group.items.length === 0 ? <p className="text-xs text-slate-500">Sin activos.</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
