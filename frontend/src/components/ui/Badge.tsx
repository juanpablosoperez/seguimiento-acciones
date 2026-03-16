import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
}

const toneMap = {
  default: 'bg-primary/20 text-primary border-primary/30',
  success: 'bg-success/20 text-emerald-300 border-success/30',
  warning: 'bg-warning/20 text-amber-300 border-warning/30',
  danger: 'bg-danger/20 text-red-300 border-danger/30',
  muted: 'bg-muted/40 text-slate-300 border-border',
}

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', toneMap[tone])}>
      {children}
    </span>
  )
}
