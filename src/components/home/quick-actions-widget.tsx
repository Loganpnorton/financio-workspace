import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Send } from "lucide-react";

export default function QuickActionsWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Your most used actions.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button variant="outline">
          <Plus className="mr-2" /> Add Expense
        </Button>
        <Button variant="outline">
          <Send className="mr-2" /> Send Money
        </Button>
        <Button variant="outline">
          <Receipt className="mr-2" /> New Invoice
        </Button>
        <Button variant="outline">
          <Plus className="mr-2" /> New Goal
        </Button>
      </CardContent>
    </Card>
  );
}
