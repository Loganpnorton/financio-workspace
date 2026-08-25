import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseCsvRows, parseHoldings } from '@/services/csv';
import { processCsv } from './process-csv-flow';

afterEach(() => vi.unstubAllEnvs());

describe('CSV processing', () => {
  it('parses quoted fields and ignores cash and totals', () => {
    const csv = 'Symbol,Quantity,Last Price,Current Value\r\nAAPL,2,"$190.50","$381.00"\r\nCASH,1,1,1\r\nTOTAL,3,0,382';
    expect(parseCsvRows(csv)).toHaveLength(4);
    expect(parseHoldings(csv)).toEqual([{ symbol: 'AAPL', shares: 2, currentPrice: 190.5, importedValue: 381 }]);
  });

  it('fails clearly when required schema columns are absent', () => {
    expect(() => parseHoldings('Name,Amount\nApple,2')).toThrow(/Symbol.*Quantity/);
    expect(() => parseHoldings('Symbol,Quantity\nAAPL,nope')).toThrow(/Invalid quantity/);
  });

  it('falls back to imported quotes without API credentials', async () => {
    vi.stubEnv('FMP_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    const result = await processCsv({ csvData: 'Ticker,Shares,Price\nMSFT,3,425' });
    expect(result.holdings).toEqual([{ symbol: 'MSFT', shares: 3, currentPrice: 425 }]);
    expect(result.summary).toContain('$1,275.00');
  });
});
