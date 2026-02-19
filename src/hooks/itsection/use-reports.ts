'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Type definition for a single report from the `employee_reports` table
export interface EmployeeReport {
  id: string;
  employee_id: string;
  employee_name: string;
  submitted_date: string;
  stage: string;
  type: string;
  quantity: number;
  note: string;
  book_id?: string;
}

// Type definition for the data sent from the form
export interface ReportSubmission {
  employeeId: string;
  employeeName: string;
  bookId?: string | null;
  stage: 'Digitized' | 'Scanned' | 'Checked' | 'Other' | 'General';
  pagesCompleted?: number;
  note?: string;
  reportType: 'Book' | 'Other' | 'Remarks' | 'Pages';
}

/**
 * Fetches all reports for all employees. (For Admin)
 */
export function useReports() {
  return useQuery<EmployeeReport[], Error>({
    queryKey: ['employee_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_reports')
        .select('*')
        .order('submitted_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }
      return data || [];
    },
  });
}

/**
 * Fetches reports for a specific employee. (For Employee Dashboard)
 */
export function useMyReports(employeeId?: string) {
  return useQuery<EmployeeReport[], Error>({
    queryKey: ['my_reports', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('employee_reports')
        .select('*')
        .eq('employee_id', employeeId)
        .order('submitted_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }
      return data || [];
    },
    enabled: !!employeeId,
  });
}


/**
 * Creates a new report by calling a PostgreSQL function.
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: ReportSubmission) => {
        const { data, error } = await supabase.rpc('submit_employee_report', {
            p_employee_id: submission.employeeId,
            p_employee_name: submission.employeeName,
            p_book_id: submission.bookId,
            p_stage: submission.stage,
            p_pages_completed: submission.pagesCompleted || 0,
            p_note: submission.note,
            p_report_type: submission.reportType,
        });

        if (error) {
            console.error('RPC Error:', error);
            throw new Error(`Transaction failed: ${error.message}`);
        }

        return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Your work report has been submitted.' });
      // Refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['employee_reports'] });
      queryClient.invalidateQueries({ queryKey: ['my_reports'] });
      queryClient.invalidateQueries({ queryKey: ['digitization_records'] });
      queryClient.invalidateQueries({ queryKey: ['assignedBooks'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    },
  });
}

/**
 * Deletes a report.
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('employee_reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        throw new Error(`Failed to delete report: ${error.message}`);
      }
      return reportId;
    },
    onSuccess: () => {
      toast({ title: 'Report Deleted', description: 'The report has been removed.' });
      queryClient.invalidateQueries({ queryKey: ['employee_reports'] });
      queryClient.invalidateQueries({ queryKey: ['my_reports'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
    },
  });
}
