import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserPlus } from "lucide-react";

export default function MultiAssignDialog({ 
  open, 
  onClose, 
  books = [], 
  employees = [], 
  onAssign, 
  saving = false,
  selectedCount = 0 
}) {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [assignTo, setAssignTo] = useState({
    scanning: "",
    digitization: "",
    checking: "",
    uploading: ""
  });

  const handleBookToggle = (bookId) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(b => b.id));
    }
  };

  const handleSubmit = () => {
    if (selectedBooks.length === 0) return;
    onAssign(selectedBooks, assignTo);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Multi-Assign Books
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Books Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">Select Books ({selectedBooks.length} selected)</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedBooks.length === books.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2 bg-slate-50">
              {books.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No books available</p>
              ) : (
                books.map(book => (
                  <div key={book.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded transition">
                    <Checkbox 
                      id={`book-${book.id}`}
                      checked={selectedBooks.includes(book.id)}
                      onCheckedChange={() => handleBookToggle(book.id)}
                    />
                    <Label htmlFor={`book-${book.id}`} className="flex-1 cursor-pointer text-sm">
                      {book.title} <span className="text-slate-400">by {book.author}</span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assignments */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Assign To Employees</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "scanning", label: "Scanning" },
                { key: "digitization", label: "Digitization" },
                { key: "checking", label: "Checking" },
                { key: "uploading", label: "Uploading" },
              ].map(stage => (
                <div key={stage.key} className="space-y-1.5">
                  <Label className="text-xs text-slate-500">{stage.label}</Label>
                  <Select value={assignTo[stage.key]} onValueChange={v => setAssignTo({ ...assignTo, [stage.key]: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.email} value={emp.email}>
                          {emp.full_name || emp.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={selectedBooks.length === 0 || saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign ${selectedBooks.length} Books`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}