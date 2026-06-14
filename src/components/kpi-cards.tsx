'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  Shield,
  Percent,
  Layers,
  type LucideIcon,
} from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  sub: string
  icon: LucideIcon
  tone: 'pos' | 'warn' | 'neg' | 'neutral'
  delta?: number
}

const toneRing: Record<KpiCardProps['tone'], string> = {
  pos: 'text-pos',
  warn: 'text-warn',
  neg: 'text-neg',
  neutral: 'text-chart-2',
}

function KpiCard({ label, value, sub, icon: Icon, tone, delta }: KpiCardProps) {
  return (
    <Card className="glass group relative overflow-hidden border-border/80 p-0 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-2xl font-semibold tabular-nums text-foreground transition-transform duration-200 group-hover:-translate-y-px">
            {value}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {typeof delta === 'number' &&
              (delta >= 0 ? (
                <TrendingUp className="size-3 text-pos" />
              ) : (
                <TrendingDown className="size-3 text-neg" />
              ))}
            {sub}
          </span>
        </div>
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary/60 ring-1 ring-inset ring-border',
            toneRing[tone],
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </div>
      <div
        className={cn(
          'h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100',
          tone === 'pos' && 'bg-pos',
          tone === 'warn' && 'bg-warn',
          tone === 'neg' && 'bg-neg',
          tone === 'neutral' && 'bg-chart-2',
        )}
      />
    </Card>
  )
}

export { Banknote, Shield, Percent, Layers }

export function KpiGrid({
  noi,
  dscr,
  irr,
  em,
  goingInCap,
}: {
  noi: string
  dscr: number
  irr: number
  em: number
  goingInCap: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="Year 1 NOI"
        value={noi}
        sub={`${goingInCap.toFixed(2)}% going-in cap`}
        icon={Banknote}
        tone="neutral"
      />
      <KpiCard
        label="DSCR"
        value={`${dscr.toFixed(2)}x`}
        sub={dscr >= 1.25 ? 'Above 1.25x covenant' : 'Below covenant'}
        icon={Shield}
        tone={dscr >= 1.25 ? 'pos' : dscr >= 1.1 ? 'warn' : 'neg'}
        delta={dscr >= 1.25 ? 1 : -1}
      />
      <KpiCard
        label="Levered IRR"
        value={`${irr.toFixed(1)}%`}
        sub={irr >= 15 ? 'Exceeds 15% hurdle' : 'Below target hurdle'}
        icon={Percent}
        tone={irr >= 15 ? 'pos' : irr >= 10 ? 'warn' : 'neg'}
        delta={irr >= 15 ? 1 : -1}
      />
      <KpiCard
        label="Equity Multiple"
        value={`${em.toFixed(2)}x`}
        sub={em >= 1.8 ? 'Strong return of capital' : 'Moderate multiple'}
        icon={Layers}
        tone={em >= 1.8 ? 'pos' : em >= 1.4 ? 'warn' : 'neg'}
        delta={em >= 1.8 ? 1 : -1}
      />
    </div>
  )
}
