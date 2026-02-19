'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBook, useDeleteBook } from '@/hooks/useBooks';
import { useUsers } from '@/hooks/useUsers'; // Import the new hook
import { BookForm } from '@/components/BookForm';
import { StageProgressBar } from '@/components/StageProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, User, FileText, ScanLine, Sparkles, CheckCircle, Upload, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: { [key: string]: string } = {
  Pending: "bg-yellow-100 text-yellow-800",
  'In Progress': "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  'On-Hold': "bg-gray-100 text-gray-800",
};

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: book, isLoading, isError } = useBook(id);
  const { data: users = [] } = useUsers(); // Fetch users
  const deleteBook = useDeleteBook();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Helper to find a user's name by their ID
  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user?.full_name || userId; // Fallback to ID if name not found
  };

  if (isLoading) {
    return (
        <div className="space-y-6 p-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg">Book not found</p>
        <Button variant="link" onClick={() => router.push('/dashboard/books')}>← Back to Books</Button>
      </div>
    );
  }
  
  const handleSave = () => {
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    deleteBook.mutate(id, {
        onSuccess: () => router.push('/dashboard/books'),
    });
  };

  // Create a details list with user names instead of IDs
  const detailsList = [
    { label: 'File Name', value: book.file_name },
    { label: 'Book Name', value: book.book_name },
    { label: 'Author Name', value: book.author_name },
    { label: 'Year', value: book.year },
    { label: 'Status', value: book.status },
    { label: 'Source', value: book.source },
    { label: 'Assignee', value: getUserName(book.assignee) },
    { label: 'Scanned By', value: getUserName(book.scanned_by) },
    { label: 'Digitized By', value: getUserName(book.digitized_by) },
    { label: 'Created By', value: getUserName(book.created_by) },
    { label: 'Last Edited By', value: getUserName(book.last_edited_by) },
    { label: 'Stage', value: book.stage },
    { label: 'Total Pages', value: book.total_pages },
    { label: 'Notes', value: book.notes, fullWidth: true },
    { label: 'Language', value: book.language },
    { label: 'Quality Score', value: book.quality_score },
    { label: 'Pages Scanned', value: book.pages_scanned },
    { label: 'Pages Digitized', value: book.pages_digitized },
    { label: 'Is Scanned', value: book.is_scanned ? 'Yes' : 'No' },
    { label: 'Is Digitized', value: book.is_digitized ? 'Yes' : 'No' },
    { label: 'Is Checked', value: book.is_checked ? 'Yes' : 'No' },
    { label: 'Is Uploaded', value: book.is_uploaded ? 'Yes' : 'No' },
    { label: 'Scan Progress', value: `${book.scan_progress_percentage || 0}%` },
    { label: 'Assigned to Checking', value: getUserName(book.assigned_to_checking) },
    { label: 'Assigned to Uploading', value: getUserName(book.assigned_to_uploading) },
    { label: 'Completed At', value: book.completed_at ? new Date(book.completed_at).toLocaleDateString() : 'N/A' },
];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
              </Button>
              <div>
                  <h1 className="text-2xl font-bold text-slate-800">{book.book_name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                      {book.author_name && <span className="text-sm text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> {book.author_name}</span>}
                      <span className="text-sm text-slate-400 flex items-center gap-1"><FileText className="w-3 h-3" /> {book.total_pages || 0} pages</span>
                      {book.status && <Badge className={cn("text-xs", statusColors[book.status])}>{book.status}</Badge>}
                  </div>
              </div>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
          </div>
      </div>

      {/* Stage Progress */}
      <Card className="border-slate-100 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <StageProgressBar currentStage={book.stage} status={book.status} />
          </div>
        </CardContent>
      </Card>

       {/* Details */}
        <Card className="border-slate-100 rounded-2xl">
          <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            {detailsList.map(({ label, value, fullWidth }) => value ? (
              <div key={label} className={cn("flex text-sm", fullWidth ? "flex-col md:col-span-2" : "justify-between items-center")}>
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-800 font-medium text-right">{String(value)}</span>
              </div>
            ) : null)}
          </CardContent>
        </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Edit Book</DialogTitle></DialogHeader>
              <BookForm book={book} onSave={handleSave} onCancel={() => setIsEditDialogOpen(false)} />
          </DialogContent>
      </Dialog>
    </div>
  );
}
