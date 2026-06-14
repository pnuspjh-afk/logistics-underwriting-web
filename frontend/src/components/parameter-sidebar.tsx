'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Cloud,
  Database,
  Loader2,
  Building2,
  SlidersHorizontal,
} from 'lucide-react'
import type { UWInputs } from '@/lib/underwriting'

interface ParamRowProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}

function ParamRow({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  format,
}: ParamRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {format ? format(value) : value}
          <span className="ml-0.5 text-[10px] text-muted-foreground">
            {unit}
          </span>
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  )
}

interface SidebarProps {
  inputs: UWInputs
  onChange: (patch: Partial<UWInputs>) => void
  onSave: () => void
  saving: boolean
  className?: string
}

export function ParameterSidebar({
  inputs,
  onChange,
  onSave,
  saving,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        <SlidersHorizontal className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Underwriting Parameters</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 p-4">
          {/* Deal identity */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="project"
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
              >
                <Building2 className="size-3" />
                Project Name
              </Label>
              <Input
                id="project"
                value={inputs.projectName}
                onChange={(e) => onChange({ projectName: e.target.value })}
                className="h-9 font-medium"
                placeholder="Deal identifier"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset" className="text-xs font-medium text-muted-foreground">
                Asset / Building
              </Label>
              <Input
                id="asset"
                value={inputs.assetName}
                onChange={(e) => onChange({ assetName: e.target.value })}
                className="h-9"
                placeholder="Asset name"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Acquisition
            </span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {inputs.squareFeet.toLocaleString()} SF
            </Badge>
          </div>

          <ParamRow
            label="Purchase Price"
            value={inputs.purchasePrice}
            unit=""
            min={10_000_000}
            max={120_000_000}
            step={500_000}
            onChange={(v) => onChange({ purchasePrice: v })}
            format={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
          />
          <ParamRow
            label="Rentable Area"
            value={inputs.squareFeet}
            unit="SF"
            min={50_000}
            max={1_000_000}
            step={5_000}
            onChange={(v) => onChange({ squareFeet: v })}
            format={(v) => (v / 1000).toFixed(0) + 'k'}
          />
          <ParamRow
            label="Base Rent"
            value={inputs.rentPsf}
            unit="/SF"
            min={4}
            max={30}
            step={0.1}
            onChange={(v) => onChange({ rentPsf: v })}
            format={(v) => `$${v.toFixed(2)}`}
          />

          <Separator />

          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operating Assumptions
          </span>
          <ParamRow
            label="Stabilized Vacancy"
            value={inputs.vacancy}
            unit="%"
            min={0}
            max={25}
            step={0.5}
            onChange={(v) => onChange({ vacancy: v })}
            format={(v) => v.toFixed(1)}
          />
          <ParamRow
            label="OpEx Ratio"
            value={inputs.opexRatio}
            unit="%"
            min={10}
            max={45}
            step={0.5}
            onChange={(v) => onChange({ opexRatio: v })}
            format={(v) => v.toFixed(1)}
          />
          <ParamRow
            label="Annual Rent Growth"
            value={inputs.rentGrowth}
            unit="%"
            min={0}
            max={8}
            step={0.25}
            onChange={(v) => onChange({ rentGrowth: v })}
            format={(v) => v.toFixed(2)}
          />

          <Separator />

          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Debt & Exit
          </span>
          <ParamRow
            label="Loan-to-Value (LTV)"
            value={inputs.ltv}
            unit="%"
            min={0}
            max={80}
            step={1}
            onChange={(v) => onChange({ ltv: v })}
            format={(v) => v.toFixed(0)}
          />
          <ParamRow
            label="Interest Rate"
            value={inputs.interestRate}
            unit="%"
            min={3}
            max={10}
            step={0.05}
            onChange={(v) => onChange({ interestRate: v })}
            format={(v) => v.toFixed(2)}
          />
          <ParamRow
            label="Exit Cap Rate"
            value={inputs.exitCapRate}
            unit="%"
            min={3.5}
            max={9}
            step={0.05}
            onChange={(v) => onChange({ exitCapRate: v })}
            format={(v) => v.toFixed(2)}
          />
          <ParamRow
            label="Hold Period"
            value={inputs.holdYears}
            unit="yrs"
            min={3}
            max={10}
            step={1}
            onChange={(v) => onChange({ holdYears: v })}
            format={(v) => v.toFixed(0)}
          />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <Button
          onClick={onSave}
          disabled={saving}
          className="w-full font-medium"
          size="lg"
        >
          {saving ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Database data-icon="inline-start" />
          )}
          {saving ? 'Saving to Supabase…' : 'Save to Supabase'}
        </Button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Cloud className="size-3" />
          Persisted to your underwriting workspace
        </p>
      </div>
    </aside>
  )
}
