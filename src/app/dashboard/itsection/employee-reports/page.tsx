'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useReports, useMyReports, useCreateReport, useDeleteReport, EmployeeReport } from '@/hooks/itsection/use-reports';
import { useDigitization } from '@/hooks/itsection/use-digitization';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ClipboardList, Search, Printer, FilePlus, MessageSquare, Layers, Trash2, Book as BookIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const reportStages = ["Scanning", "Scanning Q-C", "PDF Pages", "PDF Q-C", "PDF Uploading", "Remarks"];
const reportTypes = ["Pages", "Books"];

export default function EmployeeReportsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const isAdmin = user?.role === 'Admin';
    const isEmployee = user?.role === 'I.T & Scanning-Employee';
    
    // Hooks: Admin gets all, Employee gets only their history
    const { data: reports = [], isLoading: reportsLoading } = isAdmin 
        ? useReports() 
        : useMyReports(user?.id);

    const { records: allBooks = [] } = useDigitization(); 
    const { mutate: createReport, isPending: isCreating } = useCreateReport();
    const { mutate: deleteReport } = useDeleteReport();

    // Form State
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [newReportStage, setNewReportStage] = useState('');
    const [newReportType, setNewReportType] = useState('');
    const [newReportQuantity, setNewReportQuantity] = useState('');
    const [newReportNote, setNewReportNote] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Filter books assigned to the current user
    const assignedBooks = useMemo(() => {
        return allBooks.filter(book => 
            book.assignee_id === user?.id || 
            book.assigned_to_checking === user?.name || 
            book.assigned_to_uploading === user?.name
        );
    }, [allBooks, user]);

    const handleAddReport = async () => {
        if (!user) return;
        const qty = parseInt(newReportQuantity, 10) || 0;
        
        if (!selectedBookId && isEmployee && newReportStage !== "Remarks") {
            toast({ variant: 'destructive', title: 'Selection Required', description: 'Please select a book.' });
            return;
        }

        createReport({
            employeeId: user.id,
            employeeName: user.name,
            bookId: selectedBookId || null,
            stage: newReportStage as any,
            reportType: (newReportType || 'Pages') as any,
            pagesCompleted: qty, 
            note: newReportNote,
        });

        // Reset fields
        setSelectedBookId('');
        setNewReportStage('');
        setNewReportType('');
        setNewReportQuantity('');
        setNewReportNote('');
    };

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const matchesSearch = isAdmin ? (r.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) : true;
            const matchesDate = filterDate ? r.submitted_date === filterDate : true;
            return matchesSearch && matchesDate;
        });
    }, [reports, searchTerm, filterDate, isAdmin]);

    const totalPages = filteredReports.filter(r => r.type === 'Pages').reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg">
                        <ClipboardList size={22} />
                    </div>
                    <div>
                        <h1 className="font-black text-sm uppercase tracking-tighter text-slate-800 leading-none">
                            {isAdmin ? "Digitization Reports (All)" : "My Work History"}
                        </h1>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1 tracking-wider italic">Daily work log & metrics</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Input 
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-36 h-10 rounded-xl border-slate-200 bg-white text-xs font-bold"
                    />
                    {isAdmin && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <Input 
                                placeholder="Search employee..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-48 h-10 pl-9 rounded-xl border-slate-200 bg-white text-xs font-bold"
                            />
                        </div>
                    )}
                    <Button variant="outline" onClick={() => window.print()} className="rounded-xl bg-white font-bold text-xs uppercase">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {isEmployee && (
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden print:hidden">
                    <div className="bg-slate-900 px-6 py-3">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Log Your Work</CardTitle>
                    </div>
                    <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-6">
                        <div className="space-y-1.5 md:col-span-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Book</label>
                            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                                <SelectTrigger className="rounded-xl border-slate-200 font-bold text-xs">
                                    <SelectValue placeholder="Choose Book..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignedBooks.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="text-xs font-bold">
                                            {b.book_name} ({b.pages_digitized}/{b.total_pages})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Stage</label>
                            <Select value={newReportStage} onValueChange={setNewReportStage}>
                                <SelectTrigger className="rounded-xl border-slate-200 font-bold text-xs uppercase"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{reportStages.map(s => <SelectItem key={s} value={s} className="text-xs font-bold uppercase">{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type</label>
                            <Select value={newReportType} onValueChange={setNewReportType}>
                                <SelectTrigger className="rounded-xl border-slate-200 font-bold text-xs uppercase"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{reportTypes.map(t => <SelectItem key={t} value={t} className="text-xs font-bold uppercase">{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Qty</label>
                            <Input type="number" placeholder="0" value={newReportQuantity} onChange={(e) => setNewReportQuantity(e.target.value)} className="rounded-xl border-slate-200 font-bold text-xs" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Note</label>
                            <Input value={newReportNote} onChange={(e) => setNewReportNote(e.target.value)} className="rounded-xl border-slate-200 font-bold text-xs" />
                        </div>
                        <Button onClick={handleAddReport} disabled={isCreating} className="w-full md:col-span-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl h-10 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95">
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />} Post
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {reportsLoading ? (
                        <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-slate-300" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-900">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        {isAdmin && <TableHead className="text-[10px] font-black uppercase text-slate-400 p-4">Employee</TableHead>}
                                        <TableHead className="text-[10px] font-black uppercase text-slate-400 p-4">Work Date</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-slate-400 p-4">Work Stage</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-slate-400 p-4">Type</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-slate-400 p-4 text-right">Quantity</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-slate-400 p-4 text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow><TableCell colSpan={isAdmin ? 6 : 5} className="text-center p-20 text-[10px] font-black text-slate-300 uppercase">No history found</TableCell></TableRow>
                                    ) : (
                                        filteredReports.map((report: EmployeeReport) => (
                                            <TableRow key={report.id} className="hover:bg-slate-50 transition-colors">
                                                {isAdmin && <TableCell className="p-4 text-xs font-black text-slate-700 uppercase">{report.employee_name}</TableCell>}
                                                <TableCell className="p-4 italic font-mono font-black text-xs">{report.submitted_date}</TableCell>
                                                <TableCell className="p-4">
                                                    <Badge variant="outline" className="rounded-lg border-slate-200 bg-white text-slate-600 text-[9px] font-black uppercase">
                                                        <Layers className="mr-1 h-3 w-3" /> {report.stage}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-4 font-black uppercase text-[10px]">{report.type}</TableCell>
                                                <TableCell className="p-4 text-right font-mono font-black text-slate-800 text-lg">{report.quantity.toLocaleString()}</TableCell>
                                                <TableCell className="p-4 text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => deleteReport(report.id)} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
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