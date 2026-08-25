import { afterEach, describe, expect, it, vi } from 'vitest';

import { getLatestStockPrices } from './fmp';

afterEach(() => vi.unstubAllEnvs());

describe('quote fallbacks', () => {
  it('returns explicit nulls when the API key is absent', async () => {
    vi.stubEnv('FMP_API_KEY', '');
    expect(await getLatestStockPrices(['aapl', ' MSFT '])).toEqual({ AAPL: null, MSFT: null });
  });

  it('preserves nulls for missing quotes', async () => {
    vi.stubEnv('FMP_API_KEY', 'demo');
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ symbol: 'AAPL', price: 191 }]), { status: 200 }));
    expect(await getLatestStockPrices(['AAPL', 'MSFT'], fetcher)).toEqual({ AAPL: 191, MSFT: null });
  });

  it('fails closed when the provider is unavailable', async () => {
    vi.stubEnv('FMP_API_KEY', 'demo');
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await getLatestStockPrices(['AAPL'], fetcher)).toEqual({ AAPL: null });
  });
});

