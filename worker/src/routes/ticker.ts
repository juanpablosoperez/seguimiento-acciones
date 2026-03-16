import { buildTickerDetail } from '../services/marketService'
import type { Env } from '../types/env'
import { errorResponse, json } from '../utils/http'

export async function handleTicker(env: Env, symbol: string): Promise<Response> {
  const data = await buildTickerDetail(env, symbol)
  if (!data) return errorResponse('Ticker no encontrado', 404)
  return json(data)
}
