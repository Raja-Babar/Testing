'use client'

import { useAuth, User } from '@/hooks/use-auth';
import { useAssignedBooks } from '@/hooks/useBooks';
import { useMyReports, EmployeeReport } from '@/hooks/itsection/use-reports'; // Optimized hook
import { useAttendanceLog, useCheckIn, useCheckOut } from '@/hooks/useAttendance'; // Renamed hooks
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilePlus, History, Book, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Admin Dashboard Component
import AdminDashboard from '@/components/dashboards/admin-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard user={user} />;
}

function EmployeeDashboard({ user }: { user: User | null }) {
  const { data: assignedBooks = [], isLoading: booksLoading } = useAssignedBooks(user?.id);
  const { data: myReports = [], isLoading: reportsLoading } = useMyReports(user?.id);
  const { data: attendanceLog = [], isLoading: attendanceLoading } = useAttendanceLog(user?.id);

  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { mutate: checkOut, isPending: isCheckingOut } = useCheckOut();

  const activeSession = attendanceLog.find(record => !record.check_out);

  const handleCheckIn = () => {
    if (user?.id) checkIn({ employeeId: user.id });
  };

  const handleCheckOut = () => {
    if (user?.id && activeSession) {
      checkOut({ attendanceId: activeSession.id, employeeId: user.id });
    }
  };

  const recentReportsSlice = myReports.slice(0, 5);
  const isLoading = booksLoading || reportsLoading || attendanceLoading;

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* User Profile Header */}
      <Card className="rounded-2xl shadow-lg border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6 flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-slate-700">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                <AvatarFallback className="bg-indigo-500 text-white font-bold text-2xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-slate-400 font-semibold">Role: {user?.role}</p>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

            {/* Assigned Books */}
            <Card className="rounded-2xl shadow-lg border-slate-200">
                <CardHeader><CardTitle className="flex items-center gap-2"><Book size={18}/> Your Assigned Books</CardTitle></CardHeader>
                <CardContent>
                    {booksLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 
                    assignedBooks.length > 0 ? (
                        <ul className="space-y-3">
                            {assignedBooks.map(book => (
                                <li key={book.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100">
                                    <span className="font-semibold">{book.book_name}</span>
                                    <Badge variant={book.status === 'Completed' ? 'default' : 'secondary'}>{book.status}</Badge>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-slate-500 py-4">You have no books assigned.</p>}
                </CardContent>
            </Card>

            {/* Recent Reports History */}
            <Card className="rounded-2xl shadow-lg border-slate-200">
                <CardHeader><CardTitle className="flex items-center gap-2"><History size={18}/> Your Recent Reports</CardTitle></CardHeader>
                <CardContent>
                    {reportsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 
                    <Table>
                        <TableHeader><TableRow>
                          <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Stage/Note</TableHead><TableHead className="text-right">Pages</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                        {recentReportsSlice.length > 0 ? recentReportsSlice.map((report: EmployeeReport) => (
                            <TableRow key={report.id}>
                            <TableCell>{new Date(report.submitted_date).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant={report.type === 'Book' ? 'default' : 'secondary'}>{report.type}</Badge></TableCell>
                            <TableCell>{report.stage} {report.note && <span className='text-xs text-slate-500'>({report.note})</span>}</TableCell>
                            <TableCell className="text-right font-bold">{report.quantity > 0 ? report.quantity : '-'}</TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="text-center p-8 text-slate-500">No recent reports.</TableCell></TableRow>}
                        </TableBody>
                    </Table>}
                </CardContent>
            </Card>

        </div>

        <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="rounded-2xl shadow-lg border-slate-200">
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle size={18}/> Quick Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-col space-y-3">
                  <Link href="/dashboard/itsection/employee-reports" passHref><Button className="w-full justify-start gap-2 rounded-lg"><FilePlus size={16}/> Submit Report</Button></Link>
                  <Link href="/dashboard/itsection/employee-reports" passHref><Button variant="outline" className="w-full justify-start gap-2 rounded-lg"><History size={16}/> View Report History</Button></Link>
              </CardContent>
            </Card>

            {/* Attendance Section */}
            <Card className="rounded-2xl shadow-lg border-slate-200">
                <CardHeader><CardTitle className="flex items-center gap-2"><Clock size={18}/> Attendance</CardTitle></CardHeader>
                <CardContent className="flex flex-col space-y-3">
                    {attendanceLoading ? (
                        <Button disabled className="w-full justify-start gap-2 rounded-lg"><Loader2 className="h-4 w-4 animate-spin" />Loading...</Button>
                    ) : activeSession ? (
                        <Button variant="destructive" className="w-full justify-start gap-2 rounded-lg" onClick={handleCheckOut} disabled={isCheckingOut}>
                            {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock size={16}/>}
                            Check Out (Started at {new Date(activeSession.check_in).toLocaleTimeString()})
                        </Button>
                    ) : (
                        <Button className="w-full justify-start gap-2 rounded-lg bg-green-600 hover:bg-green-700" onClick={handleCheckIn} disabled={isCheckingIn}>
                            {isCheckingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock size={16}/>}
                            Check In
                        </Button>
                    )}
                    <Link href="/dashboard/attendance" passHref><Button variant="outline" className="w-full justify-start gap-2 rounded-lg"><History size={16}/>View Attendance Log</Button></Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
