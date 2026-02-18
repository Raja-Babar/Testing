'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAttendance } from '@/hooks/itsection/use-attendance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Clock, CalendarOff, History, CheckCircle2, UserCheck, LogIn, LogOut, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AttendancePage() {
  const { user } = useAuth(); 
  const { attendanceRecords, updateAttendance, loading } = useAttendance(); 

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  const todaysRecord = useMemo(() => {
    if (!user) return null;
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());
    return attendanceRecords.find(r => r.date === today);
  }, [attendanceRecords, user]);

  const hasClockedIn = !!todaysRecord?.timeIn;
  const hasClockedOut = !!todaysRecord?.timeOut;
  const isOnLeave = todaysRecord?.status === 'Leave';

  const handleMarkLeave = async () => {
    if (!leaveReason.trim()) return;
    await updateAttendance({ markLeave: true, reason: leaveReason });
    setLeaveReason('');
    setIsLeaveModalOpen(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg">
            <UserCheck size={22} />
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-tighter text-slate-800 leading-none">Attendance Dashboard</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1 tracking-wider italic">Daily Presence Tracking</p>
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-xs font-black text-slate-700 uppercase">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
        </div>
      </div>

      {/* --- Quick Actions Card --- */}
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Clock size={12} /> Today's Actions
          </CardTitle>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              onClick={() => updateAttendance({ clockIn: true })} 
              disabled={hasClockedIn || isOnLeave || loading} 
              className={`h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-md active:scale-95 ${hasClockedIn ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
            >
              {hasClockedIn ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
              {hasClockedIn ? `In at ${todaysRecord.timeIn}` : 'Clock In'}
            </Button>

            <Button 
              onClick={() => updateAttendance({ clockOut: true })} 
              variant="outline" 
              disabled={!hasClockedIn || hasClockedOut || isOnLeave || loading} 
              className={`h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm active:scale-95 border-2 ${hasClockedOut ? 'bg-slate-50 text-slate-400 border-slate-200' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {hasClockedOut ? `Out at ${todaysRecord.timeOut}` : 'Clock Out'}
            </Button>

            <Button 
              onClick={() => setIsLeaveModalOpen(true)} 
              variant="secondary" 
              disabled={hasClockedIn || isOnLeave || loading} 
              className={`h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm active:scale-95 ${isOnLeave ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <CalendarOff className="mr-2 h-4 w-4" /> 
              {isOnLeave ? 'On Leave' : 'Apply Leave'}
            </Button>
          </div>
          {isOnLeave && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 uppercase italic">Reason: {todaysRecord?.reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- History Table Section --- */}
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <History size={14} /> My Attendance History
          </CardTitle>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-200">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 p-4">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 p-4">Clock In</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 p-4">Clock Out</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 p-4">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 p-4">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map(record => (
                    <TableRow key={record.date} className="hover:bg-slate-50/80 transition-colors group border-slate-100">
                      <TableCell className="p-4 font-mono font-black text-xs text-slate-900 italic uppercase">
                        {record.date}
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="text-xs font-bold text-slate-700">{record.timeIn || '--:--'}</span>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="text-xs font-bold text-slate-700">{record.timeOut || '--:--'}</span>
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge className={`rounded-lg text-[9px] font-black uppercase px-2 py-0.5 shadow-sm ${
                          record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          record.status === 'Leave' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                          'bg-red-50 text-red-700 border-red-100'
                        }`} variant="outline">
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 max-w-[200px] truncate italic text-slate-400 text-[10px] font-bold uppercase">
                        {record.reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- Leave Request Dialog --- */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="rounded-3xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tighter text-slate-800">Apply for Leave</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase italic">
              Today: {new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date())}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Reason (e.g. Urgent work, health issue...)" 
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="min-h-[100px] rounded-2xl border-slate-200 focus:ring-slate-900 font-bold text-xs"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsLeaveModalOpen(false)} className="rounded-xl font-bold text-xs uppercase text-slate-400">Cancel</Button>
            <Button onClick={handleMarkLeave} disabled={!leaveReason.trim()} className="rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-6 h-10 shadow-lg">Confirm Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}