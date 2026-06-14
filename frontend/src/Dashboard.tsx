import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { ParameterSidebar } from '@/components/parameter-sidebar'
import { TopBar, type SyncState } from '@/components/top-bar'
import { KpiGrid } from '@/components/kpi-cards'
import { SensitivityHeatmap } from '@/components/sensitivity-heatmap'
import { ScenarioChart } from '@/components/scenario-chart'
import { InvestmentMemo } from '@/components/investment-memo'
import {
  DEFAULT_INPUTS,
  underwrite,
  fmtCompact,
  type UWInputs,
} from '@/lib/underwriting'
import { analysesTable, type SavedAnalysis } from '@/lib/analyses-store'

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

  // Load history on mount
  useEffect(() => {
    analysesTable.list().then((r) => {
      setRows(r)
      setHistoryLoading(false)
    })
  }, [])

  // Mark dirty when inputs change after first render
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
      toast.success('Analysis saved to Supabase', {
        description: `${inputs.projectName} · ${results.irr.toFixed(1)}% IRR`,
      })
    } catch {
      setSync('dirty')
      toast.error('Failed to save analysis')
    } finally {
      setSaving(false)
    }
  }

  function handleLoad(row: SavedAnalysis) {
    if (!row.inputs?.purchasePrice) return
    setInputs(row.inputs)
    lastSavedId.current = row.id
    setSync('synced')
    setLastSaved(new Date(row.created_at))
    toast.info('Loaded analysis', { description: row.project_name })
  }

  async function handleShare() {
    setSharing(true)
    try {
      // For Vite-based web, we might need a different sharing logic if createShare is not available
      // Using a simpler placeholder or trying to call the method if it exists
      let id = lastSavedId.current
      if (!id) {
        const record = await analysesTable.insert({
          project_name: inputs.projectName,
          asset_name: inputs.assetName,
          irr: results.irr,
          equity_multiple: results.equityMultiple,
          dscr: results.dscr,
          noi: results.noi,
          inputs,
        })
        id = record.id
        lastSavedId.current = id
        setRows((prev) => [record, ...prev])
        setLastSaved(new Date())
        setSync('synced')
      }
      
      setShared(true)
      setTimeout(() => setShared(false), 2500)
      toast.success('Share functionality updated', { description: 'Analysis ID: ' + id })
    } catch {
      toast.error('Could not create share link')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
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

        <main className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4 lg:p-5">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-balance text-lg font-semibold tracking-tight">
                {inputs.projectName}
              </h1>
              <span className="font-mono text-xs text-muted-foreground">
                {fmtCompact(inputs.purchasePrice)} ·{' '}
                {inputs.leasableArea.toLocaleString()} SQM
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{inputs.assetName}</p>
          </div>

          <KpiGrid
            noi={fmtCompact(results.noi)}
            dscr={results.dscr}
            irr={results.irr}
            em={results.equityMultiple}
            goingInCap={results.goingInCap}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <SensitivityHeatmap inputs={inputs} />
            <ScenarioChart inputs={inputs} />
          </div>

          <InvestmentMemo inputs={inputs} results={results} />
        </main>

        {/* Mobile parameter panel */}
        <div className="border-t border-border lg:hidden">
          <ParameterSidebar
            inputs={inputs}
            onChange={patch}
            onSave={handleSave}
            saving={saving}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
