/**
 * Credit Points (נקודות זיכוי) configuration — Tax Year 2026
 * Based on Israeli tax law. Update annually.
 */

export const CREDIT_POINT_MONTHLY_VALUE = 235; // ₪ per month
export const CREDIT_POINT_ANNUAL_VALUE = 2_820; // ₪ per year

// Base credit points for every Israeli resident
export const BASE_POINTS = {
  resident: 2.25,
  female: 0.5, // additional for women
};

// Children credit points by age range
// Points differ by parent gender and custody
export const CHILDREN_POINTS = [
  { minAge: 0, maxAge: 0, label: 'שנת לידה', points: 1.5, motherOnly: false },
  { minAge: 1, maxAge: 5, label: 'גיל 1–5', points: 2.5, motherOnly: false },
  { minAge: 6, maxAge: 12, label: 'גיל 6–12', points: 1.0, motherOnly: false },
  { minAge: 13, maxAge: 17, label: 'גיל 13–17', points: 1.0, motherOnly: false },
  { minAge: 18, maxAge: 18, label: 'גיל 18', points: 0.5, motherOnly: false },
];

// Single parent gets extra points
export const SINGLE_PARENT_POINTS = 1.0;

// Education credit points (one-time for limited years after graduation)
export const EDUCATION_POINTS = {
  bachelor: { points: 1.0, years: 1, label: 'תואר ראשון' },
  master: { points: 0.5, years: 1, label: 'תואר שני' },
  phd: { points: 1.0, years: 1, label: 'תואר שלישי' },
  vocational: { points: 1.0, years: 1, label: 'תעודת הנדסאי / מקצועי' },
};

// Special status credit points
export const SPECIAL_STATUS_POINTS = {
  newImmigrant: { points: 3.0, years: 1.5, label: 'עולה חדש (18 חודשים ראשונים)', secondPeriodPoints: 2.0, secondPeriodYears: 1 },
  returningResident: { points: 1.0, years: 2, label: 'תושב חוזר' },
  releasedSoldier: { points: 2.0, years: 3, label: 'חייל/ת משוחרר/ת' },
  nationalService: { points: 1.0, years: 3, label: 'שירות לאומי' },
};

// Disability points
export const DISABILITY_POINTS = {
  full: { points: 2.0, label: 'נכות 100% / עיוורון', minPercent: 90 },
  partial: { points: 0.5, label: 'נכות חלקית (מעל 89%)', minPercent: 90 },
};

// Priority area (Ezor Adifut)
export const PRIORITY_AREA_POINTS = {
  a: 0.5,
  b: 0.25,
};
