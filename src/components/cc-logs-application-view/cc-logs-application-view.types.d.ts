import { Timezone } from '../../lib/date/date.types.js';
import { LogsControlPalette } from '../cc-logs-control/cc-logs-control.types.js';
import { GhostInstance, Instance } from '../cc-logs-instances/cc-logs-instances.types.js';
import { DateDisplay } from '../cc-logs/date-display.types.js';

export interface LogsApplicationViewStateLoadingInstances {
  type: 'loadingInstances';
}

export interface LogsApplicationViewStateErrorInstances {
  type: 'errorInstances';
}

export interface LogsApplicationViewStateLogs {
  type: 'connectingLogs' | 'receivingLogs' | 'logStreamPaused' | 'logStreamEnded' | 'errorLogs';
  instances: Array<Instance | GhostInstance>;
  selection: Array<string>;
}

export type LogsApplicationViewState =
  | LogsApplicationViewStateLoadingInstances
  | LogsApplicationViewStateLogs
  | LogsApplicationViewStateErrorInstances;

export interface LogsApplicationViewOptions {
  'date-display': DateDisplay;
  'metadata-display': {
    instance: boolean;
  };
  palette: LogsControlPalette;
  'strip-ansi': boolean;
  timezone: Timezone;
  'wrap-lines': boolean;
}

export type ProgressState = 'none' | 'init' | 'started' | 'waiting' | 'running' | 'paused' | 'completed';
