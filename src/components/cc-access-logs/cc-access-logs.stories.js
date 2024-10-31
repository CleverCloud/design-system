import { randomPick } from '../../lib/utils.js';
import { makeStory } from '../../stories/lib/make-story.js';
import './cc-access-logs.js';

export default {
  title: '🚧 Beta/🛠 Access Logs/<cc-access-logs-beta>',
  component: 'cc-access-logs-beta',
};

const conf = {
  component: 'cc-access-logs-beta',
  beta: true,
  // language=CSS
  css: `
    cc-access-logs-beta {
      height: 800px;
    }
  `,
};

/**
 * @typedef {import('./cc-access-logs.js').CcAccessLogs} CcAccessLogs
 * @typedef {import('../cc-logs/cc-logs.types.js').Log} Log
 */

const d = new Date();

const IPS = ['192.168.12.1', '192.168.48.157', '192.85.8.63'];
const LOCATIONS = ['FR|Paris', 'GB|London', 'FR|Nantes', 'FR|Brive-la-Gaillarde'];
const ENDPOINTS = ['GET|/ping', 'GET|/orga/12', 'POST|/orga', 'GET|/profile', 'PUT|/profile'];
const STATUS = ['100', '200', '301', '404', '500'];

/**
 * @param {number} index
 * @param {boolean} [fakeTime]
 * @return {Log}
 */
const generateLog = (index, fakeTime = true) => {
  const [country, city] = randomPick(LOCATIONS).split('|');
  const [method, path] = randomPick(ENDPOINTS).split('|');
  return {
    id: `${index}`,
    date: fakeTime ? new Date(d.getTime() + index) : new Date(),
    message: path,
    metadata: [
      { name: 'ip', value: randomPick(IPS) },
      { name: 'country', value: country },
      { name: 'city', value: city },
      { name: 'method', value: method },
      { name: 'status', value: randomPick(STATUS) },
    ],
  };
};

/**
 *
 * @param {number} count
 * @param {(index: number) => Log} logFactory
 * @return {Array<Log>}
 */
function generateLogs(count, logFactory = generateLog) {
  return Array(count)
    .fill(0)
    .map((_, index) => logFactory(index));
}

export const defaultStory = makeStory(conf, {
  items: [
    {
      state: { type: 'connectingLogs' },
    },
  ],
  onUpdateComplete:
    /** @param {CcAccessLogs} component */
    (component) => {
      component.state = { type: 'receivingLogs' };
      component.updateComplete.then(() => {
        component.appendLogs(generateLogs(100));
      });
    },
});

export const connectingToLogsStream = makeStory(conf, {
  items: [
    {
      state: { type: 'connectingLogs' },
    },
  ],
});

export const waitingForLiveLogs = makeStory(conf, {
  items: [
    {
      state: { type: 'connectingLogs' },
    },
  ],
  onUpdateComplete:
    /** @param {CcAccessLogs} component */
    (component) => {
      component.state = { type: 'receivingLogs' };
    },
});

export const error = makeStory(conf, {
  items: [
    {
      state: { type: 'errorLogs' },
    },
  ],
});

export const paused = makeStory(conf, {
  items: [
    {
      state: { type: 'logStreamPaused' },
    },
  ],
});

export const ended = makeStory(conf, {
  items: [
    {
      state: { type: 'logStreamEnded' },
    },
  ],
});
