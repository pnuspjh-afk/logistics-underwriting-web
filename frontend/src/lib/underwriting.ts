// 물류 부동산 언더라이팅 핵심 엔진 (한글화 버전)
// 모든 수치는 KRW(원) 및 SQM(제곱미터) 기준입니다.

export interface UWInputs {
  projectName: string;
  assetName: string;
  purchasePrice: number; // 원
  leasableArea: number; // sqm
  rentPerSqm: number; // 원/sqm/년
  vacancy: number; // % (0-100)
  opexRatio: number; // % of EGI
  ltv: number; // % (0-100)
  interestRate: number; // % annual
  amortYears: number; // years
  exitCapRate: number; // %
  rentGrowth: number; // % annual
  holdYears: number; // years
}

export const DEFAULT_INPUTS: UWInputs = {
  projectName: '신규 물류센터 투자 프로젝트',
  assetName: '이천시 물류센터 A동',
  purchasePrice: 50000000000,
  leasableArea: 20000,
  rentPerSqm: 120000,
  vacancy: 5,
  opexRatio: 20,
  ltv: 60,
  interestRate: 4.5,
  amortYears: 20,
  exitCapRate: 5.5,
  rentGrowth: 2.5,
  holdYears: 5,
};

export interface UWResults {
  gpr: number; // 잠재 총임대수입 (Gross Potential Rent)
  egi: number; // 유효 총수입 (Effective Gross Income)
  opex: number; // 운영비
  noi: number; // 1년차 순영업소득 (NOI)
  goingInCap: number; // % (Entry Cap)
  loanAmount: number; // 대출금액
  equity: number; // 자기자본
  annualDebtService: number; // 연간 부채서비스액
  dscr: number; // 부채상환배수
  exitNoi: number; // 매각 시점 NOI
  exitValue: number; // 매각 가액
  saleCosts: number; // 매각 비용
  netSaleProceeds: number; // 순매각대금
  loanBalanceAtExit: number; // 매각 시점 대출 잔액
  equityAtExit: number; // 매각 시점 지분 가치
  cashFlows: number[]; // 초기 투자 포함 현금흐름
  irr: number; // % (IRR)
  equityMultiple: number; // 자본배수 (EM)
  avgCashOnCash: number; // % (평균 배당수익률)
}

function pmt(rate: number, nper: number, pv: number): number {
  if (rate === 0) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

function loanBalance(
  principal: number,
  monthlyRate: number,
  totalMonths: number,
  monthsPaid: number
): number {
  if (monthlyRate === 0) return principal * (1 - monthsPaid / totalMonths);
  const payment = pmt(monthlyRate, totalMonths, principal);
  const growth = Math.pow(1 + monthlyRate, monthsPaid);
  return principal * growth - payment * ((growth - 1) / monthlyRate);
}

function calculateIRR(cashFlows: number[], guess = 0.1): number {
  let rate = guess;
  for (let i = 0; i < 200; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      if (t > 0) dNpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dNpv) < 1e-10) break;
    const next = rate - npv / dNpv;
    if (!isFinite(next)) break;
    if (Math.abs(next - rate) < 1e-7) {
      rate = next;
      break;
    }
    rate = next;
  }
  return rate * 100;
}

export function underwrite(input: UWInputs): UWResults {
  const gpr = input.leasableArea * input.rentPerSqm;
  const egi = gpr * (1 - input.vacancy / 100);
  const opex = egi * (input.opexRatio / 100);
  const noi = egi - opex;
  const goingInCap = (noi / input.purchasePrice) * 100;

  const loanAmount = input.purchasePrice * (input.ltv / 100);
  const equity = input.purchasePrice - loanAmount;
  const monthlyRate = input.interestRate / 100 / 12;
  const totalMonths = input.amortYears * 12;
  const monthlyPayment = pmt(monthlyRate, totalMonths, loanAmount);
  const annualDebtService = monthlyPayment * 12;
  const dscr = noi / annualDebtService;

  const cashFlows: number[] = [-equity];
  let cocSum = 0;
  for (let year = 1; year <= input.holdYears; year++) {
    const grownNoi = noi * Math.pow(1 + input.rentGrowth / 100, year - 1);
    const cfBeforeReversion = grownNoi - annualDebtService;
    cocSum += (cfBeforeReversion / equity) * 100;
    if (year < input.holdYears) {
      cashFlows.push(cfBeforeReversion);
    } else {
      const exitNoi = noi * Math.pow(1 + input.rentGrowth / 100, year);
      const exitValue = exitNoi / (input.exitCapRate / 100);
      const saleCosts = exitValue * 0.02;
      const loanBalanceAtExit = loanBalance(
        loanAmount,
        monthlyRate,
        totalMonths,
        input.holdYears * 12
      );
      const netSaleProceeds = exitValue - saleCosts - loanBalanceAtExit;
      cashFlows.push(cfBeforeReversion + netSaleProceeds);
    }
  }

  const exitNoi = noi * Math.pow(1 + input.rentGrowth / 100, input.holdYears);
  const exitValue = exitNoi / (input.exitCapRate / 100);
  const saleCosts = exitValue * 0.02;
  const loanBalanceAtExit = loanBalance(
    loanAmount,
    monthlyRate,
    totalMonths,
    input.holdYears * 12
  );
  const netSaleProceeds = exitValue - saleCosts - loanBalanceAtExit;

  const totalDistributions = cashFlows.slice(1).reduce((a, b) => a + b, 0);
  const equityMultiple = (totalDistributions) / equity;

  return {
    gpr,
    egi,
    opex,
    noi,
    goingInCap,
    loanAmount,
    equity,
    annualDebtService,
    dscr,
    exitNoi,
    exitValue,
    saleCosts,
    netSaleProceeds,
    loanBalanceAtExit,
    equityAtExit: netSaleProceeds,
    cashFlows,
    irr: calculateIRR(cashFlows),
    equityMultiple,
    avgCashOnCash: cocSum / input.holdYears,
  };
}

export function sensitivityIRR(
  base: UWInputs,
  vacancy: number,
  exitCapRate: number
): number {
  return underwrite({ ...base, vacancy, exitCapRate }).irr;
}

export interface ScenarioPoint {
  year: number;
  downside: number;
  base: number;
  upside: number;
}

export function buildScenarios(input: UWInputs): ScenarioPoint[] {
  const make = (i: UWInputs) => underwrite(i);
  const baseR = make(input);
  const downR = make({
    ...input,
    vacancy: input.vacancy + 5,
    rentGrowth: Math.max(0, input.rentGrowth - 2),
    exitCapRate: input.exitCapRate + 0.75,
  });
  const upR = make({
    ...input,
    vacancy: Math.max(0, input.vacancy - 3),
    rentGrowth: input.rentGrowth + 1.5,
    exitCapRate: Math.max(3, input.exitCapRate - 0.5),
  });

  const cumulative = (r: UWResults) => {
    const points: number[] = [];
    let cum = 0;
    for (let t = 1; t < r.cashFlows.length; t++) {
      cum += r.cashFlows[t];
      points.push(cum / r.equity);
    }
    return points;
  };

  const b = cumulative(baseR);
  const d = cumulative(downR);
  const u = cumulative(upR);

  const out: ScenarioPoint[] = [{ year: 0, downside: -1, base: -1, upside: -1 }];
  for (let i = 0; i < b.length; i++) {
    out.push({
      year: i + 1,
      downside: d[i] - 1,
      base: b[i] - 1,
      upside: u[i] - 1,
    });
  }
  return out;
}

// ---- 포맷터 (한글/KRW 기준) ----
export const fmtCurrency = (n: number) => {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
};

export const fmtCompact = (n: number) => {
  return `${(n / 100000000).toFixed(1)}억`;
};

export const fmtPct = (n: number, d = 1) => `${n.toFixed(d)}%`;
export const fmtX = (n: number) => `${n.toFixed(2)}x`;
