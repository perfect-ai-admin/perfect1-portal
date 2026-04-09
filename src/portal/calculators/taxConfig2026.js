/**
 * Israel tax configuration for self-employed — Tax Year 2026
 * Update this file annually to keep the calculator accurate.
 */

export const TAX_YEAR = 2026;

// Credit point value (monthly)
export const CREDIT_POINT_VALUE_MONTHLY = 235; // ₪ per month (2,820/year ÷ 12)

// Income tax brackets (annual amounts, rates are marginal)
export const TAX_BRACKETS = [
  { upTo: 84_120, rate: 0.10 },
  { upTo: 120_720, rate: 0.14 },
  { upTo: 193_800, rate: 0.20 },
  { upTo: 269_280, rate: 0.31 },
  { upTo: 560_280, rate: 0.35 },
  { upTo: 721_560, rate: 0.47 },
  { upTo: Infinity, rate: 0.50 },
];

// National Insurance (Bituach Leumi) rates for self-employed
// Reduced rate applies up to 60% of the average wage
export const NATIONAL_INSURANCE = {
  // Monthly thresholds
  minimumIncome: 7_522,    // Minimum insurable income
  reducedThreshold: 7_522, // Up to this amount — reduced rate
  maxInsurableIncome: 49_030, // Max monthly income for NI calculation

  // Bituach Leumi rates
  reducedRate: 0.0266,     // 2.66% on income up to threshold
  fullRate: 0.1183,        // 11.83% on income above threshold (up to max)

  // Health Insurance (Mas Briut) rates — collected together with NI
  healthReducedRate: 0.0312, // 3.12%
  healthFullRate: 0.0500,    // 5.00%
};
