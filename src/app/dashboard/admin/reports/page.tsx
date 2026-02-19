'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReports, EmployeeReport } from '@/hooks/itsection/use-reports';
import { useAuth, User } from '@/hooks/use-auth';
import { useBooks, Book } from '@/hooks/useBooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, SlidersHorizontal, Book as BookIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

export default function AdminReportsPage() {
  const { data: reports = [], isLoading: reportsLoading } = useReports();
  const { getUsers } = useAuth(); // Assuming useAuth provides a way to get users
  const { data: users = [], isLoading: usersLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const { data: books = [], isLoading: booksLoading } = useBooks();

  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const bookMap = useMemo(() => {
    if (booksLoading) return new Map<string, string>();
    return books.reduce((map, book: Book) => {
      map.set(book.id, book.book_name);
      return map;
    }, new Map<string, string>());
  }, [books, booksLoading]);

  const filteredReports = useMemo(() => {
    let filtered = reports;

    if (employeeFilter !== 'all') {
      filtered = filtered.filter(report => report.employee_id === employeeFilter);
    }

    if (dateFilter?.from) {
        const fromDate = new Date(dateFilter.from);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(report => new Date(report.submitted_date) >= fromDate);
    }

    if (dateFilter?.to) {
        const toDate = new Date(dateFilter.to);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(report => new Date(report.submitted_date) <= toDate);
    }

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(report => 
            report.employee_name.toLowerCase().includes(lowercasedQuery) ||
            (report.book_id && bookMap.get(report.book_id)?.toLowerCase().includes(lowercasedQuery)) ||
            report.stage.toLowerCase().includes(lowercasedQuery) ||
            report.note?.toLowerCase().includes(lowercasedQuery)
        );
    }

    return filtered;
  }, [reports, employeeFilter, dateFilter, searchQuery, bookMap]);

  const isLoading = reportsLoading || usersLoading || booksLoading;

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <Card className="rounded-2xl shadow-lg border-slate-200">
        <CardHeader className="bg-slate-900 p-6 rounded-t-2xl">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
            Employee Work Reports
            <SlidersHorizontal size={18} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                    placeholder="Search by name, book, or note..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl h-12 bg-slate-100 border-transparent focus:border-indigo-500 focus:bg-white"
                />
            </div>
            <Select onValueChange={setEmployeeFilter} value={employeeFilter}>
              <SelectTrigger className="rounded-xl h-12 text-sm font-bold bg-slate-100 border-transparent"><SelectValue placeholder="Filter by employee..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {users.map((user: User) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePickerWithRange 
                className="rounded-xl h-12 bg-slate-100 border-transparent text-sm font-bold"
                date={dateFilter}
                onDateChange={setDateFilter}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-slate-200">
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
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report: EmployeeReport) => (
                      <TableRow key={report.id} className="hover:bg-slate-50">
                        <TableCell className="font-bold text-slate-800">{report.employee_name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{new Date(report.submitted_date).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={report.type === 'Book' ? 'default' : 'secondary'}>{report.type}</Badge></TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-700">{report.stage}</span>
                                {report.book_id && bookMap.get(report.book_id) && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                        <BookIcon size={12} />
                                        {bookMap.get(report.book_id)}
                                    </span>
                                )}
                                {report.note && <p className="text-xs text-slate-500 mt-1">Note: {report.note}</p>}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-indigo-600">{report.quantity > 0 ? report.quantity : '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center p-10 text-slate-500">
                        No reports found for the selected filters.
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
