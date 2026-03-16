import { evaluateAlerts } from './services/alertService'
import { handleScan } from './routes/scan'
import { handleTicker } from './routes/ticker'
import { createAlertRoute, deleteAlertRoute, getAlertsRoute, updateAlertRoute } from './routes/alerts'
import { getSettingsRoute, updateSettingsRoute } from './routes/settings'
import { createWatchlistRoute, deleteWatchlistRoute, getWatchlistRoute, updateWatchlistRoute } from './routes/watchlist'
import type { Env } from './types/env'
import { errorResponse, json, optionsResponse } from './utils/http'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return optionsResponse()

    const url = new URL(request.url)
    const path = url.pathname

    try {
      if (request.method === 'GET' && path === '/api/scan') return handleScan(request, env)

      if (request.method === 'GET' && path.startsWith('/api/ticker/')) {
        const symbol = path.replace('/api/ticker/', '')
        return handleTicker(env, symbol)
      }

      if (request.method === 'GET' && path === '/api/watchlist') return getWatchlistRoute(env)
      if (request.method === 'POST' && path === '/api/watchlist') return createWatchlistRoute(request, env)
      if (request.method === 'PUT' && path.startsWith('/api/watchlist/')) {
        const symbol = path.replace('/api/watchlist/', '')
        return updateWatchlistRoute(request, env, symbol)
      }
      if (request.method === 'DELETE' && path.startsWith('/api/watchlist/')) {
        const symbol = path.replace('/api/watchlist/', '')
        return deleteWatchlistRoute(env, symbol)
      }

      if (request.method === 'GET' && path === '/api/alerts') return getAlertsRoute(env)
      if (request.method === 'POST' && path === '/api/alerts') return createAlertRoute(request, env)
      if (request.method === 'PUT' && path.startsWith('/api/alerts/')) {
        const id = path.replace('/api/alerts/', '')
        return updateAlertRoute(request, env, id)
      }
      if (request.method === 'DELETE' && path.startsWith('/api/alerts/')) {
        const id = path.replace('/api/alerts/', '')
        return deleteAlertRoute(env, id)
      }

      if (request.method === 'GET' && path === '/api/settings') return getSettingsRoute(env)
      if (request.method === 'PUT' && path === '/api/settings') return updateSettingsRoute(request, env)

      if (request.method === 'POST' && path === '/api/check-alerts') {
        const result = await evaluateAlerts(env)
        return json(result)
      }

      return errorResponse('Not found', 404)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Internal error', 500)
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await evaluateAlerts(env)
  },
}
