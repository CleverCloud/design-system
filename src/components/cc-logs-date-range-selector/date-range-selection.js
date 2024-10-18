/**
 * @typedef {import('./cc-logs-date-range-selector.types.js').LogsDateRangeSelection} LogsDateRangeSelection
 * @typedef {import('../../lib/date/date-range.types.js').DateRange} DateRange
 */

import { getRangeToNow, lastXDays, today, yesterday } from '../../lib/date/date-range-utils.js';

/**
 * @param {LogsDateRangeSelection} dateRangeSelection
 * @return {DateRange}
 */
export function dateRangeSelectionToDateRange(dateRangeSelection) {
  switch (dateRangeSelection.type) {
    case 'custom':
      return {
        since: dateRangeSelection.since,
        until: dateRangeSelection.until,
      };
    case 'live':
      return {
        since: getRangeToNow(1000 * 60 * 10).since,
      };
    case 'preset':
      switch (dateRangeSelection.preset) {
        case 'lastHour':
          return getRangeToNow(1000 * 60 * 60);
        case 'last4Hours':
          return getRangeToNow(1000 * 60 * 60 * 4);
        case 'last7Days':
          return lastXDays(7);
        case 'today':
          return today();
        case 'yesterday':
          return yesterday();
      }
  }
}
