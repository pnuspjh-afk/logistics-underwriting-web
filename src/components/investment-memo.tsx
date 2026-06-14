'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  fmtCompact,
  fmtCurrency,
  fmtPct,
  fmtX,
  type UWInputs,
  type UWResults,
} from '@/lib/underwriting'

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-medium tabular-nums">{value}</span>
    </div>
  )
}

export function InvestmentMemo({
  inputs,
  results,
}: {
  inputs: UWInputs
  results: UWResults
}) {
  const recommend = results.irr >= 15 && results.dscr >= 1.25
  const caution = !recommend && results.irr >= 10 && results.dscr >= 1.1

  return (
    <Card className="glass border-border/80">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-primary" />
              Investment Committee Memo
            </CardTitle>
            <CardDescription>
              {inputs.projectName} — {inputs.assetName}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              recommend
                ? 'border-pos/40 text-pos'
                : caution
                  ? 'border-warn/40 text-warn'
                  : 'border-neg/40 text-neg'
            }
          >
            {recommend ? (
              <CheckCircle2 data-icon="inline-start" />
            ) : (
              <AlertTriangle data-icon="inline-start" />
            )}
            {recommend
              ? 'Recommend Proceed'
              : caution
                ? 'Proceed with Conditions'
                : 'Below Hurdle'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          The {inputs.assetName.toLowerCase()} acquisition at{' '}
          <span className="font-medium text-foreground">
            {fmtCompact(inputs.purchasePrice)}
          </span>{' '}
          (
          <span className="font-mono text-foreground">
            {fmtCurrency(inputs.purchasePrice / inputs.leasableArea)}/㎡
          </span>
          ) underwrites to a{' '}
          <span className="font-medium text-foreground">
            {fmtPct(results.goingInCap, 2)}
          </span>{' '}
          going-in cap and a{' '}
          <span className="font-medium text-foreground">
            {fmtPct(results.irr)}
          </span>{' '}
          levered IRR over a {inputs.holdYears}-year hold. Day-one leverage of{' '}
          {fmtPct(inputs.ltv, 0)} LTV yields a{' '}
          <span className="font-medium text-foreground">
            {fmtX(results.dscr)}
          </span>{' '}
          DSCR{' '}
          {results.dscr >= 1.25
            ? 'comfortably clearing the 1.25x covenant.'
            : 'which sits inside the lender covenant band and warrants a reserve.'}
        </p>

        <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Year 1 Operations
            </span>
            <div className="mt-1">
              <Line label="Gross Potential Rent" value={fmtCurrency(results.gpr)} />
              <Line label="Effective Gross Income" value={fmtCurrency(results.egi)} />
              <Line label="Operating Expenses" value={`(${fmtCurrency(results.opex)})`} />
              <Line label="Net Operating Income" value={fmtCurrency(results.noi)} />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Capital Stack & Exit
            </span>
            <div className="mt-1">
              <Line label="Loan Amount" value={fmtCurrency(results.loanAmount)} />
              <Line label="Equity Required" value={fmtCurrency(results.equity)} />
              <Line label="Exit Value" value={fmtCompact(results.exitValue)} />
              <Line label="Net Sale Proceeds" value={fmtCompact(results.netSaleProceeds)} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-3">
          {[
            { k: 'Equity Multiple', v: fmtX(results.equityMultiple) },
            { k: 'Avg Cash-on-Cash', v: fmtPct(results.avgCashOnCash) },
            { k: 'Annual Debt Service', v: fmtCompact(results.annualDebtService) },
          ].map((m) => (
            <div
              key={m.k}
              className="flex flex-col gap-0.5 rounded-md bg-secondary/40 p-2.5"
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.k}
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums">
                {m.v}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
