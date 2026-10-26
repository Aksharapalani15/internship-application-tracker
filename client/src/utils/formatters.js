/**
 * UI Data Formatting Helpers
 */

/**
 * Formats an ISO YYYY-MM-DD or date string into user-friendly format (e.g., "Oct 15, 2026")
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    // If date is pure YYYY-MM-DD, parse parts manually to avoid UTC offset shifts
    const parts = String(dateString).slice(0, 10).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats numeric stipend with currency symbol or code
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined || amount === '') return '—';
  const num = Number(amount);
  if (isNaN(num)) return '—';

  try {
    if (currency === 'INR') {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    if (currency === 'USD') {
      return `$${num.toLocaleString('en-US')}`;
    }
    return `${currency} ${num.toLocaleString()}`;
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Computes human-friendly relative distance from today (e.g. "Due in 3 days", "Due today", "Overdue by 2 days")
 */
export function getRelativeDeadline(dateString) {
  if (!dateString) return null;
  const parts = String(dateString).slice(0, 10).split('-');
  if (parts.length !== 3) return null;

  const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { text: 'Due Today', isOverdue: false, isToday: true, days: 0 };
  }
  if (diffDays === 1) {
    return { text: 'Due Tomorrow', isOverdue: false, isToday: false, days: 1 };
  }
  if (diffDays > 1) {
    return { text: `Due in ${diffDays} days`, isOverdue: false, isToday: false, days: diffDays };
  }
  return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isToday: false, days: diffDays };
}
