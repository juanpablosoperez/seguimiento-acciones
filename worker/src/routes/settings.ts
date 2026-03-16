import { getSettings, setSettings } from '../services/kvService'
import type { AppSettings } from '../types/domain'
import type { Env } from '../types/env'
import { json, parseJson } from '../utils/http'

export async function getSettingsRoute(env: Env): Promise<Response> {
  const settings = await getSettings(env)
  return json(settings)
}

export async function updateSettingsRoute(request: Request, env: Env): Promise<Response> {
  const body = await parseJson<AppSettings>(request)
  await setSettings(env, body)
  return json(body)
}
