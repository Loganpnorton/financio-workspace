
'use server';

import { getLatestStockPrices } from "@/services/fmp";
import { z } from "zod";

const SymbolsSchema = z.array(z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9.-]{0,9}$/)).max(100);

export async function getUpdatedPrices(symbols: string[]): Promise<Record<string, number | null>> {
    return getLatestStockPrices(SymbolsSchema.parse(symbols));
}
