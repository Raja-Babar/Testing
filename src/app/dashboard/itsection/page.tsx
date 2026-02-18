'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useReports } from '@/hooks/itsection/use-reports';
import { useDigitization } from '@/hooks/itsection/use-digitization'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  History, UserCircle, Layers, BookOpen, FilePlus, ArrowRight, 
  Clock, CheckCircle2, AlertCircle, Mail, Fingerprint, Lock, ShieldCheck, KeyRound
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { reports: allReports = [] } = useReports(user);
  const { records: allRecords = [], refreshData } = useDigitization(); 
  
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // 1. REALTIME SYNC
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'digitization_records' }, 
      () => { if (refreshData) refreshData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refreshData]);

  // 2. STATISTICS
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const userReports = allReports.filter(r => r.employee_id === user?.id);
    const todayReports = userReports.filter(r => r.submitted_date === today);
    const myTasks = Array.isArray(allRecords) ? allRecords.filter(t => t.assignee === user?.name) : [];
    const pendingTasks = myTasks.filter(t => t.stage !== 'Completed');

    return {
      todayPages: todayReports.filter(r => r.type === 'Pages').reduce((s, r) => s + r.quantity, 0),
      todayBooks: todayReports.filter(r => r.type === 'Books').reduce((s, r) => s + r.quantity, 0),
      pendingTasksCount: pendingTasks.length,
      activeTask: pendingTasks[0] || null,
      recent: userReports.slice(0, 6)
    };
  }, [allReports, allRecords, user]);

  // 3. PASSWORD CHANGE FUNCTION (Yeh ab defined hai)
  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ variant: "destructive", title: "Invalid Password", description: "Minimum 6 characters required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast({ title: "Success", description: "Password updated successfully." });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return <div className="h-screen flex items-center justify-center font-black text-slate-900 uppercase animate-pulse tracking-widest italic">Syncing Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <UserCircle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none uppercase">{user.name}</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1.5 tracking-wider italic">{user.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/itsection/global-library">
            <Button variant="outline" className="rounded-xl h-10 px-5 font-black text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50">
              Library
            </Button>
          </Link>
          <Link href="/dashboard/itsection/employee-reports">
            <Button className="rounded-xl h-10 px-5 font-black text-[10px] uppercase tracking-widest bg-slate-900 hover:bg-indigo-600 shadow-md group">
              <FilePlus className="mr-2 h-4 w-4" /> New Report
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-200/50 p-1 rounded-xl inline-flex w-auto mb-6 border border-slate-200">
          <TabsTrigger value="overview" className="rounded-lg px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white">Overview</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[1.5rem] p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Today's Pages</p>
                <h3 className="text-4xl font-black tracking-tighter font-mono italic">{stats.todayPages.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10"><Layers className="h-5 w-5 text-indigo-400" /></div>
            </Card>

            <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[1.5rem] p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Today's Books</p>
                <h3 className="text-4xl font-black tracking-tighter font-mono italic">{stats.todayBooks.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10"><BookOpen className="h-5 w-5 text-emerald-400" /></div>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white rounded-[1.5rem] p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Pending Tasks</p>
                <h3 className="text-4xl font-black tracking-tighter font-mono italic">{stats.pendingTasksCount}</h3>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 border border-orange-100"><Clock className="h-5 w-5" /></div>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-slate-200 shadow-sm rounded-[2rem] bg-white overflow-hidden">
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800">
                <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <History size={12} /> Recent Activity Log
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.recent.map((report) => (
                    <div key={report.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-black text-[8px] uppercase">{report.type}</Badge>
                        <span className="text-[9px] font-bold text-slate-400 uppercase italic font-mono">{report.submitted_date}</span>
                      </div>
                      <p className="text-xl font-black tracking-tighter">{report.quantity.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-indigo-600 uppercase mt-1 italic tracking-tighter truncate">{report.stage}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[2rem] bg-white overflow-hidden flex flex-col">
              <div className="bg-indigo-600 px-6 py-3 border-b border-indigo-500">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <AlertCircle size={12} /> Live Assignment
                </CardTitle>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                {stats.activeTask ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black text-sm uppercase text-slate-800 leading-tight">{stats.activeTask.book_name}</h4>
                      <p className="mt-2 text-[9px] font-mono font-bold text-slate-400 break-all bg-slate-50 p-2 rounded border border-slate-100">{stats.activeTask.file_name}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className="bg-slate-900 text-white text-[8px] font-black uppercase px-2">{stats.activeTask.stage}</Badge>
                        {stats.activeTask.deadline && <span className="text-[9px] font-black text-orange-600 uppercase italic">Due: {stats.activeTask.deadline}</span>}
                      </div>
                    </div>
                    <Link href="/dashboard/itsection/global-library">
                      <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] h-10 shadow-lg">VIEW IN HUB</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500/30 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Queue Clear</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-[2rem] shadow-sm border-slate-200 p-8 space-y-6 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg text-white"><Lock size={16}/></div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Auth Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase ml-1 italic">New Keyphrase</p>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="rounded-xl h-11 border-slate-200 font-bold"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase ml-1 italic">Confirm Keyphrase</p>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="rounded-xl h-11 border-slate-200 font-bold"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={updating || !newPassword}
                  className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-slate-900 hover:bg-indigo-600 text-white shadow-lg transition-all"
                >
                  {updating ? 'Synchronizing...' : 'Update Auth Key'}
                </Button>
              </div>
            </Card>

            <Card className="rounded-[2rem] shadow-sm border-slate-200 p-8 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-lg text-white"><ShieldCheck size={16}/></div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Identity Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Mail className="text-slate-400 h-4 w-4" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Email</p>
                    <p className="text-xs font-black text-slate-700">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Fingerprint className="text-slate-400 h-4 w-4" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">UID Reference</p>
                    <p className="text-[10px] font-mono font-bold text-indigo-600 truncate max-w-[180px]">{user.id}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}