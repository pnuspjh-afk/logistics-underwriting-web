import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { UWInputs, buildScenarios } from '@/lib/underwriting'

interface ScenarioChartProps {
  inputs: UWInputs
}

export const ScenarioChart: React.FC<ScenarioChartProps> = ({ inputs }) => {
  const data = useMemo(() => buildScenarios(inputs), [inputs])

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="border-b border-slate-800/50 pb-4">
        <CardTitle className="text-sm font-bold text-slate-300">시나리오별 누적 자본배수 추이 (Equity Multiple)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="year" 
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(v) => `${v}년`}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(v) => `${v.toFixed(1)}x`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                formatter={(value: number) => [`${(value + 1).toFixed(2)}x`, '']}
                labelFormatter={(v) => `${v}년차`}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
              <Line 
                name="Best (낙관)" 
                type="monotone" 
                dataKey="upside" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 5 }} 
              />
              <Line 
                name="Base (기본)" 
                type="monotone" 
                dataKey="base" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                name="Worst (비관)" 
                type="monotone" 
                dataKey="downside" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 5 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-slate-500 uppercase tracking-widest">
           <span>* EM 1.0x 이하는 원금 손실 구간</span>
        </div>
      </CardContent>
    </Card>
  )
}
