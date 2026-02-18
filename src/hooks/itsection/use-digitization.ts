'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useDigitization() {
  const [records, setRecords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 25;

  const fetchRecords = useCallback(async (search: string, currentPage: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from('digitization_records')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(
          `file_name.ilike.%${search}%,` +
          `book_name.ilike.%${search}%,` +
          `author_name.ilike.%${search}%,` +
          `year.ilike.%${search}%`
        );
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
      setTotalCount(count || 0);
    } catch (e: any) {
      console.error("Fetch Error:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchRecords(searchTerm, 1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, fetchRecords]);

  useEffect(() => {
    if (page !== 1) fetchRecords(searchTerm, page);
  }, [page, fetchRecords]);

  return { records, totalCount, loading, page, setPage, pageSize, searchTerm, setSearchTerm };
}