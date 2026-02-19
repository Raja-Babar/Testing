'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string; // Renamed from clock_in
  check_out?: string; // Renamed from clock_out
  ip_address?: string;
  profiles?: { name: string }; 
}

/**
 * Fetches all attendance records for all employees (for admin use).
 */
export function useAllAttendance() {
  return useQuery<AttendanceRecord[], Error>({
    queryKey: ['all_attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(name)')
        .order('check_in', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch all attendance records: ${error.message}`);
      }
      // I have to manually cast here because Supabase type generator might not be up to date
      return (data as any) || [];
    },
  });
}

/**
 * Fetches the attendance log for a specific employee.
 */
export function useAttendanceLog(employeeId?: string) {
  return useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendance', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .order('check_in', { ascending: false });

      if (error) throw new Error(`Failed to fetch attendance: ${error.message}`);
      return data || [];
    },
    enabled: !!employeeId,
  });
}

/**
 * Handles the 'Check In' action for the current user.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ employeeId }: { employeeId: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ employee_id: employeeId, check_in: new Date().toISOString() }])
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', data.employee_id] });
      queryClient.invalidateQueries({ queryKey: ['all_attendance'] });
      toast({ title: 'Checked In', description: 'Your shift has started.' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Check In Failed', description: error.message });
    },
  });
}

/**
 * Handles the 'Check Out' action for an active session.
 */
export function useCheckOut() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ attendanceId, employeeId }: { attendanceId: string, employeeId: string }) => {
      const { error } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', attendanceId);
        
      if (error) throw new Error(error.message);
      return { employeeId };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', data.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['all_attendance'] });
      toast({ title: 'Checked Out', description: 'Your shift has ended.' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Check Out Failed', description: error.message });
    },
  });
}
