'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Boxes, Cloud, CloudOff, Loader2, Share2, Check } from 'lucide-react'
import { HistoryDrawer } from './history-drawer'
import type { SavedAnalysis } from '@/lib/analyses-store'
import { cn } from '@/lib/utils'

export type SyncState = 'idle' | 'syncing' | 'synced' | 'dirty'

function timeAgo(date: Date | null) {
  if (!date) return 'Never'
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  sync: SyncState
  lastSaved: Date | null
  rows: SavedAnalysis[]
  historyLoading: boolean
  onLoad: (row: SavedAnalysis) => void
  onShare: () => void
  sharing: boolean
  shared: boolean
}

export function TopBar({
  sync,
  lastSaved,
  rows,
  historyLoading,
  onLoad,
  onShare,
  sharing,
  shared,
}: Props) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Boxes className="size-5" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold">Atlas UW</span>
          <span className="hidden text-[11px] text-muted-foreground sm:block">
            Logistics Investment Underwriting
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SyncIndicator sync={sync} lastSaved={lastSaved} />

        <HistoryDrawer rows={rows} loading={historyLoading} onLoad={onLoad} />

        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          disabled={sharing}
        >
          {sharing ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : shared ? (
            <Check data-icon="inline-start" className="text-pos" />
          ) : (
            <Share2 data-icon="inline-start" />
          )}
          <span className="hidden sm:inline">
            {shared ? 'Link Copied' : 'Share'}
          </span>
        </Button>
      </div>
    </header>
  )
}

function SyncIndicator({
  sync,
  lastSaved,
}: {
  sync: SyncState
  lastSaved: Date | null
}) {
  const map = {
    syncing: {
      icon: <Loader2 className="size-3.5 animate-spin" />,
      label: 'Syncing…',
      cls: 'border-chart-2/40 text-chart-2',
    },
    synced: {
      icon: <Cloud className="size-3.5" />,
      label: `Saved ${timeAgo(lastSaved)}`,
      cls: 'border-pos/40 text-pos',
    },
    dirty: {
      icon: <CloudOff className="size-3.5" />,
      label: 'Unsaved changes',
      cls: 'border-warn/40 text-warn',
    },
    idle: {
      icon: <Cloud className="size-3.5" />,
      label: 'Not saved',
      cls: 'border-border text-muted-foreground',
    },
  }[sync]

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant="outline"
            className={cn('gap-1.5 font-normal tabular-nums', map.cls)}
          />
        }
      >
        {map.icon}
        <span className="hidden text-xs md:inline">{map.label}</span>
      </TooltipTrigger>
      <TooltipContent>
        Supabase sync status · {lastSaved ? `last write ${timeAgo(lastSaved)}` : 'no writes yet'}
      </TooltipContent>
    </Tooltip>
  )
}
