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
import { type UWInputs, fmtCompact } from '@/lib/underwriting'

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
          {format ? format(value) : value.toLocaleString()}
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
        <h2 className="text-sm font-semibold">언더라이팅 파라미터</h2>
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
                프로젝트명
              </Label>
              <Input
                id="project"
                value={inputs.projectName}
                onChange={(e) => onChange({ projectName: e.target.value })}
                className="h-9 font-medium"
                placeholder="프로젝트 식별자"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset" className="text-xs font-medium text-muted-foreground">
                자산 / 건물명
              </Label>
              <Input
                id="asset"
                value={inputs.assetName}
                onChange={(e) => onChange({ assetName: e.target.value })}
                className="h-9"
                placeholder="자산명"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              자산 매입 조건
            </span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {inputs.leasableArea.toLocaleString()} SQM
            </Badge>
          </div>

          <ParamRow
            label="매입 가격"
            value={inputs.purchasePrice}
            unit=""
            min={1000000000}
            max={200000000000}
            step={500000000}
            onChange={(v) => onChange({ purchasePrice: v })}
            format={(v) => fmtCompact(v)}
          />
          <ParamRow
            label="임대 면적"
            value={inputs.leasableArea}
            unit="SQM"
            min={1000}
            max={100000}
            step={500}
            onChange={(v) => onChange({ leasableArea: v })}
          />
          <ParamRow
            label="기본 임대료"
            value={inputs.rentPerSqm}
            unit="/SQM"
            min={10000}
            max={500000}
            step={1000}
            onChange={(v) => onChange({ rentPerSqm: v })}
            format={(v) => v.toLocaleString()}
          />

          <Separator />

          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            운영 가이드라인
          </span>
          <ParamRow
            label="목표 공실률"
            value={inputs.vacancy}
            unit="%"
            min={0}
            max={30}
            step={0.5}
            onChange={(v) => onChange({ vacancy: v })}
            format={(v) => v.toFixed(1)}
          />
          <ParamRow
            label="운영비(OpEx) 비율"
            value={inputs.opexRatio}
            unit="%"
            min={5}
            max={50}
            step={1}
            onChange={(v) => onChange({ opexRatio: v })}
            format={(v) => v.toFixed(0)}
          />
          <ParamRow
            label="연간 임대료 상승률"
            value={inputs.rentGrowth}
            unit="%"
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => onChange({ rentGrowth: v })}
            format={(v) => v.toFixed(1)}
          />

          <Separator />

          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            금융 및 매각
          </span>
          <ParamRow
            label="LTV (담보인정비율)"
            value={inputs.ltv}
            unit="%"
            min={0}
            max={85}
            step={1}
            onChange={(v) => onChange({ ltv: v })}
            format={(v) => v.toFixed(0)}
          />
          <ParamRow
            label="대출 금리"
            value={inputs.interestRate}
            unit="%"
            min={2}
            max={12}
            step={0.1}
            onChange={(v) => onChange({ interestRate: v })}
            format={(v) => v.toFixed(1)}
          />
          <ParamRow
            label="매각 캡레이트 (Exit Cap)"
            value={inputs.exitCapRate}
            unit="%"
            min={3}
            max={10}
            step={0.05}
            onChange={(v) => onChange({ exitCapRate: v })}
            format={(v) => v.toFixed(2)}
          />
          <ParamRow
            label="보유 기간"
            value={inputs.holdYears}
            unit="년"
            min={1}
            max={15}
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
          {saving ? 'Supabase 저장 중…' : 'Supabase에 저장'}
        </Button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Cloud className="size-3" />
          언더라이팅 데이터가 클라우드에 영구 저장됩니다
        </p>
      </div>
    </aside>
  )
}
