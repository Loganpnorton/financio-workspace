
'use server';
/**
 * @fileOverview A flow for processing financial data from a CSV file.
 *
 * - processCsv - A function that handles the CSV processing.
 */

import {ai} from '@/ai/genkit';
import {
  ProcessCsvInputSchema,
  type ProcessCsvInput,
  ProcessCsvOutputSchema,
  type ProcessCsvOutput,
} from '@/ai/schemas/csv-processing';
import { getLatestStockPrice } from '@/services/fmp';
import { z } from 'zod';

const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Returns the current market value of a stock. Use this to get the latest price for a holding.',
    inputSchema: z.object({
      symbol: z.string().describe('The ticker symbol of the stock.'),
    }),
    outputSchema: z.number(),
  },
  async ({ symbol }) => {
    // A more robust solution might involve returning the last known price or erroring.
    const price = await getLatestStockPrice(symbol);
    // If the API call fails, we'll just return a placeholder.
    return price ?? 0;
  }
);


export async function processCsv(
  input: ProcessCsvInput
): Promise<ProcessCsvOutput> {
  return processCsvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processCsvPrompt',
  tools: [getStockPrice],
  input: {schema: ProcessCsvInputSchema},
  output: {schema: ProcessCsvOutputSchema},
  prompt: `You are a financial analyst. Your task is to process a CSV file containing portfolio holdings and extract a list of current holdings and a portfolio summary. The CSV has the following columns: Symbol, Last Price, Quantity, Current Value, etc.

The user has provided the following CSV data:

{{{csvData}}}

1.  **Parse Holdings**: Parse each row representing a holding into a holding object. Use the 'Symbol' for the symbol, 'Quantity' for the shares. Ignore any rows that don't represent a specific stock holding (like 'Cash' or account totals). For each holding, use the getStockPrice tool to get the latest market price for its `+'`currentPrice`'+` field.
2.  **Generate Summary**: Provide a one-sentence overview of the portfolio, mentioning the total number of holdings and the portfolio's current total value. You can calculate the total value by summing the 'Current Value' column for all holdings.

Return the final data in the specified JSON format. Ensure all amounts and prices are numbers.
`,
});

const processCsvFlow = ai.defineFlow(
  {
    name: 'processCsvFlow',
    inputSchema: ProcessCsvInputSchema,
    outputSchema: ProcessCsvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error("The model failed to produce valid output. Please try again.");
    }
    
    return output;
  }
);
