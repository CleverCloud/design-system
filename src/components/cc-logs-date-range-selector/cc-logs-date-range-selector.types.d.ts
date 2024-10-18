import { DateRange } from '../../lib/date/date-range.types.js';

export type LogsDateRangeSelection =
  | LogsDateRangeSelectionLive
  | LogsDateRangeSelectionPreset
  | LogsDateRangeSelectionCustom;

export interface LogsDateRangeSelectionLive {
  type: 'live';
}

export interface LogsDateRangeSelectionPreset {
  type: 'preset';
  preset: LogsDateRangePresetType;
}

export interface LogsDateRangeSelectionCustom {
  type: 'custom';
  since: string;
  until: string;
}

export type LogsDateRangePresetType = 'lastHour' | 'last4Hours' | 'last7Days' | 'today' | 'yesterday';

export type LogsDateRangeSelectOption = 'live' | 'custom' | LogsDateRangePresetType;

export interface LogsDateRangeSelectionChangeEventData {
  selection: LogsDateRangeSelection;
  range: DateRange;
}
