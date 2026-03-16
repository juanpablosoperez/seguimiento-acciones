import { getWatchlist, setWatchlist } from '../services/kvService'
import type { WatchlistItem } from '../types/domain'
import type { Env } from '../types/env'
import { errorResponse, json, parseJson } from '../utils/http'

export async function getWatchlistRoute(env: Env): Promise<Response> {
  const items = await getWatchlist(env)
  return json({ items })
}

export async function createWatchlistRoute(request: Request, env: Env): Promise<Response> {
  const body = await parseJson<WatchlistItem>(request)
  if (!body.symbol || !body.market) return errorResponse('Body invalido')

  const items = await getWatchlist(env)
  const symbol = body.symbol.toUpperCase()
  const index = items.findIndex((item) => item.symbol === symbol)
  if (index === -1) {
    items.push({ symbol, market: body.market, favorite: !!body.favorite })
  } else {
    items[index] = {
      ...items[index],
      market: body.market,
      favorite: body.favorite,
    }
  }
  await setWatchlist(env, items)

  return json({ items })
}

export async function updateWatchlistRoute(request: Request, env: Env, symbol: string): Promise<Response> {
  const body = await parseJson<Partial<WatchlistItem>>(request)
  const items = await getWatchlist(env)
  const index = items.findIndex((item) => item.symbol === symbol.toUpperCase())
  if (index === -1) return errorResponse('Ticker no encontrado', 404)

  items[index] = {
    ...items[index],
    favorite: body.favorite ?? items[index].favorite,
    market: body.market ?? items[index].market,
  }
  await setWatchlist(env, items)

  return json({ items })
}

export async function deleteWatchlistRoute(env: Env, symbol: string): Promise<Response> {
  const items = await getWatchlist(env)
  const next = items.filter((item) => item.symbol !== symbol.toUpperCase())
  await setWatchlist(env, next)
  return json({ items: next })
}
