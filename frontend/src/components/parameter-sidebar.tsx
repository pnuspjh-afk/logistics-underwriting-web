import React from 'react'
import { Settings, Save, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { UWInputs, fmtCurrency, fmtPct } from '@/lib/underwriting'
import { cn } from '@/lib/utils'

interface ParameterSidebarProps {
  inputs: UWInputs
  onChange: (p: Partial<UWInputs>) => void
  onSave: () => void
  saving: boolean
  className?: string
}

export const ParameterSidebar: React.FC<ParameterSidebarProps> = ({
  inputs,
  onChange,
  onSave,
  saving,
  className
}) => {
  return (
    <aside className={cn("flex flex-col border-r border-slate-800 bg-slate-950/50 backdrop-blur-md", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-slate-800">
        <Settings className="w-5 h-5 text-blue-400" />
        <h2 className="font-bold text-slate-100">투자 시나리오 설정</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">기본 정보</h3>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">프로젝트명</Label>
              <Input 
                value={inputs.projectName} 
                onChange={e => onChange({ projectName: e.target.value })}
                className="bg-slate-900 border-slate-800 h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">자산명</Label>
              <Input 
                value={inputs.assetName} 
                onChange={e => onChange({ assetName: e.target.value })}
                className="bg-slate-900 border-slate-800 h-8 text-sm"
              />
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* 수지 및 면적 가정 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">수지 및 면적 가정</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">매입가</Label>
                <span className="text-xs font-mono text-blue-400 font-bold">{fmtCurrency(inputs.purchasePrice)}</span>
              </div>
              <Input 
                type="number"
                value={inputs.purchasePrice} 
                onChange={e => onChange({ purchasePrice: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 h-8 text-sm"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">임대면적 (sqm)</Label>
                <span className="text-xs font-mono text-slate-300">{inputs.leasableArea.toLocaleString()} sqm</span>
              </div>
              <Input 
                type="number"
                value={inputs.leasableArea} 
                onChange={e => onChange({ leasableArea: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 h-8 text-sm"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">임대료 (원/sqm/년)</Label>
                <span className="text-xs font-mono text-slate-300">{inputs.rentPerSqm.toLocaleString()}원</span>
              </div>
              <Input 
                type="number"
                value={inputs.rentPerSqm} 
                onChange={e => onChange({ rentPerSqm: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 h-8 text-sm"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">공실률</Label>
                <span className="text-xs font-mono text-blue-400 font-bold">{fmtPct(inputs.vacancy)}</span>
              </div>
              <Slider 
                value={[inputs.vacancy]} 
                onValueChange={v => onChange({ vacancy: v[0] })}
                max={30} step={0.5}
                className="accent-blue-500"
              />
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* 금융 및 매각 가정 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">금융 및 매각 가정</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">LTV</Label>
                <span className="text-xs font-mono text-blue-400 font-bold">{fmtPct(inputs.ltv)}</span>
              </div>
              <Slider 
                value={[inputs.ltv]} 
                onValueChange={v => onChange({ ltv: v[0] })}
                max={80} step={1}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">이자율 (금리)</Label>
                <span className="text-xs font-mono text-blue-400 font-bold">{fmtPct(inputs.interestRate)}</span>
              </div>
              <Slider 
                value={[inputs.interestRate]} 
                onValueChange={v => onChange({ interestRate: v[0] })}
                max={10} step={0.1}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">매각 캡레이트</Label>
                <span className="text-xs font-mono text-orange-400 font-bold">{fmtPct(inputs.exitCapRate)}</span>
              </div>
              <Slider 
                value={[inputs.exitCapRate]} 
                onValueChange={v => onChange({ exitCapRate: v[0] })}
                max={10} min={3} step={0.1}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-400">보유 기간 (년)</Label>
                <span className="text-xs font-mono text-slate-300">{inputs.holdYears}년</span>
              </div>
              <Slider 
                value={[inputs.holdYears]} 
                onValueChange={v => onChange({ holdYears: v[0] })}
                max={10} min={1} step={1}
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-800">
        <Button 
          onClick={onSave} 
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2"
        >
          {saving ? <Database className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Supabase에 저장
        </Button>
      </div>
    </aside>
  )
}
