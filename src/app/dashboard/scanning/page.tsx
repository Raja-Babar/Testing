
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from '@/hooks/admin/use-user-management';
import { 
  Loader2, PlusCircle, Upload, Search, ChevronLeft, 
  ChevronRight, Info 
} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Papa from 'papaparse';

type Record = {
  id: string;
  file_name: string;
  book_name: string | null;
  author_name: string | null;
  year: string | null;
  status: string | null;
  assignee_id: string | null;
  assignee: string | null;
  stage: string | null;
  created_at: string;
  digitized_by: string | null;
  scanned_by: string | null;
  last_edited_by: string | null;
};

export default function GlobalLibraryPage() {
  const { user } = useAuth();
  const { users } = useUsers();
  const { toast } = useToast();

  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<Record | null>(null);
  
  const [newRecordFile, setNewRecordFile] = useState('');
  const [parsedData, setParsedData] = useState({ book: '', author: '', year: '' });

  const autoParse = (fileName: string) => {
    const clean = fileName.split('.')[0];
    const parts = clean.split('-');
    return {
      book: parts[0]?.replace(/_/g, ' ').trim() || '',
      author: parts[1]?.replace(/_/g, ' ').trim() || '',
      year: parts[2]?.trim() || ''
    };
  };

  useEffect(() => {
    if (addRecordOpen && newRecordFile) {
        setParsedData(autoParse(newRecordFile));
    } else if (!addRecordOpen) {
        setNewRecordFile('');
        setParsedData({ book: '', author: '', year: '' });
    }
  }, [newRecordFile, addRecordOpen]);

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

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleAddRecord = async () => {
    if (!newRecordFile) {
        toast({ title: "Error", description: "File name is required.", variant: "destructive" });
        return;
    }

    const { book, author, year } = autoParse(newRecordFile);

    const { error } = await supabase.from('digitization_records').insert([{
        file_name: newRecordFile,
        book_name: book,
        author_name: author,
        year: year,
        status: 'Pending',
        created_by: user?.id,
        last_edited_by: user?.id
    }]);

    if (error) {
        toast({ title: "Error adding record", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Success", description: "Record added successfully." });
        setAddRecordOpen(false);
        fetchRecords();
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.book_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.assignee || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const inputElement = e.target;
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const validRows = results.data.filter((row: any) => row.file_name && row.file_name.trim() !== '');

        if (validRows.length === 0) {
          toast({
            title: "Import Failed",
            description: "No records with a 'file_name' were found in the CSV file.",
            variant: "destructive",
          });
          if(inputElement) inputElement.value = '';
          return;
        }
        
        const newRecords = validRows.map((row: any) => {
          const parsed = autoParse(row.file_name);
          const dbRecord: { [key: string]: any } = {
            file_name: row.file_name,
            book_name: row.book_name || parsed.book,
            author_name: row.author_name || parsed.author,
            year: row.year || parsed.year,
            status: row.status || 'Pending',
            created_by: user?.id,
            last_edited_by: user?.id,
          };

          const optionalFields = ['assignee_id', 'assignee', 'stage', 'digitized_by', 'scanned_by'];
          optionalFields.forEach(field => {
            if (row[field]) {
              dbRecord[field] = row[field];
            }
          });
          return dbRecord;
        });

        const { error } = await supabase.from('digitization_records').insert(newRecords);

        if (error) {
          toast({ title: "Import Error", description: `An error occurred: ${error.message}`, variant: "destructive" });
        } else {
          toast({ title: "Import Successful", description: `${newRecords.length} records have been added successfully.` });
          fetchRecords();
        }
        if(inputElement) inputElement.value = '';
      }
    });
  };

  const handleBulkAssign = async (userId: string) => {
    const emp = users?.find((u: any) => u.id === userId);
    const { error } = await supabase
      .from('digitization_records')
      .update({ 
        assignee_id: userId, 
        assignee: emp?.name || emp?.display_name,
        last_edited_by: user?.id
       })
      .in('id', selectedIds);

    if (!error) {
      toast({ title: "Assigned Successfully", description: `Updated ${selectedIds.length} records.` });
      setSelectedIds([]);
      fetchRecords();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto bg-white min-h-screen text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Library</h1>
          <p className="text-black text-sm">Manage, parse, and assign digitization tasks.</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <Input type="file" className="hidden" accept=".csv" onChange={handleImport} />
            <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>
          </label>
          <Button size="sm" onClick={() => setAddRecordOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> New Entry</Button>
        </div>
      </div>

      <Card className="bg-white rounded-2xl shadow-lg border-gray-200/80">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
              <Input 
                placeholder="Search by file, title, or employee..." 
                className="pl-10 h-10" 
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-2">
                <span className="text-sm font-semibold text-blue-700">{selectedIds.length} selected</span>
                <Select onValueChange={handleBulkAssign}>
                  <SelectTrigger className="w-[200px] bg-white h-9"><SelectValue placeholder="Assign Selected To..." /></SelectTrigger>
                  <SelectContent>
                    {users?.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name || u.display_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="w-12 px-4">
                    <Checkbox 
                      checked={selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0} 
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedIds(paginatedRecords.map(r => r.id));
                        else setSelectedIds([]);
                      }}
                    />
                  </TableHead>
                  <TableHead>Book & File Details</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></TableCell></TableRow>
                ) : paginatedRecords.length > 0 ? (
                  paginatedRecords.map((r) => (
                    <TableRow key={r.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(r.id) ? 'bg-blue-50' : ''}`}>
                      <TableCell className="px-4">
                        <Checkbox 
                          checked={selectedIds.includes(r.id)} 
                          onCheckedChange={() => {
                            setSelectedIds(prev => prev.includes(r.id) ? prev.filter(i => i !== r.id) : [...prev, r.id]);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-black">{r.book_name || "Untitled Book"}</div>
                        <div className="text-[11px] font-mono text-black truncate max-w-[300px]">{r.file_name}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1 h-4">{r.author_name || 'No Author'}</Badge>
                          <Badge variant="outline" className="text-[10px] px-1 h-4">{r.year || 'No Year'}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.assignee ? (
                          <div className="flex items-center gap-2 text-sm font-medium text-black">
                            <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">{r.assignee.charAt(0)}</span>
                            {r.assignee}
                          </div>
                        ) : (
                          <span className="text-xs text-orange-500 font-medium italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell><Badge className="text-[10px] font-bold uppercase">{r.status || 'Pending'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {setDetailsRecord(r); setDetailsOpen(true);}}>
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-black">No records found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-black">Showing {paginatedRecords.length} of {filteredRecords.length} results</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs font-semibold">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addRecordOpen} onOpenChange={setAddRecordOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Add New Record</DialogTitle>
                <DialogDescription>
                    Enter the file name in the format 'Book_Name-Author_Name-Year-org'. The details will be parsed automatically.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fileName">File Name</Label>
                    <Input 
                        id="fileName" 
                        value={newRecordFile} 
                        onChange={(e) => setNewRecordFile(e.target.value)}
                        placeholder="Book_Name-Author_Name-2023-org"
                    />
                </div>
                
                {newRecordFile && (
                    <div className="p-4 bg-slate-100 rounded-lg space-y-3 border">
                        <h4 className="font-semibold text-sm">Parsed Details:</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <Label className="text-muted-foreground">BOOK NAME</Label>
                                <p className="font-semibold">{parsedData.book || '...'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">AUTHOR</Label>
                                <p className="font-semibold">{parsedData.author || '...'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">YEAR</Label>
                                <p className="font-semibold">{parsedData.year || '...'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setAddRecordOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRecord}>Save Record</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white text-black p-0 rounded-2xl">
            <DialogHeader className="p-6 border-b">
                <DialogTitle className="text-xl">{detailsRecord?.book_name || "Book Details"}</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                    Detailed information about the digitization record.
                </DialogDescription>
            </DialogHeader>
            
            {detailsRecord && (
                <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    
                    <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Author</Label>
                    <p className="font-medium">{detailsRecord.author_name || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Year</Label>
                    <p className="font-medium">{detailsRecord.year || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Status</Label>
                    <div>
                        <Badge>{detailsRecord.status || 'N/A'}</Badge>
                    </div>
                    </div>

                    <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Assignee</Label>
                    <p className="font-medium">{detailsRecord.assignee || 'Unassigned'}</p>
                    </div>

                    <div className="space-y-1 col-span-2">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">File Name</Label>
                    <p className="font-mono bg-gray-100 p-2 rounded-md break-all">{detailsRecord.file_name}</p>
                    </div>

                    <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Digitized By</Label>
                    <p className="font-medium">{users?.find((u:any) => u.id === detailsRecord.digitized_by)?.name || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Scanned By</Label>
                    <p className="font-medium">{users?.find((u:any) => u.id === detailsRecord.scanned_by)?.name || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 col-span-2">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Last Edited By</Label>
                    <p className="font-medium">{users?.find((u:any) => u.id === detailsRecord.last_edited_by)?.name || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 col-span-2">
                    <Label className="text-gray-500 text-xs uppercase font-semibold">Date Added</Label>
                    <p className="text-xs font-medium">{new Date(detailsRecord.created_at).toLocaleString()}</p>
                    </div>
                </div>
                </div>
            )}
            
            <DialogFooter className="bg-gray-50 p-4 border-t rounded-b-2xl">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
