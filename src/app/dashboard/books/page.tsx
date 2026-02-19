'use client'

import { useState } from 'react'
import Link from 'next/link';
import { useBooks } from '@/hooks/useBooks'
import { BookForm } from '@/components/BookForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Eye, Loader2 } from 'lucide-react'

// This type should match your `digitization_records` table schema
type BookRecord = {
  id: string;
  book_name: string | null;
  author_name: string | null;
  year: string | null;
  status: string | null;
  stage: string | null;
  assignee: string | null;
  priority: string | null;
  language: string | null;
  category: string | null;
};

export default function BooksPage() {
  const [search, setSearch] = useState('')
  const { data: books = [], isLoading } = useBooks()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredBooks = books.filter((book: BookRecord) =>
    book.book_name?.toLowerCase().includes(search.toLowerCase()) ||
    book.author_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Book Digitization Records</h1>
        <Button onClick={() => { setIsAddDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by book name or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Name</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading book records...</p>
                  </TableCell>
                </TableRow>
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.book_name || 'N/A'}</TableCell>
                    <TableCell>{book.author_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={book.status === 'Completed' ? 'default' : 'secondary'}>
                        {book.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{book.stage || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                          book.priority === 'Urgent' ? 'destructive' :
                          book.priority === 'High' ? 'outline' :
                          'secondary'
                      }>
                        {book.priority || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>{book.assignee || 'Unassigned'}</TableCell>
                    <TableCell className="text-right">
                        <Link href={`/dashboard/books/${book.id}`} passHref>
                           <Button variant="ghost" size="icon">
                               <Eye className="h-4 w-4" />
                           </Button>
                        </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No books found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>Add Book</DialogTitle>
              </DialogHeader>
              <BookForm book={null} onSave={handleSave} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
      </Dialog>
    </div>
  )
}
