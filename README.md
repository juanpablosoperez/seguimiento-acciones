# Cedear Scanner AR

Aplicacion web fullstack para seguimiento tecnico de CEDEARs y acciones argentinas, con scanner, semaforo por ticker, watchlist persistida en KV y alertas automaticas por email via API HTTP.

## Stack

- Frontend: React + Vite + TypeScript + TailwindCSS + componentes estilo shadcn/ui + Recharts + TanStack Query + React Router
- Backend serverless: Cloudflare Workers + Cron Triggers + Cloudflare KV
- Persistencia: Cloudflare KV (sin base de datos tradicional)
- Email: Resend HTTP API (con fallback mock)

## Estructura

```txt
frontend/
  src/
    api/
    components/
      dashboard/
      filters/
      tables/
      cards/
      charts/
      layout/
      ui/
    pages/
    hooks/
    lib/
    types/
    App.tsx
    main.tsx
worker/
  src/
    index.ts
    routes/
    services/
    utils/
    types/
  wrangler.toml
```

## Features implementadas

- Dashboard principal dark con:
  - fecha/hora de actualizacion
  - recarga manual
  - filtros por mercado, sector, RSI, volumen relativo, estado tecnico, posicion EMA200/SMA50
  - tabla scanner con sorting, busqueda, paginacion y colores semaforo
  - grid semaforo por ticker con microresumen
- Ruta de detalle `/ticker/:symbol` con:
  - metricas tecnicas completas
  - graficos de precio, RSI y volumen con Recharts
  - interpretacion automatica
- Watchlist `/watchlist`:
  - alta/baja ticker
  - favoritos
  - separacion CEDEARs / Argentina / Favoritos
  - persistencia en KV
- Alertas `/alerts`:
  - CRUD completo
  - condiciones RSI/precio/cruces/volumen relativo
  - activacion/desactivacion
  - cooldown y anti-duplicado por estado de condicion
- Configuracion `/settings` persistida en KV
- Cron Worker:
  - evalua alertas activas
  - calcula indicadores
  - envia email por API HTTP
  - evita spam por cooldown + salida/reingreso de condicion
- Widgets extra:
  - Top RSI alto
  - Top mas fuertes
  - Cerca de breakout

## Endpoints Worker

- `GET /api/scan`
- `GET /api/scan?format=compact` (salida simplificada)
- `GET /api/ticker/:symbol`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `PUT /api/watchlist/:symbol`
- `DELETE /api/watchlist/:symbol`
- `GET /api/alerts`
- `POST /api/alerts`
- `PUT /api/alerts/:id`
- `DELETE /api/alerts/:id`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/check-alerts`

## Setup local

### 1) Variables de entorno

Copiar `.env.example` y completar los valores.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3) Worker

```bash
cd worker
npm install
npm run dev
```

El frontend usa proxy Vite a `http://127.0.0.1:8787` para `/api`.

## Deploy en Cloudflare

### Worker + KV

1. Crear namespace KV:
   ```bash
   wrangler kv namespace create APP_KV
   wrangler kv namespace create APP_KV --preview
   ```
2. Copiar IDs al `worker/wrangler.toml`.
3. Configurar secretos:
   ```bash
   wrangler secret put RESEND_API_KEY
   ```
4. Deploy:
   ```bash
   cd worker
   npm run deploy
   ```

### Cloudflare Pages (frontend)

1. Crear proyecto Pages apuntando a `frontend`.
2. Build command: `npm run build`
3. Output dir: `dist`
4. Variables:
   - `VITE_API_BASE_URL=https://<tu-worker>.workers.dev/api`
5. Deploy.

## Notas de arquitectura

- Capa de provider de mercado abstraida en `worker/src/services/marketService.ts`.
- Provider real por defecto con Yahoo Finance (sin API key, cotizaciones diferidas) y fallback automatico a mock.
- Cache KV de cotizaciones por ticker (TTL corto) para mejorar performance y reducir llamadas a Yahoo.
- Mock provider funcional con historico suficiente para RSI/SMA50/EMA200.
- Indicadores desacoplados y reutilizables en `worker/src/services/indicatorService.ts`.
- Calculo tecnico con libreria `technicalindicators` (RSI, SMA, EMA).
- Servicios de KV y email desacoplados para facilitar reemplazo futuro.

## Comandos utiles

- Frontend build: `cd frontend && npm run build`
- Worker typecheck: `cd worker && npm run typecheck`
- Chequeo manual alertas: `POST /api/check-alerts`
