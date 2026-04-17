// Income Tax Calculator for Self-Employed in Israel (2026)
// Only income tax — no national insurance

export const TAX_YEAR = 2026;
export const CREDIT_POINT_VALUE_MONTHLY = 235;
export const CREDIT_POINT_VALUE_ANNUAL = 2820;

export const TAX_BRACKETS = [
  { upTo: 84120, rate: 0.10 },
  { upTo: 120720, rate: 0.14 },
  { upTo: 193800, rate: 0.20 },
  { upTo: 269280, rate: 0.31 },
  { upTo: 560280, rate: 0.35 },
  { upTo: 721560, rate: 0.47 },
  { upTo: Infinity, rate: 0.50 },
];

export const DEFAULT_CREDIT_POINTS = {
  single: 2.25,
  married: 2.25,
  married_kids: 3.75,
};

export function calcIncomeTax({
  monthlyIncome,
  monthlyExpenses = 0,
  creditPoints = 2.25,
  businessType = 'patur', // 'patur' or 'murshe'
  additionalIncome = 0, // monthly salary income
}) {
  const monthlyProfit = Math.max(monthlyIncome - monthlyExpenses, 0);
  const annualProfit = monthlyProfit * 12;
  const annualAdditional = additionalIncome * 12;
  const totalAnnualIncome = annualProfit + annualAdditional;

  // Calculate tax by brackets
  let annualTax = 0;
  let previousLimit = 0;
  const bracketBreakdown = [];

  for (const bracket of TAX_BRACKETS) {
    if (totalAnnualIncome <= previousLimit) break;
    const taxableInBracket = Math.min(totalAnnualIncome, bracket.upTo) - previousLimit;
    const taxInBracket = taxableInBracket * bracket.rate;
    annualTax += taxInBracket;
    bracketBreakdown.push({
      from: previousLimit,
      to: Math.min(totalAnnualIncome, bracket.upTo),
      rate: bracket.rate,
      taxable: taxableInBracket,
      tax: Math.round(taxInBracket),
    });
    previousLimit = bracket.upTo;
  }

  // Subtract credit points
  const annualCredit = creditPoints * CREDIT_POINT_VALUE_ANNUAL;
  const annualTaxAfterCredit = Math.max(annualTax - annualCredit, 0);

  // Monthly values
  const monthlyTax = Math.round(annualTaxAfterCredit / 12);
  const monthlyNet = monthlyProfit - monthlyTax;

  // Effective tax rate
  const effectiveRate = annualProfit > 0
    ? ((annualTaxAfterCredit / annualProfit) * 100).toFixed(1)
    : '0.0';

  return {
    // Inputs echo
    monthlyIncome,
    monthlyExpenses,
    monthlyProfit,
    annualProfit,
    creditPoints,
    businessType,
    additionalIncome,
    totalAnnualIncome,

    // Tax results
    annualTaxBeforeCredit: Math.round(annualTax),
    annualCredit: Math.round(annualCredit),
    annualTaxAfterCredit: Math.round(annualTaxAfterCredit),
    monthlyTax,
    monthlyNet,
    effectiveRate,

    // Breakdown
    bracketBreakdown,
  };
}
