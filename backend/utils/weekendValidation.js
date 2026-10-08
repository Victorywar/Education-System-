/**
 * Phase 7 — Weekend / holiday validation helpers
 */

// Mini-project approved holiday dates (YYYY-MM-DD)
const APPROVED_HOLIDAYS = [
  '2026-08-15', // Independence Day (example)
  '2026-10-02', // Gandhi Jayanti (example)
  '2026-12-25', // Christmas (example)
];

const WEEKEND_DAYS = new Set(['Saturday', 'Sunday', 'Holiday']);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseIsoDate(dateStr) {
  const parts = String(dateStr).split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function getWeekdayName(dateStr) {
  const date = parseIsoDate(dateStr);
  if (!date) return null;
  return DAY_NAMES[date.getUTCDay()];
}

/**
 * True if class is allowed as weekend/holiday community session.
 */
function isWeekendOrHolidaySession(day, dateStr) {
  if (!WEEKEND_DAYS.has(day)) return false;

  if (day === 'Holiday') {
    return APPROVED_HOLIDAYS.includes(dateStr) || day === 'Holiday';
  }

  const weekday = getWeekdayName(dateStr);
  if (!weekday) return false;
  return weekday === day;
}

/**
 * Next N upcoming Saturdays/Sundays from a base date (local calendar math via UTC).
 */
function getUpcomingWeekendDates(count = 4, fromDate = new Date()) {
  const results = [];
  const cursor = new Date(Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()));
  while (results.length < count) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const day = DAY_NAMES[cursor.getUTCDay()];
    if (day === 'Saturday' || day === 'Sunday') {
      const iso = cursor.toISOString().slice(0, 10);
      results.push({ date: iso, day });
    }
  }
  return results;
}

function formatDisplayDate(dateStr) {
  const date = parseIsoDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

module.exports = {
  APPROVED_HOLIDAYS,
  isWeekendOrHolidaySession,
  getUpcomingWeekendDates,
  formatDisplayDate,
  getWeekdayName,
};
