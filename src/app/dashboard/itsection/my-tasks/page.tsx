'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp, CheckCircle, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast'; // <--- Ensure this file exists at this path
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Database Schema ke mutabiq updated type
type DigitizationRecord = {
  id: string;
  file_name: string;
  book_name: string;
  assignee: string | null; // This is now UUID
  deadline: string | null;
  is_digitized: boolean;
  is_uploaded: boolean;
  is_checked: boolean;
};

export default function EmployeeTaskRecordPage() {
  const { user } = useAuth();
  const { toast } = useToast(); // Hook call yahan ho rahi hai
  
  const [records, setRecords] = useState<DigitizationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployees, setExpandedEmployees] = useState<string[]>([]);
  const RECORDS_TO_SHOW = 5;

  // --- 1. Fetch Records (Using UUID for Assignee) ---
  const fetchRecords = useCallback(async () => {
    if (!user) return;
    
    let query = supabase
      .from('digitization_records')
      .select('*')
      .not('assignee', 'is', null);

    // Admin sab dekh sakta hai, Employee sirf apni ID wale tasks
    if (user.role !== 'Admin') {
      query = query.eq('assignee', user.id); 
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('digitization-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'digitization_records' },
        () => { fetchRecords(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecords]);

  // --- 2. Grouping Logic ---
  const tasksByEmployee = useMemo(() => {
    const filtered = records.filter(r => 
        r.book_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups = filtered.reduce((acc: any, task) => {
      // Agar assignee ID meri hai toh mera naam, warna ID dikhao (Admin view ke liye)
      const name = task.assignee === user?.id ? user.name : `Employee ID: ${task.assignee?.slice(0, 5)}`;
      if (!acc[name]) acc[name] = [];
      acc[name].push(task);
      return acc;
    }, {});

    return Object.keys(groups).map(name => ({
      employeeName: name,
      tasks: groups[name]
    }));
  }, [records, searchTerm, user]);

  // --- 3. Handle Mark Complete ---
  const handleMarkComplete = async (recordId: string) => {
    // Optimistic UI update
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, is_uploaded: true } : r));

    const { error } = await supabase
      .from('digitization_records')
      .update({ is_uploaded: true, completed_at: new Date().toISOString() })
      .eq('id', recordId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      fetchRecords();
    } else {
      toast({ title: 'Success', description: 'Task marked as completed.' });
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-indigo-600" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Assignment Tracker</h1>
          <p className="text-slate-500 font-medium italic">UUID Based Tracking Active</p>
        </div>
        
        {user?.role === 'Admin' && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search book or file..."
              className="pl-9 rounded-xl border-2 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid gap-8">
        {tasksByEmployee.map((emp) => {
          const isExpanded = expandedEmployees.includes(emp.employeeName);
          const displayTasks = isExpanded ? emp.tasks : emp.tasks.slice(0, RECORDS_TO_SHOW);

          return (
            <Card key={emp.employeeName} className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b flex flex-row items-center gap-4 py-5">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-slate-900 text-white font-bold">
                    {emp.employeeName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-black text-slate-800 uppercase">{emp.employeeName}</CardTitle>
                  <CardDescription className="font-bold text-indigo-600 text-[10px] uppercase">
                    {emp.tasks.length} Assignments
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-8 font-bold uppercase text-[10px]">Book Details</TableHead>
                      <TableHead className="text-center font-bold uppercase text-[10px]">Status</TableHead>
                      <TableHead className="text-right pr-8 font-bold uppercase text-[10px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="pl-8 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{task.book_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{task.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn(
                            "uppercase text-[9px] font-black",
                            task.is_uploaded ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {task.is_uploaded ? 'Uploaded' : task.is_digitized ? 'Digitized' : 'In Progress'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          {!task.is_uploaded && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="rounded-xl font-bold text-[10px] uppercase border-2 border-slate-900"
                              onClick={() => handleMarkComplete(task.id)}
                            >
                              Done
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}