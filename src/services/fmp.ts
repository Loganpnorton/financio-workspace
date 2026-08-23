
import fetch from 'node-fetch';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';

interface FmpQuote {
    symbol: string;
    name: string;
    price: number;
    changesPercentage: number;
    change: number;
    dayLow: number;
    dayHigh: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number;
    priceAvg50: number;
    priceAvg200: number;
    exchange: string;
    volume: number;
    avgVolume: number;
    open: number;
    previousClose: number;
    eps: number;
    pe: number;
    earningsAnnouncement: string;
    sharesOutstanding: number;
    timestamp: number;
}

export async function getLatestStockPrice(symbol: string): Promise<number | null> {
  const prices = await getLatestStockPrices([symbol]);
  return prices[symbol] ?? null;
}

export async function getLatestStockPrices(symbols: string[]): Promise<Record<string, number | null>> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey || symbols.length === 0) {
    return {};
  }

  const url = `${BASE_URL}/quote/${symbols.join(',')}?apikey=${apiKey}`;
  const prices: Record<string, number | null> = {};

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`FMP quote request failed with status ${response.status}.`);
      return Object.fromEntries(symbols.map((symbol) => [symbol, null]));
    }

    const data = (await response.json()) as FmpQuote[] | { 'Error Message'?: string };
    if (Array.isArray(data)) {
      for (const quote of data) {
        prices[quote.symbol] = quote.price;
      }
    } else if (data['Error Message']) {
      console.error('FMP returned an error response.');
    }

    for (const symbol of symbols) {
      prices[symbol] ??= null;
    }
  } catch (error) {
    console.error('FMP quote request failed.', error);
    return Object.fromEntries(symbols.map((symbol) => [symbol, null]));
  }

  return prices;
}
