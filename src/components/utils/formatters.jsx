/**
 * Utility functions for formatting numbers and currency according to Israeli standards
 * As per Perfect-1.one FE Specification Document section 4.2.4
 */

/**
 * Format currency in Israeli format
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted currency string (e.g., "₪1,000.50")
 */
export function formatCurrency(amount, showDecimals = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₪0';
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `₪${formatted}`;
}

/**
 * Format large numbers with abbreviations
 * @param {number} num - The number to format
 * @returns {string} Abbreviated number (e.g., "1.2M" for 1,200,000)
 */
export function formatLargeNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
}

/**
 * Format number with thousands separator
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number (e.g., "1,000")
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage (e.g., "15.5%")
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
}

/**
 * Get color code based on trend
 * @param {number} trend - The trend value
 * @returns {string} Color code
 */
export function getTrendColor(trend) {
  if (trend > 0) return '#22C55E'; // Green
  if (trend < 0) return '#EF4444'; // Red
  return '#6B7280'; // Gray
}

/**
 * Get trend color class for Tailwind
 * @param {number} trend - The trend value
 * @returns {string} Tailwind color class
 */
export function getTrendColorClass(trend) {
  if (trend > 0) return 'text-green-600';
  if (trend < 0) return 'text-red-600';
  return 'text-gray-600';
}