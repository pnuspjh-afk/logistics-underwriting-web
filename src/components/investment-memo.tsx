import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { UWInputs, UWResults, fmtCurrency, fmtPct } from '@/lib/underwriting'

interface InvestmentMemoProps {
  inputs: UWInputs
  results: UWResults
}

export const InvestmentMemo: React.FC<InvestmentMemoProps> = ({ inputs, results }) => {
  const isProceed = results.irr >= 12 && results.dscr >= 1.25

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="border-b border-slate-800/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          투자 검토 메모 (Automated Memo)
        </CardTitle>
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isProceed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
          {isProceed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {isProceed ? '투자 권고: Proceed' : '추가 검토 필요: Review'}
        </div>
      </CardHeader>
      <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
        {/* 투자 요약 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Lightbulb className="w-4 h-4" />
            투자 메리트 (Merits)
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              {inputs.location} 권역 내 경쟁력 있는 임대료 (sqm당 {inputs.rentPerSqm.toLocaleString()}원) 확보
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              LTV {fmtPct(inputs.ltv, 0)} 수준의 안정적인 선순위 대출 구조 활용 가능
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              목표 IRR {results.irr.toFixed(1)}% 달성으로 타겟 수익률 상회 기대
            </li>
          </ul>
        </div>

        {/* 주요 리스크 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            주요 리스크 (Risks)
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="text-orange-500">•</span>
              매각 캡레이트 {fmtPct(inputs.exitCapRate, 2)} 가정 시 시장 금리 변동에 따른 Exit Value 하락 위험
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">•</span>
              공실률 {fmtPct(inputs.vacancy, 1)} 초과 시 DSCR {results.dscr.toFixed(2)}x 미만 하락 가능성
            </li>
            {inputs.holdYears >= 7 && (
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                장기 보유에 따른 자산 노후화 및 Capex 비용 증가 우려
              </li>
            )}
          </ul>
        </div>

        {/* 종합 의견 */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Executive Summary</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            본 건은 <span className="text-slate-100 font-semibold">{inputs.assetName}</span> 매입 건으로, 
            총 {fmtCurrency(inputs.purchasePrice)} 투자 규모입니다. 
            운영 기간 중 평균 배당률 {fmtPct(results.avgCashOnCash, 1)} 수준의 현금 흐름이 기대되며, 
            보수적인 시나리오 하에서도 원금 회수가 가능한 {results.equityMultiple.toFixed(2)}x의 배수를 보여주고 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
