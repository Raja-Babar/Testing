'use client';

import { useAuth } from '@/hooks/use-auth';
import { useAttendanceLog, AttendanceRecord } from '@/hooks/useAttendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';

export default function AttendanceLogPage() {
  const { user } = useAuth();
  const { data: attendanceLog = [], isLoading } = useAttendanceLog(user?.id);

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return 'In Progress';
    return formatDistance(new Date(end), new Date(start), { includeSeconds: true });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <Card className="rounded-2xl shadow-lg border-slate-200">
        <CardHeader className="bg-slate-900 p-6 rounded-t-2xl">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Clock size={18} />
            Your Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-20">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceLog.length > 0 ? (
                    attendanceLog.map((record: AttendanceRecord) => (
                      <TableRow key={record.id} className="hover:bg-slate-50">
                        <TableCell className="font-bold">{new Date(record.check_in).toLocaleDateString()}</TableCell>
                        <TableCell className="text-green-600 font-semibold">{new Date(record.check_in).toLocaleTimeString()}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">{calculateDuration(record.check_in, record.check_out)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center p-10 text-slate-500">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
