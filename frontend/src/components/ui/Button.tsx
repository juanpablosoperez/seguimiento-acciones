import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'default' | 'outline' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantMap: Record<Variant, string> = {
  default: 'bg-primary text-slate-950 hover:brightness-110',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted/30',
  danger: 'bg-danger text-white hover:brightness-110',
  ghost: 'bg-transparent text-foreground hover:bg-muted/30',
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variantMap[variant],
        className,
      )}
      {...props}
    />
  )
}
