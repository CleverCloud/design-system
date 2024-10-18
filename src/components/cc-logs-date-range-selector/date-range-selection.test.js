/* eslint-env node, mocha */

import { expect } from '@open-wc/testing';
import { withMockedNow } from '../../../test/helpers/mock-now.js';
import { dateRangeSelectionToDateRange } from './date-range-selection.js';

describe('date-range-selection', () => {
  it('should generate a live range', () => {
    withMockedNow('2024-10-17T16:00:00.000Z', () => {
      expect(dateRangeSelectionToDateRange({ type: 'live' })).to.deep.equal({
        since: '2024-10-17T15:50:00.000Z',
      });
    });
  });

  it('should generate a today range', () => {
    withMockedNow('2024-10-17T16:00:00.000Z', () => {
      expect(dateRangeSelectionToDateRange({ type: 'preset', preset: 'today' })).to.deep.equal({
        since: '2024-10-17T00:00:00.000Z',
        until: '2024-10-17T16:00:00.000Z',
      });
    });
  });

  it('should generate a yesterday range', () => {
    withMockedNow('2024-10-17T16:00:00.000Z', () => {
      expect(dateRangeSelectionToDateRange({ type: 'preset', preset: 'yesterday' })).to.deep.equal({
        since: '2024-10-16T00:00:00.000Z',
        until: '2024-10-16T23:59:59.999Z',
      });
    });
  });

  it('should generate a lastHour range', () => {
    withMockedNow('2024-10-17T16:00:00.000Z', () => {
      expect(dateRangeSelectionToDateRange({ type: 'preset', preset: 'lastHour' })).to.deep.equal({
        since: '2024-10-17T15:00:00.000Z',
        until: '2024-10-17T16:00:00.000Z',
      });
    });
  });

  it('should generate a last4Hours range', () => {
    withMockedNow('2024-10-17T16:00:00.000Z', () => {
      expect(dateRangeSelectionToDateRange({ type: 'preset', preset: 'last4Hours' })).to.deep.equal({
        since: '2024-10-17T12:00:00.000Z',
        until: '2024-10-17T16:00:00.000Z',
      });
    });
  });

  it('should generate a last7Days range', () => {
    withMockedNow('2024-10-17T16:00:00.000Z', () => {
      expect(dateRangeSelectionToDateRange({ type: 'preset', preset: 'last7Days' })).to.deep.equal({
        since: '2024-10-10T00:00:00.000Z',
        until: '2024-10-17T16:00:00.000Z',
      });
    });
  });

  it('should generate a custom range', () => {
    expect(
      dateRangeSelectionToDateRange({
        type: 'custom',
        since: '2024-10-10T00:00:00.000Z',
        until: '2024-10-17T16:00:00.000Z',
      }),
    ).to.deep.equal({
      since: '2024-10-10T00:00:00.000Z',
      until: '2024-10-17T16:00:00.000Z',
    });
  });
});
