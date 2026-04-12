import {
  BASE_POINTS,
  CHILDREN_POINTS,
  SINGLE_PARENT_POINTS,
  EDUCATION_POINTS,
  SPECIAL_STATUS_POINTS,
  CREDIT_POINT_MONTHLY_VALUE,
  CREDIT_POINT_ANNUAL_VALUE,
} from './creditPointsConfig';
import { TAX_BRACKETS } from './taxConfig2026';

/**
 * Calculate total credit points and tax savings.
 *
 * @param {Object} input
 * @param {number} input.monthlyIncome - Monthly gross income
 * @param {string} input.incomeType - 'employee' | 'selfEmployed' | 'both'
 * @param {string} input.gender - 'male' | 'female'
 * @param {boolean} input.isResident - Israeli resident
 * @param {string} input.maritalStatus - 'single' | 'married' | 'divorced' | 'widowed' | 'commonLaw'
 * @param {boolean} input.spouseWorks
 * @param {boolean} input.spouseGetsChildPoints
 * @param {number[]} input.childrenAges - Array of children ages
 * @param {boolean} input.isSingleParent
 * @param {Object} input.specialStatus - { newImmigrant, returningResident, releasedSoldier, nationalService }
 * @param {Object} input.education - { bachelor, master, phd, vocational }
 * @param {Object} input.disabilities - { hasDisability, percent, blind, specialNeedsChild }
 * @param {boolean} input.priorityArea - 'a' | 'b' | null
 * @returns {Object} Breakdown of credit points and tax savings
 */
export function calculateCreditPoints(input) {
  const breakdown = [];
  let totalPoints = 0;

  // 1. Base — resident
  if (input.isResident) {
    const pts = BASE_POINTS.resident;
    totalPoints += pts;
    breakdown.push({ source: 'תושב/ת ישראל', points: pts });
  }

  // 2. Gender
  if (input.gender === 'female') {
    const pts = BASE_POINTS.female;
    totalPoints += pts;
    breakdown.push({ source: 'אישה', points: pts });
  }

  // 3. Children
  if (input.childrenAges?.length > 0) {
    let childTotal = 0;
    for (const age of input.childrenAges) {
      const bracket = CHILDREN_POINTS.find(b => age >= b.minAge && age <= b.maxAge);
      if (bracket) {
        childTotal += bracket.points;
      }
    }
    // If spouse gets child points, assume split
    if (input.spouseGetsChildPoints) {
      childTotal = childTotal / 2;
    }
    if (childTotal > 0) {
      totalPoints += childTotal;
      breakdown.push({ source: `ילדים (${input.childrenAges.length})`, points: childTotal });
    }
  }

  // 4. Single parent
  if (input.isSingleParent && input.childrenAges?.length > 0) {
    totalPoints += SINGLE_PARENT_POINTS;
    breakdown.push({ source: 'הורה יחיד/נית', points: SINGLE_PARENT_POINTS });
  }

  // 5. Education
  for (const [key, config] of Object.entries(EDUCATION_POINTS)) {
    if (input.education?.[key]) {
      totalPoints += config.points;
      breakdown.push({ source: config.label, points: config.points });
    }
  }

  // 6. Special status
  for (const [key, config] of Object.entries(SPECIAL_STATUS_POINTS)) {
    if (input.specialStatus?.[key]) {
      totalPoints += config.points;
      breakdown.push({ source: config.label, points: config.points });
    }
  }

  // 7. Disability
  if (input.disabilities?.hasDisability) {
    if (input.disabilities.blind || input.disabilities.percent >= 90) {
      totalPoints += 2.0;
      breakdown.push({ source: 'נכות מלאה / עיוורון', points: 2.0 });
    }
  }
  if (input.disabilities?.specialNeedsChild) {
    totalPoints += 1.0;
    breakdown.push({ source: 'ילד/ה עם צרכים מיוחדים', points: 1.0 });
  }

  // Calculate tax savings
  const monthlySaving = Math.round(totalPoints * CREDIT_POINT_MONTHLY_VALUE);
  const annualSaving = Math.round(totalPoints * CREDIT_POINT_ANNUAL_VALUE);

  // Calculate actual tax (to show how much tax before/after credits)
  const annualIncome = (input.monthlyIncome || 0) * 12;
  let annualTaxBeforeCredits = 0;
  let prev = 0;
  for (const { upTo, rate } of TAX_BRACKETS) {
    if (annualIncome <= prev) break;
    const taxable = Math.min(annualIncome, upTo) - prev;
    annualTaxBeforeCredits += taxable * rate;
    prev = upTo;
  }
  const annualTaxAfterCredits = Math.max(0, annualTaxBeforeCredits - annualSaving);
  const monthlyTaxBefore = Math.round(annualTaxBeforeCredits / 12);
  const monthlyTaxAfter = Math.round(annualTaxAfterCredits / 12);

  return {
    totalPoints: Math.round(totalPoints * 100) / 100,
    breakdown,
    monthlySaving,
    annualSaving,
    monthlyTaxBefore,
    monthlyTaxAfter,
    monthlyIncome: input.monthlyIncome || 0,
  };
}
