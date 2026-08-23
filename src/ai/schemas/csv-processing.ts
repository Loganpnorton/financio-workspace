/**
 * @fileOverview Schemas and types for CSV processing.
 */
import {z} from 'zod';

const HoldingSchema = z.object({
  symbol: z.string().describe("The stock symbol, e.g., 'AAPL'."),
  shares: z.number().describe('The total number of shares held.'),
  currentPrice: z.number().describe('The latest market price of the stock.'),
});
export type Holding = z.infer<typeof HoldingSchema>;

export const ProcessCsvInputSchema = z.object({
  csvData: z
    .string()
    .describe('The CSV data as a string, including the header row.'),
});
export type ProcessCsvInput = z.infer<typeof ProcessCsvInputSchema>;

export const ProcessCsvOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the financial data.'),
  holdings: z.array(HoldingSchema).describe("An array of the user's current stock holdings."),
});
export type ProcessCsvOutput = z.infer<typeof ProcessCsvOutputSchema>;
