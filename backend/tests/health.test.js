import { healthCheck } from '../src/utils/healthCheck.js';

describe('healthCheck', () => {
  it('returns ok status', () => {
    expect(healthCheck()).toEqual({ status: 'ok' });
  });
});
