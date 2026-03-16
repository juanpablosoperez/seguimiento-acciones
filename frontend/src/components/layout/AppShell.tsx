import { BarChart3, Bell, List, Settings } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/watchlist', label: 'Watchlist', icon: List },
  { to: '/alerts', label: 'Alertas', icon: Bell },
  { to: '/settings', label: 'Configuracion', icon: Settings },
]

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-8 md:py-6">
      <header className="mb-6 rounded-2xl border border-border bg-card/70 p-4 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Cedear Scanner AR</h1>
            <p className="text-sm text-slate-400">Seguimiento tecnico de CEDEARs y acciones argentinas</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium transition',
                      isActive ? 'bg-primary/20 text-primary' : 'bg-transparent text-slate-300 hover:bg-muted/30',
                    )
                  }
                >
                  <Icon size={14} />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="space-y-4">{children}</main>
    </div>
  )
}
