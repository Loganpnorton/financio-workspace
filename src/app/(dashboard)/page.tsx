
'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import OverviewWidget from '@/components/home/overview-widget';
import CurrentHoldingsWidget from '@/components/finances/current-holdings-widget';
import AccountCard from '@/components/finances/account-card';
import type { ProcessCsvOutput, Holding } from '@/ai/schemas/csv-processing';
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const WIDGETS = {
  overview: "Overview",
  holdings: "Current Holdings",
};

type WidgetId = keyof typeof WIDGETS;

function SortableWidget({ id, children }: { id: WidgetId, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={20} />
      </div>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [widgets, setWidgets] = useState<WidgetId[]>([]);
  const [processedData, setProcessedData] = useState<ProcessCsvOutput | null>(null);
  const [investmentPortfolio, setInvestmentPortfolio] = useState({ name: 'Investment Portfolio', balance: 0, change: 0, currency: 'USD' });
  const [chartData, setChartData] = useState<any[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const savedData = localStorage.getItem('processedFinancialData');
    if (savedData) {
      const parsedData: ProcessCsvOutput = JSON.parse(savedData);
      setProcessedData(parsedData);
      updatePortfolio(parsedData.holdings);
    }

    const savedWidgets = localStorage.getItem('dashboardWidgets');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      setWidgets(['overview', 'holdings']);
    }
  }, []);

  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  const updatePortfolio = (holdings: Holding[]) => {
    const currentTotalValue = holdings.reduce((acc, h) => acc + h.shares * h.currentPrice, 0);
    setInvestmentPortfolio(prev => {
        const change = prev.balance > 0 ? ((currentTotalValue - prev.balance) / prev.balance) * 100 : 0;
        return { ...prev, balance: currentTotalValue, change };
    });
    
    const now = new Date();
    setChartData(prevChartData => [
      ...prevChartData,
      { name: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), total: currentTotalValue }
    ].slice(-10));
  };
  
  const handleHoldingsUpdate = (updatedHoldings: Holding[]) => {
    if (processedData) {
      setProcessedData(prevData => ({
        ...prevData!,
        holdings: updatedHoldings,
      }));
      updatePortfolio(updatedHoldings);
    }
  };

  const addWidget = (widgetId: WidgetId) => {
    if (!widgets.includes(widgetId) && widgets.length < 3) {
      setWidgets(prev => [...prev, widgetId]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.indexOf(active.id as WidgetId);
        const newIndex = items.indexOf(over.id as WidgetId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case 'overview':
        return <OverviewWidget data={chartData} summary={processedData?.summary} />;
      case 'holdings':
        return <CurrentHoldingsWidget holdings={processedData?.holdings} onUpdate={handleHoldingsUpdate} />;
      default:
        return null;
    }
  }

  const availableWidgets = Object.keys(WIDGETS).filter(w => !widgets.includes(w as WidgetId)) as WidgetId[];

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <p className="text-muted-foreground">
                Your personalized financial overview. Drag to reorder.
            </p>
            </div>
            {widgets.length < 3 && (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                    <Plus className="mr-2" /> Add Widget
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {availableWidgets.map(widgetId => (
                    <DropdownMenuItem key={widgetId} onClick={() => addWidget(widgetId)}>
                        {WIDGETS[widgetId]}
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>

        {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">Your Dashboard is Empty</h2>
                <p className="text-muted-foreground mt-2">Add a widget to get started.</p>
            </div>
        ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                {widgets.map(widgetId => (
                    <SortableWidget key={widgetId} id={widgetId}>
                    {renderWidget(widgetId)}
                    </SortableWidget>
                ))}
                </div>
            </SortableContext>
            </DndContext>
        )}
    </div>
  );
}
