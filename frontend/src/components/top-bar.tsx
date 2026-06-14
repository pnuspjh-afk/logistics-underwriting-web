import React from 'react'
import { Cloud, History, Share2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SavedAnalysis } from '@/lib/analyses-store'
import { HistoryDrawer } from '@/components/history-drawer'

export type SyncState = 'idle' | 'dirty' | 'syncing' | 'synced'

interface TopBarProps {
  sync: SyncState
  lastSaved: Date | null
  rows: SavedAnalysis[]
  historyLoading: boolean
  onLoad: (row: SavedAnalysis) => void
  onShare: () => void
  sharing: boolean
  shared: boolean
}

export const TopBar: React.FC<TopBarProps> = ({
  sync,
  lastSaved,
  rows,
  historyLoading,
  onLoad,
  onShare,
  sharing,
  shared
}) => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">L</div>
          <h1 className="text-sm font-bold tracking-tight text-slate-100 hidden sm:block">물류 투자 심사 터미널</h1>
        </div>
        
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <SyncIndicator sync={sync} lastSaved={lastSaved} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HistoryDrawer 
          rows={rows} 
          loading={historyLoading} 
          onLoad={onLoad} 
        >
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100 gap-2">
            <History className="h-4 w-4" />
            <span className="hidden md:inline">히스토리</span>
          </Button>
        </HistoryDrawer>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onShare}
          disabled={sharing}
          className="border-slate-800 bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-100 gap-2"
        >
          {shared ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden md:inline">{shared ? '링크 복사됨' : '공유하기'}</span>
        </Button>
      </div>
    </header>
  )
}

function SyncIndicator({ sync, lastSaved }: { sync: SyncState; lastSaved: Date | null }) {
  if (sync === 'syncing') {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        동기화 중...
      </div>
    )
  }

  if (sync === 'synced' && lastSaved) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-500/80">
        <Cloud className="h-3 w-3" />
        저장 완료 ({lastSaved.toLocaleTimeString()})
      </div>
    )
  }

  if (sync === 'dirty') {
    return (
      <div className="flex items-center gap-2 text-xs text-orange-500/80">
        <Cloud className="h-3 w-3" />
        저장되지 않은 변경사항
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <Cloud className="h-3 w-3" />
      클라우드 연결됨
    </div>
  )
}
