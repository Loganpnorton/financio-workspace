
'use server';

import { getLatestStockPrices } from "@/services/fmp";

export async function getUpdatedPrices(symbols: string[]): Promise<Record<string, number | null>> {
    return await getLatestStockPrices(symbols);
}
