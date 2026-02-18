"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import BookCard from '@/components/base44/books/BookCard';
import { supabase } from '@/lib/supabase';

function mapRecordToBook(r) {
  return {
    id: r.id,
    title: r.book_name || r.file_name || r.metadata_title || 'Untitled',
    author: r.author_name || r.metadata_author || '',
    priority: r.priority || 'Medium',
    status: r.status || (r.is_uploaded ? 'Completed' : 'In Progress'),
    total_pages: r.total_pages || 0,
    pages_scanned: r.pages_scanned || 0,
    pages_digitized: r.pages_digitized || 0,
    is_scanned: r.is_scanned,
    is_digitized: r.is_digitized,
    is_checked: r.is_checked,
    is_uploaded: r.is_uploaded,
    current_stage: r.stage || r.current_stage || '',
  };
}

export default function BooksPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('digitization_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.error('Failed to load digitization records', error);
      } else if (mounted) {
        setBooks((data || []).map(mapRecordToBook));
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (isLoading || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-4">Base44 — Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map(b => (
          <BookCard key={b.id} book={b} onClick={() => router.push(`/base44/books/${b.id}`)} />
        ))}
      </div>
    </div>
  );
}
