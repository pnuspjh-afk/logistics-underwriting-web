'use client'

import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Grid3x3 } from 'lucide-react'
import { sensitivityIRR, type UWInputs } from '@/lib/underwriting'
import { cn } from '@/lib/utils'

// Map an IRR value to a red->amber->green background using semantic scale.
function cellColor(irr: number) {
  // clamp 0%..25% across the spectrum
  const t = Math.max(0, Math.min(1, (irr - 4) / 21))
  const hue = 12 + t * 150 // 12 (red) -> 162 (green)
  const light = 0.34 + t * 0.16
  return `oklch(${light} ${0.13 + t * 0.04} ${hue})`
}

export function SensitivityHeatmap({ inputs }: { inputs: UWInputs }) {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)

  const vacancySteps = useMemo(
    () => [-3, 0, 3, 6, 9].map((d) => Math.max(0, inputs.vacancy + d)),
    [inputs.vacancy],
  )
  const capSteps = useMemo(
    () => [-1, -0.5, 0, 0.5, 1].map((d) => inputs.exitCapRate + d),
    [inputs.exitCapRate],
  )

  const grid = useMemo(
    () =>
      capSteps.map((cap) =>
        vacancySteps.map((vac) => sensitivityIRR(inputs, vac, cap)),
      ),
    [inputs, capSteps, vacancySteps],
  )

  return (
    <Card className="glass border-border/80">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Grid3x3 className="size-4 text-primary" />
              Sensitivity — Levered IRR
            </CardTitle>
            <CardDescription>
              Exit cap rate (rows) vs. stabilized vacancy (columns)
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            IRR %
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-16 p-1 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Cap \ Vac
                </th>
                {vacancySteps.map((v, c) => (
                  <th
                    key={c}
                    className="p-1 text-center font-mono text-xs font-medium text-muted-foreground"
                  >
                    {v.toFixed(0)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capSteps.map((cap, r) => (
                <tr key={r}>
                  <td className="p-1 text-right font-mono text-xs font-medium text-muted-foreground">
                    {cap.toFixed(2)}
                  </td>
                  {vacancySteps.map((vac, c) => {
                    const irr = grid[r][c]
                    const isBase = r === 2 && c === 1
                    const active = hover?.r === r && hover?.c === c
                    return (
                      <td key={c} className="p-0">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onMouseEnter={() => setHover({ r, c })}
                                onMouseLeave={() => setHover(null)}
                                style={{ backgroundColor: cellColor(irr) }}
                                className={cn(
                                  'flex h-11 w-full min-w-12 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums text-slate-950 transition-all duration-150',
                                  'ring-inset hover:scale-[1.06] hover:ring-2 hover:ring-foreground/70',
                                  active && 'scale-[1.06]',
                                  isBase && 'ring-2 ring-foreground',
                                )}
                              />
                            }
                          >
                            {irr.toFixed(1)}
                          </TooltipTrigger>
                          <TooltipContent className="font-mono text-xs">
                            Vacancy {vac.toFixed(1)}% · Exit cap{' '}
                            {cap.toFixed(2)}% → IRR {irr.toFixed(2)}%
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-sm border border-foreground" />
            Base case
          </span>
          <div className="flex items-center gap-2">
            <span>Lower</span>
            <span className="h-2 w-28 rounded-full bg-[linear-gradient(90deg,oklch(0.36_0.13_12),oklch(0.5_0.15_80),oklch(0.5_0.16_162))]" />
            <span>Higher</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
