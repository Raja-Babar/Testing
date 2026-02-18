"use client";
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth"; // To get current user for created_by
import { Loader2, PlusCircle } from 'lucide-react';

// 1. UPDATED RECORD TYPE to match digitization_records schema
type Record = {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  file_name: string;
  book_name: string | null;
  author_name: string | null;
  year: string | null;
  status: string | null;
  source: string | null;
  assignee_id: string | null; // uuid
  assignee: string | null;
  scanned_by: string | null;
  digitized_by: string | null;
  deadline: string | null; // date
  created_by: string | null; // uuid
  last_edited_by: string | null; // uuid
  stage: string | null;
};

type UserProfile = {
  id: string;
  full_name: string;
};

export default function GlobalLibraryPage() {
  const { user } = useAuth(); // Get authenticated user
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<Record | null>(null);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<Record>>({
    file_name: '',
    book_name: '',
    author_name: '',
    year: '',
    status: 'Pending',
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const parseFileName = useCallback((fileName: string | undefined | null): { book: string, author: string, year: string } => {
    if (!fileName) return { book: '', author: '', year: '' };
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.') || fileName;
    const parts = nameWithoutExt.split('-');
    let book = parts[0] ? parts[0].replace(/_/g, ' ').trim() : '';
    const yearIndex = parts.findIndex(p => /^\d{4}$/.test(p.trim()));
    let author = '';
    let year = '';
    if (yearIndex > 0) {
      year = parts[yearIndex].trim();
      author = parts.slice(1, yearIndex).join('-').replace(/_/g, ' ').trim();
    } else if (parts.length > 1) {
      author = parts.slice(1).join('-').replace(/_/g, ' ').trim();
    }
    return { book, author, year };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name');
      if (data) setUsers(data);
      else console.error("Failed to fetch users:", error?.message);
    };
    fetchUsers();
  }, []);

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'N/A';
    const userProfile = users.find(u => u.id === userId);
    return userProfile ? userProfile.full_name : userId; // Show ID as fallback
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('digitization_records').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
      setRecords([]);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = records.filter(item => {
        const parsed = parseFileName(item.file_name);
        const searchable_book_name = item.book_name || parsed.book;
        const searchable_author_name = item.author_name || parsed.author;
        const searchable_year = item.year || parsed.year;

        return (
            item.file_name.toLowerCase().includes(lowercasedFilter) ||
            searchable_book_name.toLowerCase().includes(lowercasedFilter) ||
            searchable_author_name.toLowerCase().includes(lowercasedFilter) ||
            searchable_year.toLowerCase().includes(lowercasedFilter) ||
            (item.status && item.status.toLowerCase().includes(lowercasedFilter)) ||
            (item.stage && item.stage.toLowerCase().includes(lowercasedFilter))
        );
    });
    setFilteredRecords(filteredData);
  }, [searchTerm, records, parseFileName]);

  const handleRowClick = (record: Record) => {
    setDetailsRecord(record);
    setOpen(true);
  };

  const handleAddRecordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveRecord = async () => {
    setSubmitting(true);
    if (!newRecord.file_name) {
      toast({ title: "Validation Error", description: "File Name is required.", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    const recordToInsert = { ...newRecord, created_by: user?.id, last_edited_by: user?.id };
    const { error } = await supabase.from('digitization_records').insert([recordToInsert]).select();
    setSubmitting(false);
    if (error) {
      toast({ title: "Error saving record", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Record added successfully." });
      setAddRecordOpen(false);
      setNewRecord({ file_name: '', book_name: '', author_name: '', year: '', status: 'Pending' });
      fetchRecords();
    }
  };

  const parsedDetails = parseFileName(detailsRecord?.file_name);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Digitization Records</h1>
        <Button onClick={() => setAddRecordOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button>
      </div>
      <Input placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-4" />
      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Book Name</TableHead>
                <TableHead>Author Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => {
                const parsed = parseFileName(record.file_name);
                return (
                  <TableRow key={record.id} onClick={() => handleRowClick(record)} className="cursor-pointer">
                    <TableCell className="font-medium">{record.file_name}</TableCell>
                    <TableCell>{record.book_name || parsed.book}</TableCell>
                    <TableCell>{record.author_name || parsed.author}</TableCell>
                    <TableCell>{record.year || parsed.year}</TableCell>
                    <TableCell>{record.stage || 'N/A'}</TableCell>
                    <TableCell>{record.status || 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={addRecordOpen} onOpenChange={setAddRecordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add a New Record</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input name="file_name" value={newRecord.file_name || ''} placeholder="File Name (e.g., Book-Author-Year.pdf)" onChange={handleAddRecordChange} />
            <Input name="book_name" value={newRecord.book_name || ''} placeholder="Book Name (auto-parsed if empty)" onChange={handleAddRecordChange} />
            <Input name="author_name" value={newRecord.author_name || ''} placeholder="Author Name (auto-parsed if empty)" onChange={handleAddRecordChange} />
            <Input name="year" value={newRecord.year || ''} placeholder="Year (auto-parsed if empty)" onChange={handleAddRecordChange} />
            <Input name="stage" placeholder="Stage (e.g., Scanning)" onChange={handleAddRecordChange} />
            <Input name="status" placeholder="Status (e.g., Pending)" onChange={handleAddRecordChange} />
            <Input name="source" placeholder="Source" onChange={handleAddRecordChange} />
          </div>
          <DialogFooter><Button onClick={handleSaveRecord} disabled={submitting}>{submitting ? 'Saving...' : 'Save Record'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailsRecord?.book_name || parsedDetails.book}</DialogTitle>
            <DialogDescription>Details for {detailsRecord?.file_name}</DialogDescription>
          </DialogHeader>
          {detailsRecord && (
            <div className="mt-4 grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
              <p className="font-semibold col-span-1">File Name:</p><p className="col-span-3">{detailsRecord.file_name}</p>
              <p className="font-semibold col-span-1">Book Name:</p><p className="col-span-3">{detailsRecord.book_name || parsedDetails.book}</p>
              <p className="font-semibold col-span-1">Author Name:</p><p className="col-span-3">{detailsRecord.author_name || parsedDetails.author}</p>
              <p className="font-semibold col-span-1">Year:</p><p className="col-span-3">{detailsRecord.year || parsedDetails.year}</p>
              <p className="font-semibold col-span-1">Stage:</p><p className="col-span-3">{detailsRecord.stage || 'N/A'}</p>
              <p className="font-semibold col-span-1">Status:</p><p className="col-span-3">{detailsRecord.status || 'N/A'}</p>
              <p className="font-semibold col-span-1">Source:</p><p className="col-span-3">{detailsRecord.source || 'N/A'}</p>
              <p className="font-semibold col-span-1">Deadline:</p><p className="col-span-3">{detailsRecord.deadline ? new Date(detailsRecord.deadline).toLocaleDateString() : 'N/A'}</p>
              <p className="font-semibold col-span-1">Assignee:</p><p className="col-span-3">{detailsRecord.assignee || getUserName(detailsRecord.assignee_id)}</p>
              <p className="font-semibold col-span-1">Scanned By:</p><p className="col-span-3">{detailsRecord.scanned_by || 'N/A'}</p>
              <p className="font-semibold col-span-1">Digitized By:</p><p className="col-span-3">{detailsRecord.digitized_by || 'N/A'}</p>
              <p className="font-semibold col-span-1">Created By:</p><p className="col-span-3">{getUserName(detailsRecord.created_by)}</p>
              <p className="font-semibold col-span-1">Last Edited By:</p><p className="col-span-3">{getUserName(detailsRecord.last_edited_by)}</p>
              <p className="font-semibold col-span-1">Created At:</p><p className="col-span-3">{new Date(detailsRecord.created_at).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
