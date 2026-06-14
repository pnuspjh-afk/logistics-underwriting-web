'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { History, FileClock, Link2, TrendingUp } from 'lucide-react'
import type { SavedAnalysis } from '@/lib/analyses-store'
import { cn } from '@/lib/utils'

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

interface Props {
  rows: SavedAnalysis[]
  loading: boolean
  onLoad: (row: SavedAnalysis) => void
}

export function HistoryDrawer({ rows, loading, onLoad }: Props) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <History data-icon="inline-start" />
        History
        <Badge variant="secondary" className="ml-1 font-mono text-[10px]">
          {rows.length}
        </Badge>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <FileClock className="size-4 text-primary" />
            Analysis History
          </SheetTitle>
          <SheetDescription>
            Previously saved underwriting runs from your Supabase workspace.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100svh-5.5rem)]">
          <div className="flex flex-col gap-2 p-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
                ))
              : rows.map((row) => {
                  const canLoad = !!row.inputs?.purchasePrice
                  return (
                    <button
                      key={row.id}
                      type="button"
                      disabled={!canLoad}
                      onClick={() => canLoad && onLoad(row)}
                      className={cn(
                        'group flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-3 text-left transition-colors',
                        canLoad
                          ? 'cursor-pointer hover:border-primary/50 hover:bg-accent/40'
                          : 'cursor-default opacity-90',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold leading-tight">
                            {row.project_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {row.asset_name}
                          </span>
                        </div>
                        {row.share_id && (
                          <Link2 className="size-3.5 shrink-0 text-chart-2" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="size-3.5 text-pos" />
                          <span className="font-mono text-sm font-semibold tabular-nums text-pos">
                            {row.irr.toFixed(1)}%
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            IRR · {row.equity_multiple.toFixed(2)}x EM
                          </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {relativeDate(row.created_at)}
                        </span>
                      </div>
                    </button>
                  )
                })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
