
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UploadCloud, File, X, Loader2, Upload } from "lucide-react"
import React, { useState } from "react"
import { processCsv } from "@/ai/flows/process-csv-flow"
import { useToast } from "@/hooks/use-toast"
import type { ProcessCsvOutput } from "@/ai/schemas/csv-processing"

export default function CsvUploaderDialog({ onDataProcessed }: { onDataProcessed: (data: ProcessCsvOutput) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;
      try {
        const result = await processCsv({ csvData });
        onDataProcessed(result);
        toast({
          title: "Success",
          description: "Your financial data has been processed.",
        });
        setIsOpen(false);
      } catch (error) {
        console.error("Error processing CSV:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with processing your file.",
        });
      } finally {
        setIsProcessing(false);
        setFile(null);
      }
    };
    reader.readAsText(file);
  };

  const onDialogOpenChange = (open: boolean) => {
    if (!isProcessing) {
      setIsOpen(open);
      setFile(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Financial Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file from your financial institution.
          </DialogDescription>
        </DialogHeader>
        <div 
          className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg border-muted-foreground/20 hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {file ? (
            <div className="flex flex-col items-center text-center">
              <File className="w-12 h-12 text-primary"/>
              <p className="mt-2 font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive" onClick={() => setFile(null)} disabled={isProcessing}>
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground/50"/>
              <p className="mt-4 font-semibold">Drag & drop a file here</p>
              <p className="text-sm text-muted-foreground">or</p>
              <Button asChild variant="link" className="text-primary">
                <label htmlFor="file-upload">
                  Click to browse
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" disabled={isProcessing} />
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">CSV files up to 10MB</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" disabled={!file || isProcessing} onClick={handleUpload}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Upload and Process'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
