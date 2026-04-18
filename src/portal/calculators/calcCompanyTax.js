/**
 * Company Tax (Hevra B.A.M) Calculator — Israel 2026
 * Calculates: corporate tax, dividend tax, salary cost, and net scenarios
 */

export const TAX_YEAR = 2026;

// === Configurable tax rates ===
export const COMPANY_TAX_CONFIG = {
  corporateTaxRate: 0.23,       // 23% corporate tax
  dividendTaxRate: 0.25,        // 25% dividend tax (controlling shareholder: 30%)
  dividendTaxRateControlling: 0.30, // 30% for controlling shareholder (>10%)
  surtaxThreshold: 721560,      // Annual income threshold for surtax
  surtaxRate: 0.03,             // 3% surtax on high income

  // Employer costs on salary
  employerNI: 0.0766,           // 7.66% employer national insurance (approx avg)
  employerPension: 0.0625,      // 6.25% employer pension contribution
  employerSeverance: 0.0833,    // 8.33% severance pay provision

  // Employee deductions from salary (approx)
  employeeNI: 0.035,            // ~3.5% employee NI (blended avg for typical salary)
  employeePension: 0.06,        // 6% employee pension

  // Income tax brackets (same as self-employed)
  incomeTaxBrackets: [
    { upTo: 84120, rate: 0.10 },
    { upTo: 120720, rate: 0.14 },
    { upTo: 193800, rate: 0.20 },
    { upTo: 269280, rate: 0.31 },
    { upTo: 560280, rate: 0.35 },
    { upTo: 721560, rate: 0.47 },
    { upTo: Infinity, rate: 0.50 },
  ],

  creditPointValue: 2820,       // Annual credit point value
  defaultCreditPoints: 2.25,    // Base credit points

  // Self-employed comparison rates
  selfEmployedNI_reduced: 0.0578,  // Up to 7,522/mo
  selfEmployedNI_full: 0.1683,     // Above 7,522/mo
  selfEmployedNI_threshold: 7522,
  selfEmployedNI_max: 49030,
};

/**
 * Calculate income tax on annual income using brackets
 */
function calcIncomeTax(annualIncome, creditPoints = 2.25) {
  let tax = 0;
  let prev = 0;
  for (const bracket of COMPANY_TAX_CONFIG.incomeTaxBrackets) {
    if (annualIncome <= prev) break;
    const taxable = Math.min(annualIncome, bracket.upTo) - prev;
    tax += taxable * bracket.rate;
    prev = bracket.upTo;
  }
  const credit = creditPoints * COMPANY_TAX_CONFIG.creditPointValue;
  return Math.max(tax - credit, 0);
}

/**
 * Calculate self-employed NI + health (for comparison)
 */
function calcSelfEmployedNI(monthlyProfit) {
  const cfg = COMPANY_TAX_CONFIG;
  const base = Math.min(Math.max(monthlyProfit, cfg.selfEmployedNI_threshold), cfg.selfEmployedNI_max);
  if (base <= cfg.selfEmployedNI_threshold) {
    return base * cfg.selfEmployedNI_reduced;
  }
  return (cfg.selfEmployedNI_threshold * cfg.selfEmployedNI_reduced) +
    ((base - cfg.selfEmployedNI_threshold) * cfg.selfEmployedNI_full);
}

/**
 * Main calculator
 */
export function calcCompanyTax({
  annualRevenue,
  annualExpenses = 0,
  monthlySalary = 0,         // Owner salary (monthly gross)
  dividendAmount = 0,        // Annual dividend to withdraw
  isControlling = true,      // >10% shareholder
  creditPoints = 2.25,
  additionalIncome = 0,      // Other personal annual income
}) {
  // === COMPANY LEVEL ===
  const annualSalary = monthlySalary * 12;

  // Employer costs on salary
  const employerNICost = annualSalary * COMPANY_TAX_CONFIG.employerNI;
  const employerPensionCost = annualSalary * COMPANY_TAX_CONFIG.employerPension;
  const employerSeveranceCost = annualSalary * COMPANY_TAX_CONFIG.employerSeverance;
  const totalEmployerCost = employerNICost + employerPensionCost + employerSeveranceCost;
  const totalSalaryCostToCompany = annualSalary + totalEmployerCost;

  // Company profit before tax (salary is an expense)
  const profitBeforeTax = Math.max(annualRevenue - annualExpenses - totalSalaryCostToCompany, 0);

  // Corporate tax
  const corporateTax = profitBeforeTax * COMPANY_TAX_CONFIG.corporateTaxRate;
  const profitAfterTax = profitBeforeTax - corporateTax;

  // === DIVIDEND ===
  const actualDividend = Math.min(dividendAmount, profitAfterTax);
  const dividendTaxRate = isControlling
    ? COMPANY_TAX_CONFIG.dividendTaxRateControlling
    : COMPANY_TAX_CONFIG.dividendTaxRate;
  const dividendTax = actualDividend * dividendTaxRate;
  const netDividend = actualDividend - dividendTax;

  // Remaining in company
  const remainingInCompany = profitAfterTax - actualDividend;

  // === SALARY — PERSONAL TAX ===
  const totalPersonalIncome = annualSalary + additionalIncome;
  const incomeTaxOnSalary = calcIncomeTax(totalPersonalIncome, creditPoints);
  const employeeNI = annualSalary * COMPANY_TAX_CONFIG.employeeNI;
  const employeePension = annualSalary * COMPANY_TAX_CONFIG.employeePension;
  const totalPersonalDeductions = incomeTaxOnSalary + employeeNI + employeePension;
  const netSalary = annualSalary - totalPersonalDeductions;

  // === TOTAL NET TO OWNER ===
  const totalNetToOwner = netSalary + netDividend;
  const totalTaxPaid = corporateTax + dividendTax + incomeTaxOnSalary + employeeNI + employeePension + totalEmployerCost;

  // Effective rate on what owner receives
  const grossToOwner = annualSalary + actualDividend;
  const effectiveRate = grossToOwner > 0
    ? ((1 - totalNetToOwner / (annualRevenue - annualExpenses)) * 100).toFixed(1)
    : '0.0';

  // === 3 SCENARIOS ===
  const scenarios = calcScenarios(annualRevenue, annualExpenses, creditPoints, isControlling, additionalIncome);

  // === COMPARISON: Company vs Self-Employed ===
  const comparison = calcComparison(annualRevenue, annualExpenses, monthlySalary, actualDividend, creditPoints, isControlling, additionalIncome);

  return {
    // Company level
    annualRevenue,
    annualExpenses,
    profitBeforeTax: Math.round(profitBeforeTax),
    corporateTax: Math.round(corporateTax),
    corporateTaxRate: COMPANY_TAX_CONFIG.corporateTaxRate,
    profitAfterTax: Math.round(profitAfterTax),

    // Salary
    annualSalary,
    monthlySalary,
    totalSalaryCostToCompany: Math.round(totalSalaryCostToCompany),
    employerCosts: Math.round(totalEmployerCost),
    incomeTaxOnSalary: Math.round(incomeTaxOnSalary),
    employeeNI: Math.round(employeeNI),
    employeePension: Math.round(employeePension),
    netSalaryAnnual: Math.round(netSalary),
    netSalaryMonthly: Math.round(netSalary / 12),

    // Dividend
    actualDividend: Math.round(actualDividend),
    dividendTaxRate,
    dividendTax: Math.round(dividendTax),
    netDividend: Math.round(netDividend),

    // Totals
    remainingInCompany: Math.round(remainingInCompany),
    totalNetToOwner: Math.round(totalNetToOwner),
    totalNetMonthly: Math.round(totalNetToOwner / 12),
    totalTaxPaid: Math.round(totalTaxPaid),
    effectiveRate,

    // Scenarios & comparison
    scenarios,
    comparison,
  };
}

/**
 * Calculate 3 withdrawal scenarios
 */
function calcScenarios(revenue, expenses, creditPoints, isControlling, additionalIncome) {
  const profit = revenue - expenses;
  if (profit <= 0) return { keepInCompany: 0, allSalary: 0, allDividend: 0, optimal: 0, optimalMethod: 'none' };

  // Scenario A: Keep all in company
  const corpTax = profit * COMPANY_TAX_CONFIG.corporateTaxRate;
  const keepInCompany = Math.round(profit - corpTax);

  // Scenario B: All as salary
  const salaryMonthly = Math.round(profit / 12 / 1.22); // rough: divide by (1 + employer costs)
  const salaryAnnual = salaryMonthly * 12;
  const employerCosts = salaryAnnual * (COMPANY_TAX_CONFIG.employerNI + COMPANY_TAX_CONFIG.employerPension + COMPANY_TAX_CONFIG.employerSeverance);
  const totalCost = salaryAnnual + employerCosts;
  const remainingProfit = Math.max(profit - totalCost, 0);
  const corpTaxOnRemaining = remainingProfit * COMPANY_TAX_CONFIG.corporateTaxRate;
  const incomeTax = calcIncomeTax(salaryAnnual + additionalIncome, creditPoints);
  const empNI = salaryAnnual * COMPANY_TAX_CONFIG.employeeNI;
  const empPension = salaryAnnual * COMPANY_TAX_CONFIG.employeePension;
  const allSalary = Math.round(salaryAnnual - incomeTax - empNI - empPension);

  // Scenario C: All as dividend
  const divRate = isControlling ? COMPANY_TAX_CONFIG.dividendTaxRateControlling : COMPANY_TAX_CONFIG.dividendTaxRate;
  const afterCorpTax = profit - corpTax;
  const divTax = afterCorpTax * divRate;
  const allDividend = Math.round(afterCorpTax - divTax);

  // Scenario D: Optimal mix (salary up to ~15K/mo + rest as dividend)
  const optSalaryMonthly = Math.min(Math.round(profit / 12 * 0.4), 20000); // ~40% as salary, max 20K
  const optSalaryAnnual = optSalaryMonthly * 12;
  const optEmployerCosts = optSalaryAnnual * (COMPANY_TAX_CONFIG.employerNI + COMPANY_TAX_CONFIG.employerPension + COMPANY_TAX_CONFIG.employerSeverance);
  const optProfit = Math.max(profit - optSalaryAnnual - optEmployerCosts, 0);
  const optCorpTax = optProfit * COMPANY_TAX_CONFIG.corporateTaxRate;
  const optAfterCorpTax = optProfit - optCorpTax;
  const optDivTax = optAfterCorpTax * divRate;
  const optNetDiv = optAfterCorpTax - optDivTax;
  const optIncomeTax = calcIncomeTax(optSalaryAnnual + additionalIncome, creditPoints);
  const optEmpNI = optSalaryAnnual * COMPANY_TAX_CONFIG.employeeNI;
  const optEmpPension = optSalaryAnnual * COMPANY_TAX_CONFIG.employeePension;
  const optNetSalary = optSalaryAnnual - optIncomeTax - optEmpNI - optEmpPension;
  const optimal = Math.round(optNetSalary + optNetDiv);

  // Find best
  const results = [
    { method: 'keepInCompany', net: keepInCompany, label: 'השאר בחברה' },
    { method: 'allSalary', net: allSalary, label: 'הכל כמשכורת' },
    { method: 'allDividend', net: allDividend, label: 'הכל כדיבידנד' },
    { method: 'optimal', net: optimal, label: 'שילוב משכורת + דיבידנד' },
  ];
  const best = results.reduce((a, b) => b.net > a.net ? b : a);

  return {
    keepInCompany,
    allSalary,
    allDividend,
    optimal,
    optimalSalary: optSalaryMonthly,
    bestMethod: best.method,
    bestLabel: best.label,
    bestNet: best.net,
  };
}

/**
 * Company vs Self-Employed comparison
 */
function calcComparison(revenue, expenses, salary, dividend, creditPoints, isControlling, additionalIncome) {
  const profit = revenue - expenses;
  if (profit <= 0) return { companyNet: 0, selfEmployedNet: 0, difference: 0, betterOption: 'none' };

  // Company: optimal scenario
  const scenarios = calcScenarios(revenue, expenses, creditPoints, isControlling, additionalIncome);
  const companyNet = scenarios.bestNet;

  // Self-employed
  const monthlyProfit = profit / 12;
  const annualNI = calcSelfEmployedNI(monthlyProfit) * 12;
  const annualIncomeTax = calcIncomeTax(profit + additionalIncome, creditPoints);
  const selfEmployedNet = Math.round(profit - annualNI - annualIncomeTax);

  const difference = companyNet - selfEmployedNet;
  const betterOption = difference > 0 ? 'company' : difference < 0 ? 'selfEmployed' : 'same';

  return {
    companyNet,
    selfEmployedNet,
    difference: Math.round(difference),
    betterOption,
    betterLabel: betterOption === 'company' ? 'חברה בע"מ' : betterOption === 'selfEmployed' ? 'עוסק מורשה' : 'דומה',
  };
}
