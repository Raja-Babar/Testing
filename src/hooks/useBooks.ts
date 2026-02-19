'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Book } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

/**
 * Fetches all books (digitization records) from the database.
 */
export function useBooks() {
  return useQuery<Book[], Error>({
    queryKey: ['digitization_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('digitization_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch records: ${error.message}`);
      }
      return data || [];
    },
  });
}

/**
 * Fetches books assigned to a specific employee that are not yet completed.
 */
export function useAssignedBooks(employeeId?: string) {
  return useQuery<Book[], Error>({
    queryKey: ['assignedBooks', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('digitization_records')
        .select('*')
        .eq('assignee_id', employeeId)
        .neq('status', 'Completed')
        .order('book_name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch assigned books: ${error.message}`);
      }
      return data || [];
    },
    enabled: !!employeeId,
  });
}

/**
 * Fetches a single book by its ID from the 'digitization_records' table.
 */
export function useBook(id?: string) {
  return useQuery<Book, Error>({
    queryKey: ['digitization_record', id],
    queryFn: async () => {
      if (!id) throw new Error('Book ID cannot be empty.');
      
      const { data, error } = await supabase
        .from('digitization_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch book (ID: ${id}): ${error.message}`);
      }
      if (!data) {
        throw new Error(`Book with ID ${id} not found.`);
      }

      return data;
    },
    enabled: !!id,
  });
}

/**
 * Deletes a book record from the database.
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase
        .from('digitization_records')
        .delete()
        .eq('id', bookId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Book Deleted',
        description: 'The book record has been successfully removed.',
      });
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['digitization_records'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error Deleting Book',
        description: error.message,
      });
    },
  });
}
