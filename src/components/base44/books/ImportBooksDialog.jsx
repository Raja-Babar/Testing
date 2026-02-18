import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

export default function ImportBooksDialog({ open, onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls', 'ods'].includes(ext)) {
        setFile(selectedFile);
        setResult(null);
      } else {
        alert("Please upload a CSV, Excel (.xlsx, .xls) or ODS file");
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setIsUploading(false);
      setIsProcessing(true);

      // Extract data
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            books: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  file_name: { type: "string" },
                  title: { type: "string" },
                  author: { type: "string" },
                  year: { type: "string" },
                  total_pages: { type: "number" },
                  priority: { type: "string" },
                  notes: { type: "string" }
                },
                required: ["file_name", "total_pages"]
              }
            }
          }
        }
      });

      if (extractResult.status === "success" && extractResult.output?.books) {
        // Bulk create books
        const booksToCreate = extractResult.output.books.map(book => ({
          ...book,
          current_stage: "Scanning",
          status: "Not Started",
          priority: book.priority || "Medium",
          pages_scanned: 0,
          pages_digitized: 0,
          is_scanned: false,
          is_digitized: false,
          is_checked: false,
          is_uploaded: false
        }));

        await base44.entities.Book.bulkCreate(booksToCreate);

        setResult({
          success: true,
          count: booksToCreate.length,
          message: `Successfully imported ${booksToCreate.length} books`
        });

        setTimeout(() => {
          onImportComplete();
          handleClose();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: extractResult.details || "Failed to extract data from file"
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.message || "Import failed"
      });
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setIsUploading(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Books
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Required columns:</strong> file_name, total_pages<br/>
              <strong>Optional:</strong> title, author, year, priority, notes<br/>
              <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls), ODS
            </p>
          </div>

          <div className="space-y-2">
            <Label>Select File</Label>
            <Input 
              type="file" 
              accept=".csv,.xlsx,.xls,.ods"
              onChange={handleFileChange}
              disabled={isUploading || isProcessing}
            />
            {file && (
              <p className="text-xs text-slate-500">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {result && (
            <div className={`rounded-lg p-3 flex items-start gap-2 ${
              result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                  {result.message}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isUploading || isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Books
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}