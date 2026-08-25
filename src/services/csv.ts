import type { Holding } from '@/ai/schemas/csv-processing';

const HEADER_ALIASES = {
  symbol: ['symbol', 'ticker', 'stock symbol'],
  shares: ['quantity', 'shares', 'qty'],
  price: ['last price', 'price', 'current price'],
  value: ['current value', 'market value', 'value'],
};

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/[$,%\s]/g, '').replace(/^\((.*)\)$/, '-$1'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseCsvRows(csvData: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < csvData.length; index += 1) {
    const char = csvData[index];
    const next = csvData[index + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  return rows;
}

function headerIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((header) => aliases.includes(header.toLowerCase().trim()));
}

export function parseHoldings(csvData: string): Array<Holding & { importedValue: number | null }> {
  const rows = parseCsvRows(csvData);
  if (rows.length < 2) throw new Error('CSV must include a header and at least one holding.');
  const [headers, ...dataRows] = rows;
  const symbolIndex = headerIndex(headers, HEADER_ALIASES.symbol);
  const sharesIndex = headerIndex(headers, HEADER_ALIASES.shares);
  const priceIndex = headerIndex(headers, HEADER_ALIASES.price);
  const valueIndex = headerIndex(headers, HEADER_ALIASES.value);
  if (symbolIndex < 0 || sharesIndex < 0) {
    throw new Error('CSV must include Symbol (or Ticker) and Quantity (or Shares) columns.');
  }
  const holdings = dataRows.flatMap((row) => {
    const symbol = (row[symbolIndex] ?? '').toUpperCase().trim();
    if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol) || ['CASH', 'TOTAL'].includes(symbol)) return [];
    const shares = parseNumber(row[sharesIndex]);
    const importedPrice = priceIndex >= 0 ? parseNumber(row[priceIndex]) : null;
    const importedValue = valueIndex >= 0 ? parseNumber(row[valueIndex]) : null;
    if (shares === null || shares < 0) throw new Error(`Invalid quantity for ${symbol}.`);
    return [{ symbol, shares, currentPrice: importedPrice ?? 0, importedValue }];
  });
  if (holdings.length === 0) throw new Error('CSV did not contain any valid stock holdings.');
  return holdings;
}

