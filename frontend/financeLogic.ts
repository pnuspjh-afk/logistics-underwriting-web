/**
 * Logistics Underwriting Finance Logic (TypeScript Port)
 */

export interface UnderwritingInputs {
  purchasePrice: number;
  leasableArea: number;
  rentPerSqm: number;
  vacancyRate: number;
  opexRatio: number;
  annualCapex: number;
  ltv: number;
  interestRate: number;
  holdPeriod: number;
  exitCapRate: number;
  tenantConcentration: number;
}

export interface CalculationResult {
  gri: number;
  egi: number;
  opex: number;
  noi: number;
  loanAmount: number;
  annualDebtService: number;
  dscr: number;
  ltvEffective: number;
  exitValue: number;
  equity: number;
  irr: number;
  score: number;
}

// IRR Calculation using Newton-Raphson method
export function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const precision = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      dNpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }
    const newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < precision) return newRate;
    rate = newRate;
  }
  return 0; // Fallback
}

export function runUnderwriting(inputs: UnderwritingInputs): CalculationResult {
  const gri = inputs.leasableArea * inputs.rentPerSqm;
  const egi = gri * (1 - inputs.vacancyRate);
  const opex = egi * inputs.opexRatio;
  const noi = egi - opex - inputs.annualCapex;

  const loanAmount = inputs.purchasePrice * inputs.ltv;
  const annualDebtService = loanAmount * inputs.interestRate;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
  const ltvEffective = inputs.purchasePrice > 0 ? loanAmount / inputs.purchasePrice : 0;

  const exitValue = inputs.exitCapRate > 0 ? noi / inputs.exitCapRate : 0;
  const equity = inputs.purchasePrice - loanAmount;
  const cfAnnual = noi - annualDebtService;
  const saleProceeds = exitValue - loanAmount;

  // Build Cash Flows
  const cashFlows = [-equity];
  for (let i = 1; i < inputs.holdPeriod; i++) {
    cashFlows.push(cfAnnual);
  }
  cashFlows.push(cfAnnual + saleProceeds);

  const irr = calculateIRR(cashFlows);

  // Score Logic (0-100)
  let score = 0;
  if (dscr >= 1.4) score += 30; else if (dscr >= 1.0) score += ((dscr - 1) / 0.4) * 30;
  if (irr >= 0.15) score += 30; else if (irr >= 0.05) score += ((irr - 0.05) / 0.1) * 30;
  if (inputs.vacancyRate < 0.1) score += 20 * (1 - inputs.vacancyRate / 0.1);
  if (inputs.tenantConcentration < 0.5) score += 20 * (1 - inputs.tenantConcentration / 0.5);

  return {
    gri, egi, opex, noi,
    loanAmount, annualDebtService, dscr, ltvEffective,
    exitValue, equity, irr,
    score: Math.max(0, Math.min(100, Math.round(score)))
  };
}
