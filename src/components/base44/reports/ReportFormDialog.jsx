import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import moment from "moment";

export default function ReportFormDialog({ open, onClose, onSave, books = [], employees = [], saving, currentUser }) {
  const [form, setForm] = useState({
    employee_email: "",
    employee_name: "",
    report_date: moment().format("YYYY-MM-DD"),
    book_id: "",
    book_title: "",
    stage: "Scanning",
    pages_count: "",
    notes: "",
  });

  useEffect(() => {
    if (open && currentUser) {
      setForm(prev => ({
        ...prev,
        employee_email: currentUser.email || "",
        employee_name: currentUser.full_name || "",
        report_date: moment().format("YYYY-MM-DD"),
        book_id: "",
        book_title: "",
        stage: "Scanning",
        pages_count: "",
        notes: "",
      }));
    }
  }, [open, currentUser]);

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleBookSelect = (bookId) => {
    const book = books.find(b => b.id === bookId);
    setForm(prev => ({
      ...prev,
      book_id: bookId,
      book_title: book?.title || "",
    }));
  };

  const handleEmployeeSelect = (email) => {
    const emp = employees.find(e => e.email === email);
    setForm(prev => ({
      ...prev,
      employee_email: email,
      employee_name: emp?.full_name || email,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (form.stage === "Scanning" || form.stage === "Digitization") {
      data.pages_count = parseInt(form.pages_count) || 0;
    } else {
      delete data.pages_count;
    }
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Daily Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <Select value={form.employee_email} onValueChange={handleEmployeeSelect}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.email} value={emp.email}>{emp.full_name || emp.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.report_date} onChange={e => handleChange("report_date", e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Book * (Only your assigned books)</Label>
            <Select value={form.book_id} onValueChange={handleBookSelect}>
              <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
              <SelectContent>
                {books.filter(b => {
                  if (b.status === "Completed") return false;
                  const userEmail = form.employee_email;
                  return b.assigned_to_scanning === userEmail || 
                         b.assigned_to_digitization === userEmail || 
                         b.assigned_to_checking === userEmail || 
                         b.assigned_to_uploading === userEmail;
                }).map(book => (
                  <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Stage *</Label>
            <Select value={form.stage} onValueChange={v => handleChange("stage", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Scanning","Digitization","Checking","Uploading"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(form.stage === "Scanning" || form.stage === "Digitization") && (
            <div className="space-y-1.5">
              <Label>Pages {form.stage === "Scanning" ? "Scanned" : "Digitized"} *</Label>
              <Input 
                type="number" 
                min={1} 
                value={form.pages_count} 
                onChange={e => handleChange("pages_count", e.target.value)} 
                required 
                placeholder={form.stage === "Scanning" ? "Enter scanned pages" : "Enter cleaned/cropped pages"}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => handleChange("notes", e.target.value)} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}