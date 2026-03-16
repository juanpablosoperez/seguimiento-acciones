import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <section className={cn('rounded-2xl border border-border bg-card/80 p-4 shadow-panel backdrop-blur', className)}>{children}</section>
}
