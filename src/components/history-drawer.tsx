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
import { History, FileClock, Link2, GitCommit, FileText } from 'lucide-react'
import type { SavedAnalysis } from '@/lib/analyses-store'
import { cn } from '@/lib/utils'

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
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
  const latestAnalysis = rows[0]

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <History data-icon="inline-start" />
        History
        <Badge variant="secondary" className="ml-1 font-mono text-[10px]">
          {rows.length}
        </Badge>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileClock className="size-4 text-primary" />
            Analysis History
          </SheetTitle>
          <SheetDescription>
            Previously saved underwriting runs from your Supabase workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* GitHub style Commit Bar (Latest Commit) */}
          {!loading && latestAnalysis && (
            <div className="flex items-center justify-between rounded-t-md border border-border border-b-0 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 truncate">
                {/* Custom Avatar for pnuspjh-afk */}
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  P
                </div>
                <span className="font-semibold text-foreground">pnuspjh-afk</span>
                <span className="truncate">
                  Saved{' '}
                  <span className="font-medium text-foreground hover:underline cursor-pointer" onClick={() => onLoad(latestAnalysis)}>
                    {latestAnalysis.project_name}
                  </span>{' '}
                  · IRR {latestAnalysis.irr.toFixed(1)}% · EM {latestAnalysis.equity_multiple.toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitCommit className="size-3" />
                  {latestAnalysis.id.slice(0, 7)}
                </span>
                <span>{relativeDate(latestAnalysis.created_at)}</span>
              </div>
            </div>
          )}

          <ScrollArea className={cn(
            "border border-border rounded-md bg-card/20",
            latestAnalysis ? "rounded-t-none border-t-0" : "",
            "h-[calc(100svh-10.5rem)]"
          )}>
            <div className="flex flex-col">
              {loading ? (
                <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                  <FileText className="size-8 text-muted-foreground/30 mb-2" />
                  No saved analyses found
                </div>
              ) : (
                rows.map((row) => {
                  const canLoad = !!row.inputs?.purchasePrice
                  return (
                    <div
                      key={row.id}
                      className={cn(
                        'flex items-center justify-between border-b border-border last:border-b-0 px-4 py-3 text-xs transition-colors hover:bg-muted/20',
                        canLoad ? '' : 'opacity-60'
                      )}
                    >
                      {/* Name Column */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
                        <FileText className="size-4 shrink-0 text-blue-400/90" />
                        <button
                          type="button"
                          disabled={!canLoad}
                          onClick={() => canLoad && onLoad(row)}
                          className={cn(
                            'truncate text-left font-medium text-foreground hover:text-blue-400 hover:underline',
                            canLoad ? 'cursor-pointer' : 'cursor-default'
                          )}
                        >
                          {row.project_name}
                          {row.asset_name && (
                            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                              / {row.asset_name}
                            </span>
                          )}
                        </button>
                        {row.share_id && (
                          <Link2 className="size-3 shrink-0 text-chart-2" title="Shared analysis" />
                        )}
                      </div>

                      {/* Commit Message Column (Metrics Summary) */}
                      <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0 text-muted-foreground text-[11px]">
                        <span className="truncate">
                          IRR {row.irr.toFixed(1)}% · EM {row.equity_multiple.toFixed(2)}x · DSCR {row.dscr.toFixed(2)}
                        </span>
                      </div>

                      {/* Age Column */}
                      <div className="shrink-0 text-right min-w-[70px] text-muted-foreground font-mono text-[10px]">
                        {relativeDate(row.created_at)}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
