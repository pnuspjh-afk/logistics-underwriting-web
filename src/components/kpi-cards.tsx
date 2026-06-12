import React from 'react'
import { DollarSign, Shield, TrendingUp, ArrowUpRight, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KpiGridProps {
  noi: string
  dscr: number
  irr: number
  em: number
  goingInCap: number
}

export const KpiGrid: React.FC<KpiGridProps> = ({ noi, dscr, irr, em, goingInCap }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">순영업소득 (NOI)</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{noi}</div>
          <p className="text-xs text-slate-500 mt-1">1년차 예상 수지</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">부채상환배수 (DSCR)</CardTitle>
          <Shield className="h-4 w-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${dscr < 1.2 ? 'text-red-400' : 'text-slate-100'}`}>
            {dscr.toFixed(2)}x
          </div>
          <p className="text-xs text-slate-500 mt-1">Lender 요구치: 1.2x</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">내부수익률 (IRR)</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">{irr.toFixed(2)}%</div>
          <p className="text-xs text-slate-500 mt-1">지분 투자자 수익률</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">자본배수 (EM)</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{em.toFixed(2)}x</div>
          <p className="text-xs text-slate-500 mt-1">투자 원금 대비 배수</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">매입 캡레이트</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{goingInCap.toFixed(2)}%</div>
          <p className="text-xs text-slate-500 mt-1">Entry Cap Rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
