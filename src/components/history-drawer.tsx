import React from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet'
import { SavedAnalysis } from '@/lib/analyses-store'
import { fmtPct, fmtCompact } from '@/lib/underwriting'
import { Loader2, Calendar, LayoutGrid } from 'lucide-react'

interface HistoryDrawerProps {
  rows: SavedAnalysis[]
  loading: boolean
  onLoad: (row: SavedAnalysis) => void
  children: React.ReactNode
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ rows, loading, onLoad, children }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] bg-slate-950 border-slate-800 text-slate-100 p-0">
        <SheetHeader className="p-6 border-b border-slate-800">
          <SheetTitle className="text-slate-100 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-400" />
            분석 히스토리
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>기록을 불러오는 중...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p>저장된 분석 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <button
                  key={row.id}
                  onClick={() => onLoad(row)}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {row.project_name}
                      </h4>
                      <p className="text-xs text-slate-500">{row.asset_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{fmtPct(row.irr)} IRR</div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase">{fmtCompact(row.noi)} NOI</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/50 text-[10px] text-slate-600">
                    <Calendar className="w-3 h-3" />
                    {new Date(row.created_at).toLocaleDateString()} {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
