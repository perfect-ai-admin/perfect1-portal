import {
  TAX_BRACKETS,
  CREDIT_POINT_VALUE_MONTHLY,
  NATIONAL_INSURANCE,
} from './taxConfig2026';

/**
 * Calculate annual income tax using progressive brackets.
 * Returns the annual tax BEFORE credit point deduction.
 */
function calcAnnualIncomeTax(annualProfit) {
  if (annualProfit <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const { upTo, rate } of TAX_BRACKETS) {
    if (annualProfit <= prev) break;
    const taxable = Math.min(annualProfit, upTo) - prev;
    tax += taxable * rate;
    prev = upTo;
  }
  return tax;
}

/**
 * Calculate monthly National Insurance + Health Insurance for self-employed.
 */
function calcMonthlyNI(monthlyProfit) {
  if (monthlyProfit <= 0) return 0;
  const { reducedThreshold, maxInsurableIncome, reducedRate, fullRate, healthReducedRate, healthFullRate } = NATIONAL_INSURANCE;

  const capped = Math.min(monthlyProfit, maxInsurableIncome);

  // Reduced portion
  const reducedPortion = Math.min(capped, reducedThreshold);
  // Full portion
  const fullPortion = Math.max(0, capped - reducedThreshold);

  const niAmount = reducedPortion * reducedRate + fullPortion * fullRate;
  const healthAmount = reducedPortion * healthReducedRate + fullPortion * healthFullRate;

  return Math.round(niAmount + healthAmount);
}

/**
 * Main calculator function.
 * @param {Object} input
 * @param {number} input.monthlyGross - Monthly gross income
 * @param {number} input.monthlyExpenses - Monthly recognized expenses
 * @param {number} input.creditPoints - Number of credit points (e.g. 2.25)
 * @returns {Object} Calculation results
 */
export function calculateNetIncome({ monthlyGross, monthlyExpenses, creditPoints }) {
  const monthlyProfit = Math.max(0, monthlyGross - monthlyExpenses);
  const annualProfit = monthlyProfit * 12;

  // Income tax
  const annualTaxBeforeCredit = calcAnnualIncomeTax(annualProfit);
  const annualCreditDeduction = creditPoints * CREDIT_POINT_VALUE_MONTHLY * 12;
  const annualTax = Math.max(0, annualTaxBeforeCredit - annualCreditDeduction);
  const monthlyIncomeTax = Math.round(annualTax / 12);

  // National Insurance + Health
  const monthlyNI = calcMonthlyNI(monthlyProfit);

  // Net
  const monthlyNet = monthlyProfit - monthlyIncomeTax - monthlyNI;

  return {
    monthlyGross,
    monthlyExpenses,
    monthlyProfit,
    monthlyIncomeTax,
    monthlyNI,
    monthlyNet,
    annualProfit,
    annualTax,
    effectiveTaxRate: monthlyProfit > 0 ? ((monthlyIncomeTax + monthlyNI) / monthlyProfit * 100).toFixed(1) : '0',
  };
}
