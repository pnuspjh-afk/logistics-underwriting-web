import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UWInputs, sensitivityIRR } from '@/lib/underwriting'

interface SensitivityHeatmapProps {
  inputs: UWInputs
}

export const SensitivityHeatmap: React.FC<SensitivityHeatmapProps> = ({ inputs }) => {
  const vacancySteps = [0, 2, 4, 6, 8, 10]
  const capRateSteps = useMemo(() => {
    const base = inputs.exitCapRate
    return [base - 0.5, base - 0.25, base, base + 0.25, base + 0.5]
  }, [inputs.exitCapRate])

  const grid = useMemo(() => {
    return vacancySteps.map(v => {
      return capRateSteps.map(c => ({
        vacancy: v,
        capRate: c,
        irr: sensitivityIRR(inputs, v, c)
      }))
    })
  }, [inputs, vacancySteps, capRateSteps])

  const getColor = (irr: number) => {
    if (irr >= 15) return 'bg-green-500 text-white'
    if (irr >= 12) return 'bg-green-400 text-slate-900'
    if (irr >= 10) return 'bg-emerald-200 text-emerald-900'
    if (irr >= 8) return 'bg-yellow-100 text-yellow-900'
    if (irr >= 6) return 'bg-orange-200 text-orange-900'
    return 'bg-red-400 text-white'
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="border-b border-slate-800/50 pb-4">
        <CardTitle className="text-sm font-bold text-slate-300">민감도 분석: 공실률 vs 매각 캡레이트 (IRR %)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {/* X-axis label */}
          <div className="text-center mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            ← 매각 캡레이트 (%) →
          </div>

          <div className="flex">
            {/* Y-axis label */}
            <div className="vertical-text absolute -left-8 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-slate-500" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
              ← 공실률 (%) →
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-6 gap-1">
                {/* Corner */}
                <div className="h-8 flex items-center justify-center text-[10px] text-slate-600 font-bold border-b border-r border-slate-800">VAC\CAP</div>
                {capRateSteps.map(c => (
                  <div key={c} className="h-8 flex items-center justify-center text-[10px] font-mono text-slate-400 border-b border-slate-800">
                    {c.toFixed(2)}%
                  </div>
                ))}

                {grid.map((row, i) => (
                  <React.Fragment key={i}>
                    <div className="h-10 flex items-center justify-center text-[10px] font-mono text-slate-400 border-r border-slate-800">
                      {vacancySteps[i]}%
                    </div>
                    {row.map((cell, j) => (
                      <div 
                        key={j} 
                        className={`h-10 flex items-center justify-center text-xs font-bold rounded-sm transition-all hover:scale-105 hover:z-10 cursor-default ${getColor(cell.irr)}`}
                        title={`공실 ${cell.vacancy}%, 매각캡 ${cell.capRate.toFixed(2)}% => IRR ${cell.irr.toFixed(1)}%`}
                      >
                        {cell.irr.toFixed(1)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
