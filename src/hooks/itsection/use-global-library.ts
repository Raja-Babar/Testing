"""
"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Define the type for a record
type Record = {
  id: number;
  file_name: string;
  title_english?: string;
  author_english?: string;
  year?: string;
  status?: string;
  // Add any other fields from datadb table that you might need
  [key: string]: any;
};

export function useGlobalLibrary() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // --- 1. DATA FETCHING LOGIC from 'datadb' ---
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch data from the 'datadb' table instead of 'digitization'
      const { data, error } = await supabase
        .from('datadb')
        .select('*')
        .order('created_at', { ascending: false }); // Adjust ordering if needed

      if (error) {
        throw error;
      }
      setRecords(data || []);
    } catch (error: any) {
      toast({
        title: 'Error Fetching Records',
        description: `Could not fetch data from 'datadb'. Reason: ${error.message}`,
        variant: 'destructive',
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // --- 2. FILE NAME PARSING (Assuming same logic is needed) ---
  const parseFileName = useCallback((fileName: string) => {
    if (!fileName) return { book: '', author: 'unknown', year: 'unknown' };
    
    const parts = fileName.split('-').map(p => p.trim());
    const book = parts[0] ? parts[0].replace(/_/g, ' ') : '';
    let author = 'unknown';
    let year = 'unknown';

    if (parts[1]) {
      if (/^\d+$/.test(parts[1])) {
        author = 'unknown';
        year = parts[1];
      } else {
        author = parts[1].replace(/_/g, ' ');
      }
    }
    
    // This part is simplified, adjust if you have more complex naming
    if (parts.length > 2) {
       year = parts[2];
    }

    return { book, author, year };
  }, []);
  
  // --- 3. REFRESH FUNCTION ---
  const refreshData = () => {
    fetchRecords();
  };

  // --- 4. DUMMY IMPORT FUNCTION (as original hook) ---
  const handleImport = () => {
    toast({
      title: 'Not Implemented',
      description: 'Import functionality can be configured for this table.',
    });
  };

  return { 
    records, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    refreshData,
    handleImport,
    parseFileName
  };
}
""