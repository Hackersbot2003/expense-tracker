/**
 * Resolves a "quick filter" keyword into a concrete [start, end] Date range,
 * shared by the transactions list and analytics endpoints so the definitions
 * of "this month", "last 3 months", etc. never drift between the two.
 */
export type QuickFilter =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'this_year';

export const resolveQuickFilter = (filter: QuickFilter, now: Date = new Date()): { start: Date; end: Date } => {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'today':
      return { start, end };

    case 'this_week': {
      const day = start.getDay(); // 0 = Sunday
      start.setDate(start.getDate() - day);
      return { start, end };
    }

    case 'this_month':
      start.setDate(1);
      return { start, end };

    case 'last_month': {
      start.setMonth(start.getMonth() - 1, 1);
      const lastMonthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end: lastMonthEnd };
    }

    case 'last_3_months':
      start.setMonth(start.getMonth() - 2, 1);
      return { start, end };

    case 'this_year':
      start.setMonth(0, 1);
      return { start, end };

    default:
      return { start, end };
  }
};
