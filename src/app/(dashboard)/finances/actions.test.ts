import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/fmp', () => ({ getLatestStockPrices: vi.fn() }));

import { getLatestStockPrices } from '@/services/fmp';
import { getUpdatedPrices } from './actions';

describe('price server action', () => {
  beforeEach(() => vi.mocked(getLatestStockPrices).mockReset());

  it('normalizes validated symbols before delegating', async () => {
    vi.mocked(getLatestStockPrices).mockResolvedValue({ AAPL: 190 });
    await expect(getUpdatedPrices([' aapl '])).resolves.toEqual({ AAPL: 190 });
    expect(getLatestStockPrices).toHaveBeenCalledWith(['AAPL']);
  });

  it('rejects malformed symbols before network access', async () => {
    await expect(getUpdatedPrices(['AAPL<script>'])).rejects.toThrow();
    expect(getLatestStockPrices).not.toHaveBeenCalled();
  });
});

