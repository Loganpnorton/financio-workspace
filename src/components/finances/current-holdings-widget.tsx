
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Holding } from "@/ai/schemas/csv-processing";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { getUpdatedPrices } from "@/app/(dashboard)/finances/actions";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type CurrentHoldingsWidgetProps = {
  holdings: Holding[] | undefined;
  onUpdate?: (updatedHoldings: Holding[]) => void;
};

export default function CurrentHoldingsWidget({ holdings: initialHoldings, onUpdate }: CurrentHoldingsWidgetProps) {
  const [holdings, setHoldings] = useState(initialHoldings);
  const [lastPrices, setLastPrices] = useState<{[key: string]: number} | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // This effect synchronizes the internal state ONLY when the initial holdings from props change.
  // It avoids re-syncing on every parent re-render if the underlying data is the same.
  useEffect(() => {
    setHoldings(initialHoldings);
    if (initialHoldings) {
        const initialPrices = initialHoldings.reduce((acc, h) => {
          acc[h.symbol] = h.currentPrice;
          return acc;
        }, {} as {[key: string]: number});
        setLastPrices(initialPrices);
    } else {
        setLastPrices(null);
    }
  }, [initialHoldings]);

  const updatePrices = useCallback(async () => {
    if (!holdings || holdings.length === 0 || isUpdating) {
        return;
    }

    setIsUpdating(true);

    try {
        const symbols = holdings.map(h => h.symbol);
        const priceData = await getUpdatedPrices(symbols);

        const newLastPrices: { [key: string]: number } = {};
        const updatedHoldings = holdings.map(h => {
            newLastPrices[h.symbol] = h.currentPrice; // Store old price for comparison
            const newPrice = priceData[h.symbol];
            if (newPrice !== null && newPrice !== undefined) {
                return { ...h, currentPrice: newPrice };
            }
            return h;
        });
        
        setLastPrices(newLastPrices);
        setHoldings(updatedHoldings);
        
        if (onUpdateRef.current) {
            onUpdateRef.current(updatedHoldings);
        }
    } catch (error) {
        console.error("Failed to fetch updated prices:", error);
    } finally {
        setIsUpdating(false);
    }
}, [holdings, isUpdating]);

  // This effect sets up the interval and runs only when `holdings` are first populated.
  useEffect(() => {
    if (!holdings || holdings.length === 0) return;

    const interval = setInterval(() => {
        updatePrices();
    }, 3600000); // 1 hour

    return () => clearInterval(interval); // Cleanup on unmount or when holdings are cleared
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings?.length, updatePrices]); // Depend on holdings.length to only re-run if holdings are added/removed.

  if (!holdings || holdings.length === 0) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <CardDescription>Upload a CSV to see your portfolio.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">No holdings data available.</p>
            </CardContent>
        </Card>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Current Holdings</CardTitle>
          <CardDescription>Your portfolio with live price updates.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={updatePrices} disabled={isUpdating}>
            <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {holdings.map(holding => {
                    const lastPrice = lastPrices?.[holding.symbol] ?? holding.currentPrice;
                    const priceChange = holding.currentPrice - lastPrice;
                    const changeColor = priceChange > 0 ? 'text-green-500' : priceChange < 0 ? 'text-red-500' : 'text-muted-foreground';

                    return (
                        <TableRow key={holding.symbol}>
                            <TableCell className="font-bold">{holding.symbol}</TableCell>
                            <TableCell className="text-right">{holding.shares.toFixed(2)}</TableCell>
                            <TableCell className={`text-right font-medium flex items-center justify-end gap-2 transition-colors duration-500`}>
                                <span className={cn(changeColor, 'transition-colors duration-300')}>
                                  {priceChange > 0 && <ArrowUp size={14} className="inline-block" />}
                                  {priceChange < 0 && <ArrowDown size={14} className="inline-block" />}
                                </span>
                                <span className={cn(changeColor, 'transition-colors duration-300')}>{formatCurrency(holding.currentPrice)}</span>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
