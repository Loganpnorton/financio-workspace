
'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AccountCard from "@/components/finances/account-card";
import OverviewWidget from "@/components/home/overview-widget";
import CsvUploaderDialog from "@/components/finances/csv-uploader-dialog";
import { useState, useEffect } from "react";
import type { ProcessCsvOutput, Holding } from "@/ai/schemas/csv-processing";
import CurrentHoldingsWidget from "@/components/finances/current-holdings-widget";

const initialAccounts = [
  { name: 'Personal Savings', balance: 5230.78, change: 12.5, currency: 'USD' },
  { name: 'Checking Account', balance: 1854.21, change: -2.1, currency: 'USD' },
  { name: 'Investment Portfolio', balance: 0, change: 0, currency: 'USD' },
  { name: 'Crypto Wallet', balance: 8765.10, change: -8.2, currency: 'USD' },
];

export default function FinancesPage() {
  const [processedData, setProcessedData] = useState<ProcessCsvOutput | null>(null);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const savedData = localStorage.getItem('processedFinancialData');
    if (savedData) {
      const parsedData: ProcessCsvOutput = JSON.parse(savedData);
      handleDataProcessed(parsedData);
    }
  }, []);
  
  useEffect(() => {
    if (processedData) {
      localStorage.setItem('processedFinancialData', JSON.stringify(processedData));
    }
  }, [processedData]);

  const handleDataProcessed = (data: ProcessCsvOutput) => {
    setProcessedData(data);
    if (data && data.holdings) {
      const currentTotalValue = data.holdings.reduce((acc, h) => acc + h.shares * h.currentPrice, 0);
      setTotalValue(currentTotalValue);
      
      setAccounts(currentAccounts => currentAccounts.map(acc => {
        if (acc.name === 'Investment Portfolio') {
          return { ...acc, balance: currentTotalValue, change: 0 };
        }
        return acc;
      }));

      const now = new Date();
      setChartData([{ name: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), total: currentTotalValue }]);
    }
  }

  const handleHoldingsUpdate = (updatedHoldings: Holding[]) => {
    if (processedData) {
      const newTotalValue = updatedHoldings.reduce((acc, h) => acc + h.shares * h.currentPrice, 0);
      
      setProcessedData(prevData => ({
        ...prevData!,
        holdings: updatedHoldings,
      }));
      
      setTotalValue(newTotalValue);

      setAccounts(currentAccounts => currentAccounts.map(acc => {
        if (acc.name === 'Investment Portfolio') {
          const oldBalance = currentAccounts.find(a => a.name === 'Investment Portfolio')?.balance || 0;
          const change = oldBalance > 0 ? ((newTotalValue - oldBalance) / oldBalance) * 100 : 0;
          return { ...acc, balance: newTotalValue, change: change };
        }
        return acc;
      }));

      const now = new Date();
      setChartData(prevChartData => [
        ...prevChartData,
        { name: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), total: newTotalValue }
      ].slice(-10)); // Keep last 10 data points
    }
  };
  
  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Finances</h1>
            <p className="text-muted-foreground">
                Your financial command center.
            </p>
            </div>
            <div className="flex items-center gap-2">
            <CsvUploaderDialog onDataProcessed={handleDataProcessed} />
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {accounts.map(account => (
            <AccountCard key={account.name} account={account} />
            ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
            <OverviewWidget 
                data={chartData.length > 0 ? chartData : undefined}
                summary={processedData?.summary}
            />
            </div>
            <div className="space-y-6">
            <CurrentHoldingsWidget 
                holdings={processedData?.holdings}
                onUpdate={handleHoldingsUpdate}
            />
            </div>
        </div>
    </div>
  );
}
