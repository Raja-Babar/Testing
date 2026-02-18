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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

const defaultBook = {
  file_name: "", title: "", author: "", year: "", total_pages: "",
  current_stage: "Scanning", status: "Not Started", priority: "Medium",
  pages_scanned: 0, pages_digitized: 0,
  is_scanned: false, is_digitized: false, is_checked: false, is_uploaded: false,
  metadata_title: "", metadata_author: "", metadata_custom: "",
  has_bookmarks: false, has_front_page_text: false, has_last_page_text: false,
  notes: "",
  assigned_to_scanning: "", assigned_to_digitization: "",
  assigned_to_checking: "", assigned_to_uploading: "",
};

export default function BookFormDialog({ open, onClose, onSave, book, employees = [], saving, error }) {
  const [form, setForm] = useState(defaultBook);

  useEffect(() => {
    if (book) {
      setForm({ ...defaultBook, ...book, total_pages: book.total_pages?.toString() || "" });
    } else {
      setForm(defaultBook);
    }
  }, [book, open]);

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleFileNameChange = (fileName) => {
    setForm(prev => ({ ...prev, file_name: fileName }));
    
    // Auto-extract: Book_Name-Author_Name-Year-Org
    const parts = fileName.split('-');
    if (parts.length >= 3) {
      const bookName = parts[0]?.replace(/_/g, ' ').trim() || "";
      const authorName = parts[1]?.replace(/_/g, ' ').trim() || "";
      const year = parts[2]?.trim() || "";
      setForm(prev => ({ ...prev, title: bookName, author: authorName, year }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', { ...form, total_pages: parseInt(form.total_pages) || 0 });
    onSave({ ...form, total_pages: parseInt(form.total_pages) || 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{book ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-1.5 md:col-span-2">
            <Label>File Name * (Format: Book_Name-Author_Name-Year-Org)</Label>
            <Input 
              value={form.file_name} 
              onChange={e => handleFileNameChange(e.target.value)} 
              placeholder="e.g. Sahih_Bukhari-Imam_Bukhari-2020-DarUsSalam"
              required 
            />
            <p className="text-xs text-slate-400">Title, Author, and Year will auto-fill from this</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="Auto-filled" />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input value={form.author} onChange={e => handleChange("author", e.target.value)} placeholder="Auto-filled" />
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input value={form.year} onChange={e => handleChange("year", e.target.value)} placeholder="Auto-filled" />
            </div>
            <div className="space-y-1.5">
              <Label>Total Pages *</Label>
              <Input type="number" min={1} value={form.total_pages} onChange={e => handleChange("total_pages", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => handleChange("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Low","Medium","High","Urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.current_stage} onValueChange={v => handleChange("current_stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Scanning","Digitization","Checking","Uploading","Completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => handleChange("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Not Started","In Progress","On Hold","Completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignments */}
          <div>
            <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Assignments</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "assigned_to_scanning", label: "Scanning" },
                { key: "assigned_to_digitization", label: "Digitization" },
                { key: "assigned_to_checking", label: "Checking" },
                { key: "assigned_to_uploading", label: "Uploading" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Select value={form[key] || "unassigned"} onValueChange={v => handleChange(key, v === "unassigned" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.email} value={emp.email}>{emp.full_name || emp.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          {book && (
            <div>
              <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Progress Status</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Pages Scanned</Label>
                    <Input type="number" min={0} value={form.pages_scanned} onChange={e => handleChange("pages_scanned", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pages Digitized</Label>
                    <Input type="number" min={0} value={form.pages_digitized} onChange={e => handleChange("pages_digitized", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "is_scanned", label: "Scanning Completed" },
                    { key: "is_digitized", label: "Digitization Completed" },
                    { key: "is_checked", label: "Checking Completed" },
                    { key: "is_uploaded", label: "Uploading Completed" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={key} 
                        checked={form[key]} 
                        onCheckedChange={(checked) => handleChange(key, checked)} 
                      />
                      <Label htmlFor={key} className="text-sm font-normal cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
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
              {book ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}