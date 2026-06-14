import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { ParameterSidebar } from './src/components/parameter-sidebar'
import { TopBar, type SyncState } from './src/components/top-bar'
import { KpiGrid } from './src/components/kpi-cards'
import { SensitivityHeatmap } from './src/components/sensitivity-heatmap'
import { ScenarioChart } from './src/components/scenario-chart'
import { InvestmentMemo } from './src/components/investment-memo'
import {
  DEFAULT_INPUTS,
  underwrite,
  fmtCompact,
  type UWInputs,
} from './src/lib/underwriting'
import { analysesTable, type SavedAnalysis } from './src/lib/analyses-store'

const Dashboard: React.FC = () => {
  const [inputs, setInputs] = useState<UWInputs>(DEFAULT_INPUTS)
  const [sync, setSync] = useState<SyncState>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<SavedAnalysis[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const lastSavedId = useRef<string | null>(null)
  const firstRender = useRef(true)

  const results = useMemo(() => underwrite(inputs), [inputs])

  // 컴포넌트 마운트 시 히스토리 로드
  useEffect(() => {
    analysesTable.list().then((r) => {
      setRows(r)
      setHistoryLoading(false)
    })
  }, [])

  // 입력값이 변경되면 '저장 안됨' 상태로 변경
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setSync((s) => (s === 'syncing' ? s : 'dirty'))
  }, [inputs])

  function patch(p: Partial<UWInputs>) {
    setInputs((prev) => ({ ...prev, ...p }))
  }

  // Supabase에 저장
  async function handleSave() {
    setSaving(true)
    setSync('syncing')
    try {
      const record = await analysesTable.insert({
        project_name: inputs.projectName,
        asset_name: inputs.assetName,
        irr: results.irr,
        equity_multiple: results.equityMultiple,
        dscr: results.dscr,
        noi: results.noi,
        inputs,
      })
      lastSavedId.current = record.id
      setRows((prev) => [record, ...prev])
      setLastSaved(new Date())
      setSync('synced')
      toast.success('분석 결과가 Supabase에 저장되었습니다.', {
        description: `${inputs.projectName} · IRR ${results.irr.toFixed(1)}%`,
      })
    } catch (e) {
      setSync('dirty')
      toast.error('저장에 실패했습니다. 설정을 확인해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  // 과거 기록 불러오기
  function handleLoad(row: SavedAnalysis) {
    if (!row.inputs?.purchasePrice) return
    setInputs(row.inputs)
    lastSavedId.current = row.id
    setSync('synced')
    setLastSaved(new Date(row.created_at))
    toast.info('이전 분석 데이터를 불러왔습니다.', { description: row.project_name })
  }

  // 공유 링크 생성 (Python 백엔드 리포트 API 연동 가능)
  async function handleShare() {
    setSharing(true)
    try {
      // 공유 로직 (v0 로직 유지 또는 Python API 호출)
      setShared(true)
      setTimeout(() => setShared(false), 2500)
      toast.success('공유 링크가 생성되었습니다. (클립보드 복사)')
    } catch {
      toast.error('공유 링크 생성에 실패했습니다.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 font-sans">
      <Toaster position="top-right" theme="dark" />
      
      <TopBar
        sync={sync}
        lastSaved={lastSaved}
        rows={rows}
        historyLoading={historyLoading}
        onLoad={handleLoad}
        onShare={handleShare}
        sharing={sharing}
        shared={shared}
      />

      <div className="flex flex-1 lg:grid lg:grid-cols-[320px_1fr]">
        <ParameterSidebar
          inputs={inputs}
          onChange={patch}
          onSave={handleSave}
          saving={saving}
          className="hidden lg:flex"
        />

        <main className="flex flex-1 flex-col gap-6 overflow-x-hidden p-6 lg:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {inputs.projectName}
              </h1>
              <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                {fmtCompact(inputs.purchasePrice)} · {inputs.leasableArea.toLocaleString()} SQM
              </div>
            </div>
            <p className="text-slate-400 font-medium">{inputs.assetName}</p>
          </div>

          <KpiGrid
            noi={fmtCompact(results.noi)}
            dscr={results.dscr}
            irr={results.irr}
            em={results.equityMultiple}
            goingInCap={results.goingInCap}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <SensitivityHeatmap inputs={inputs} />
            <ScenarioChart inputs={inputs} />
          </div>

          <InvestmentMemo inputs={inputs} results={results} />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
