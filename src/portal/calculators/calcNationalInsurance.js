/**
 * National Insurance (Bituach Leumi) + Health Tax Calculator
 * for self-employed in Israel — Tax Year 2026
 *
 * Separate from income tax. Calculates NI + health insurance only.
 */

export const TAX_YEAR = 2026;

// NI rates for self-employed (monthly basis)
export const NI_CONFIG = {
  minimumIncome: 7522,       // Minimum insurable monthly income
  reducedThreshold: 7522,    // Up to this — reduced rate
  maxInsurableIncome: 49030, // Max monthly income for NI

  // Bituach Leumi rates
  niReducedRate: 0.0266,     // 2.66%
  niFullRate: 0.1183,        // 11.83%

  // Health Insurance (Mas Briut)
  healthReducedRate: 0.0312, // 3.12%
  healthFullRate: 0.0500,    // 5.00%

  // Combined rates (for display)
  get combinedReducedRate() { return this.niReducedRate + this.healthReducedRate; }, // 5.78%
  get combinedFullRate() { return this.niFullRate + this.healthFullRate; },         // 16.83%
};

// Comparison scenarios
export const COMPARISON_INCOMES = [8000, 12000, 20000, 30000, 45000];

export function calcNationalInsurance({
  monthlyIncome,
  monthlyExpenses = 0,
  businessType = 'patur',    // 'patur' or 'murshe'
  activeMonths = 12,
  additionalIncome = 0,      // monthly salary (already has NI deducted by employer)
  isNewBusiness = false,
}) {
  const monthlyProfit = Math.max(monthlyIncome - monthlyExpenses, 0);
  const annualProfit = monthlyProfit * activeMonths;

  // Base income for NI calculation
  // For self-employed, NI is calculated on the profit (income minus expenses)
  // Minimum is the minimum insurable income
  const niBaseMonthly = Math.max(monthlyProfit, NI_CONFIG.minimumIncome);
  const cappedBase = Math.min(niBaseMonthly, NI_CONFIG.maxInsurableIncome);

  // --- Calculate NI (Bituach Leumi) ---
  let monthlyNI = 0;
  let monthlyNI_reduced = 0;
  let monthlyNI_full = 0;

  if (cappedBase <= NI_CONFIG.reducedThreshold) {
    // All income in reduced bracket
    monthlyNI_reduced = cappedBase * NI_CONFIG.niReducedRate;
    monthlyNI = monthlyNI_reduced;
  } else {
    // Split: reduced on first part, full on rest
    monthlyNI_reduced = NI_CONFIG.reducedThreshold * NI_CONFIG.niReducedRate;
    monthlyNI_full = (cappedBase - NI_CONFIG.reducedThreshold) * NI_CONFIG.niFullRate;
    monthlyNI = monthlyNI_reduced + monthlyNI_full;
  }

  // --- Calculate Health Tax (Mas Briut) ---
  let monthlyHealth = 0;
  let monthlyHealth_reduced = 0;
  let monthlyHealth_full = 0;

  if (cappedBase <= NI_CONFIG.reducedThreshold) {
    monthlyHealth_reduced = cappedBase * NI_CONFIG.healthReducedRate;
    monthlyHealth = monthlyHealth_reduced;
  } else {
    monthlyHealth_reduced = NI_CONFIG.reducedThreshold * NI_CONFIG.healthReducedRate;
    monthlyHealth_full = (cappedBase - NI_CONFIG.reducedThreshold) * NI_CONFIG.healthFullRate;
    monthlyHealth = monthlyHealth_reduced + monthlyHealth_full;
  }

  // Combined
  const monthlyTotal = monthlyNI + monthlyHealth;
  const annualTotal = Math.round(monthlyTotal * activeMonths);

  // Remaining after NI+health
  const monthlyRemaining = monthlyProfit - monthlyTotal;

  // Effective rate
  const effectiveRate = monthlyProfit > 0
    ? ((monthlyTotal / monthlyProfit) * 100).toFixed(1)
    : '0.0';

  // Rate bracket info
  const isReducedOnly = cappedBase <= NI_CONFIG.reducedThreshold;
  const isMaxed = niBaseMonthly >= NI_CONFIG.maxInsurableIncome;

  return {
    // Inputs
    monthlyIncome,
    monthlyExpenses,
    monthlyProfit,
    annualProfit,
    activeMonths,
    businessType,
    isNewBusiness,

    // NI base
    niBaseMonthly: Math.round(cappedBase),
    isReducedOnly,
    isMaxed,

    // NI breakdown
    monthlyNI: Math.round(monthlyNI),
    monthlyNI_reduced: Math.round(monthlyNI_reduced),
    monthlyNI_full: Math.round(monthlyNI_full),

    // Health breakdown
    monthlyHealth: Math.round(monthlyHealth),
    monthlyHealth_reduced: Math.round(monthlyHealth_reduced),
    monthlyHealth_full: Math.round(monthlyHealth_full),

    // Totals
    monthlyTotal: Math.round(monthlyTotal),
    annualTotal,
    monthlyRemaining: Math.round(monthlyRemaining),
    effectiveRate,

    // Rates used
    niReducedRate: NI_CONFIG.niReducedRate,
    niFullRate: NI_CONFIG.niFullRate,
    healthReducedRate: NI_CONFIG.healthReducedRate,
    healthFullRate: NI_CONFIG.healthFullRate,
  };
}

/**
 * Generate comparison table for different income levels
 */
export function calcComparisonTable(expenses = 0) {
  return COMPARISON_INCOMES.map(income => {
    const result = calcNationalInsurance({ monthlyIncome: income, monthlyExpenses: expenses });
    return {
      income,
      profit: result.monthlyProfit,
      ni: result.monthlyNI,
      health: result.monthlyHealth,
      total: result.monthlyTotal,
      remaining: result.monthlyRemaining,
      effectiveRate: result.effectiveRate,
    };
  });
}
