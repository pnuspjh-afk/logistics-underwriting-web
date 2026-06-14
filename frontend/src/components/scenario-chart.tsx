'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity } from 'lucide-react'
import { buildScenarios, type UWInputs } from '@/lib/underwriting'
import { useMemo } from 'react'

const config = {
  upside: { label: 'Upside', color: 'var(--color-chart-1)' },
  base: { label: 'Base', color: 'var(--color-chart-2)' },
  downside: { label: 'Downside', color: 'var(--color-chart-4)' },
} satisfies ChartConfig

export function ScenarioChart({ inputs }: { inputs: UWInputs }) {
  const data = useMemo(() => buildScenarios(inputs), [inputs])

  return (
    <Card className="glass border-border/80">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" />
              Scenario Analysis
            </CardTitle>
            <CardDescription>
              Equity value multiple by exit year
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {inputs.holdYears}Y HOLD
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              {(['upside', 'base', 'downside'] as const).map((k) => (
                <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${k})`}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${k})`}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `Y${v}`}
              className="text-[10px]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={44}
              domain={[0, 'auto']}
              tickFormatter={(v) => `${Number(v).toFixed(1)}x`}
              className="text-[10px]"
            />
            <ReferenceLine
              y={1}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="capitalize text-muted-foreground">
                        {name}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {Number(value).toFixed(2)}x
                      </span>
                    </div>
                  )}
                  labelFormatter={(l) => `Hold Year ${l}`}
                />
              }
            />
            <Area
              dataKey="downside"
              type="monotone"
              stroke="var(--color-downside)"
              fill="url(#g-downside)"
              strokeWidth={2}
            />
            <Area
              dataKey="base"
              type="monotone"
              stroke="var(--color-base)"
              fill="url(#g-base)"
              strokeWidth={2}
            />
            <Area
              dataKey="upside"
              type="monotone"
              stroke="var(--color-upside)"
              fill="url(#g-upside)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
          {(['upside', 'base', 'downside'] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: `var(--color-${k})` }}
              />
              <span className="capitalize text-muted-foreground">{k}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
