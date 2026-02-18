'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilePlus, Trash2, Loader2, Printer, Search, Layers, ClipboardList, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useReports } from '@/hooks/itsection/use-reports';
import { useToast } from '@/hooks/use-toast';

const reportStages = ["Scanning", "Scanning Q-C", "PDF Pages", "PDF Q-C", "PDF Uploading", "Completed"];
const reportTypes = ["Pages", "Books"];

export default function EmployeeReportsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { reports, addReport, deleteReport, loading } = useReports(user);
    
    const [newReportStage, setNewReportStage] = useState('');
    const [newReportType, setNewReportType] = useState('');
    const [newReportQuantity, setNewReportQuantity] = useState('');
    const [newReportNote, setNewReportNote] = useState(''); 
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const handleAddReport = async () => {
        const qty = parseInt(newReportQuantity, 10);
        const hasNote = newReportNote.trim().length > 0;
        const hasStats = newReportStage && newReportType && !isNaN(qty) && qty > 0;

        // Agar na stats hain aur na hi note, tab error denge
        if (!hasStats && !hasNote) {
            toast({ 
                variant: 'destructive', 
                title: 'Missing Information', 
                description: 'Please enter work details or at least a note.' 
            });
            return;
        }

        // Agar note hai toh baaki fields optional hain (default value bhej rahe hain)
        const success = await addReport(
            newReportStage || "General", 
            newReportType || "Remarks", 
            isNaN(qty) ? 0 : qty, 
            reportDate, 
            newReportNote 
        );

        if (success) {
            setNewReportStage('');
            setNewReportType('');
            setNewReportQuantity('');
            setNewReportNote(''); 
            setReportDate(new Date().toISOString().split('T')[0]);
            // Toast hook ke andar se aa raha hai isliye yahan zaroorat nahi agar aapne hook mein rakha hai
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate ? r.submitted_date === filterDate : true;
        return matchesSearch && matchesDate;
    });

    const totalPages = filteredReports.filter(r => r.type === 'Pages').reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalBooks = filteredReports.filter(r => r.type === 'Books').reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg">
                        <ClipboardList size={22} />
                    </div>
                    <div>
                        <h1 className="font-black text-sm uppercase tracking-tighter text-slate-800 leading-none">Digitization Reports</h1>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1 tracking-wider italic">Daily work log & metrics</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white p-1 px-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Filter Date:</span>
                        <Input 
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-36 border-none bg-transparent h-8 focus-visible:ring-0 text-xs font-bold text-slate-700"
                        />
                    </div>
                    {user?.role === 'Admin' && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <Input 
                                placeholder="Search employee..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-48 h-10 pl-9 rounded-xl border-slate-200 bg-white text-xs font-bold focus:ring-slate-900"
                            />
                        </div>
                    )}
                    <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-slate-200 bg-white font-bold text-xs uppercase shadow-sm">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {/* Submission Form */}
            {user?.role === 'I.T & Scanning-Employee' && (
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden print:hidden">
                    <div className="bg-slate-900 px-6 py-3">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">New Entry Submission</CardTitle>
                    </div>
                    <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic tracking-widest">Work Date</label>
                            <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="rounded-xl border-slate-200 font-bold text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic tracking-widest">Stage</label>
                            <Select value={newReportStage} onValueChange={setNewReportStage}>
                                <SelectTrigger className="rounded-xl border-slate-200 font-bold text-xs uppercase"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{reportStages.map(s => <SelectItem key={s} value={s} className="text-xs font-bold uppercase">{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic tracking-widest">Type</label>
                            <Select value={newReportType} onValueChange={setNewReportType}>
                                <SelectTrigger className="rounded-xl border-slate-200 font-bold text-xs uppercase"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{reportTypes.map(t => <SelectItem key={t} value={t} className="text-xs font-bold uppercase">{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic tracking-widest">Quantity</label>
                            <Input type="number" placeholder="00" value={newReportQuantity} onChange={(e) => setNewReportQuantity(e.target.value)} className="rounded-xl border-slate-50 font-bold text-xs" />
                        </div>
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic tracking-widest">Remarks / Note</label>
                            <Input 
                                type="text" 
                                placeholder="Extra info..." 
                                value={newReportNote} 
                                onChange={(e) => setNewReportNote(e.target.value)} 
                                className="rounded-xl border-slate-200 font-bold text-xs" 
                            />
                        </div>
                        <Button onClick={handleAddReport} className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-xl h-10 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95">
                            <FilePlus className="mr-2 h-4 w-4" /> Log Work
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Reports Table Section */}
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-slate-300" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-900">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-4">Employee</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-4">Work Date</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-4">Work Stage</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-4">Type</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-4 text-right">Quantity</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-4 text-center print:hidden">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center p-20 text-[10px] font-black text-slate-300 uppercase tracking-widest">No reports found</TableCell></TableRow>
                                    ) : filteredReports.map((report) => (
                                        <TableRow key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <TableCell className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-700 uppercase leading-none">{report.employee_name}</span>
                                                    {report.note && (
                                                        <span className="text-[9px] font-bold text-indigo-500 uppercase mt-1 flex items-center gap-1 italic">
                                                            <MessageSquare size={10} className="shrink-0" /> {report.note}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4 italic font-mono font-black text-xs">{report.submitted_date}</TableCell>
                                            <TableCell className="p-4">
                                                <Badge variant="outline" className="rounded-lg border-slate-200 bg-white text-slate-600 text-[9px] font-black uppercase px-2 shadow-xs whitespace-nowrap">
                                                    <Layers className="mr-1 h-3 w-3" /> {report.stage}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-4 font-black uppercase text-[10px]">
                                                <span className={report.type === 'Books' ? 'text-emerald-600' : 'text-indigo-600'}>
                                                    {report.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-4 text-right font-mono font-black text-slate-50 text-lg">
                                                {report.quantity.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="p-4 text-center print:hidden">
                                                {(user?.role === 'Admin' || user?.id === report.employee_id) && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => deleteReport(report.id)}
                                                        className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {/* Summary Footer */}
                <div className="bg-slate-900 p-6 print:bg-white print:border-t">
                    <div className="flex flex-col md:flex-row justify-end gap-6 md:gap-12 items-center">
                        <div className="text-right group">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Total Pages Processed</p>
                            <p className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tighter italic">
                                {totalPages.toLocaleString()}
                            </p>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-800 hidden md:block" />
                        <div className="text-right group">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Total Books Processed</p>
                            <p className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tighter italic">
                                {totalBooks.toLocaleString()}
                            </p>
                        </div>
                        <div className="h-12 w-[1px] bg-slate-700 hidden md:block" />
                        <div className="text-right p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm px-8">
                            <p className="text-[9px] text-indigo-400 uppercase font-black tracking-[0.3em] mb-1">Cumulative Metrics</p>
                            <p className="text-4xl font-black text-indigo-500 tracking-tighter italic">
                                {(totalPages + totalBooks).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}