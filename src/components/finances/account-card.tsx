import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import SmallAreaChart from "@/components/charts/small-area-chart";

type AccountCardProps = {
  account: {
    name: string;
    balance: number;
    change: number;
    currency: string;
  };
};

export default function AccountCard({ account }: AccountCardProps) {
  const isPositiveChange = account.change >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency,
    }).format(value);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <CardTitle className="text-base font-medium">{account.name}</CardTitle>
        <CardDescription>
          <span className={`flex items-center text-xs ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {account.change.toFixed(1)}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-end">
        <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
        <div className="h-10 w-24 -mb-4 -mr-4">
          <SmallAreaChart isPositive={isPositiveChange} />
        </div>
      </CardContent>
    </Card>
  );
}
