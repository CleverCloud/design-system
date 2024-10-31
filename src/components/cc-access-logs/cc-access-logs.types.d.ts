import { Timezone } from '../../lib/date/date.types.js';
import { LogsControlPalette } from '../cc-logs-control/cc-logs-control.types.js';
import { DateDisplay } from '../cc-logs/date-display.types.js';

export interface AccessLogsState {
  type: 'connectingLogs' | 'receivingLogs' | 'logStreamPaused' | 'logStreamEnded' | 'errorLogs';
}

export interface AccessLogsOptions {
  'date-display': DateDisplay;
  palette: LogsControlPalette;
  timezone: Timezone;
}

export type ProgressState = 'none' | 'init' | 'started' | 'waiting' | 'running' | 'paused' | 'completed';
