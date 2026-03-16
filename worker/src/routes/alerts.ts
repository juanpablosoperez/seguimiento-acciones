import { getAlerts, setAlerts } from '../services/kvService'
import type { AlertRule } from '../types/domain'
import type { Env } from '../types/env'
import { createId } from '../utils/id'
import { errorResponse, json, parseJson } from '../utils/http'

export async function getAlertsRoute(env: Env): Promise<Response> {
  const alerts = await getAlerts(env)
  return json({ alerts })
}

export async function createAlertRoute(request: Request, env: Env): Promise<Response> {
  const body = await parseJson<Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggeredAt'>>(request)
  if (!body.symbol || !body.destinationEmail) return errorResponse('Body invalido')

  const alerts = await getAlerts(env)
  alerts.push({
    ...body,
    symbol: body.symbol.toUpperCase(),
    id: createId('al'),
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    currentlyInCondition: false,
  })

  await setAlerts(env, alerts)
  return json({ alerts }, 201)
}

export async function updateAlertRoute(request: Request, env: Env, id: string): Promise<Response> {
  const body = await parseJson<Partial<AlertRule>>(request)
  const alerts = await getAlerts(env)
  const index = alerts.findIndex((alert) => alert.id === id)
  if (index === -1) return errorResponse('Alerta no encontrada', 404)

  alerts[index] = { ...alerts[index], ...body }
  await setAlerts(env, alerts)
  return json({ alerts })
}

export async function deleteAlertRoute(env: Env, id: string): Promise<Response> {
  const alerts = await getAlerts(env)
  const next = alerts.filter((alert) => alert.id !== id)
  await setAlerts(env, next)
  return json({ alerts: next })
}
