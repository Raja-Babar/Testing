'use client';

import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  DollarSign, 
  Users, 
  FileText, 
  View, 
  Wallet, 
  ChevronUp, 
  ChevronDown,
  Loader2,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Status colors aligned with the premium theme
const getScanningStatusClasses = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-emerald-500 text-white shadow-sm';
    case 'uploading': return 'bg-sky-500 text-white shadow-sm';
    case 'scanning': return 'bg-amber-500 text-white shadow-sm';
    case 'pdf-qc': return 'bg-indigo-600 text-white shadow-sm';
    case 'scanning-qc': return 'bg-rose-600 text-white shadow-sm';
    default: return 'bg-slate-200 text-slate-700';
  }
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'Admin' && user.role !== 'Accounts') {
      router.replace('/dashboard/itsection');
    }
  }, [user, isLoading, router]);

  if (isLoading && !user) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Data...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8 p-2 md:p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {user.role === 'Admin' ? (
        <AdminDashboard />
      ) : user.role === 'Accounts' ? (
        <AccountsDashboard />
      ) : (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Routing to workspace...</p>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { users, scanningRecords, employeeReports } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const RECORDS_TO_SHOW = 6;

  const totalEmployees = users?.filter(u => u.role !== 'Admin').length || 0;
  const projectsOngoing = scanningRecords?.length || 0;
  const reportsToday = employeeReports?.filter(r => r.submitted_date === new Date().toISOString().split('T')[0]).length || 0;

  const sortedRecords = useMemo(() => {
    return [...(scanningRecords || [])].sort((a, b) => 
      new Date(b.last_edited_time).getTime() - new Date(a.last_edited_time).getTime()
    );
  }, [scanningRecords]);

  const stats = [
    { title: 'Workforce', value: totalEmployees, sub: 'Active Members', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/admin/user-management' },
    { title: 'Scanning Hub', value: projectsOngoing, sub: 'Active Files', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/dashboard/admin/scanning' },
    { title: 'Daily Reports', value: reportsToday, sub: 'Submissions Today', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', href: '/dashboard/itsection/employee-reports' },
    { title: 'Finance', value: 'Live', sub: 'Salaries & Cash', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/admin/salaries' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Executive Overview</h1>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status: Optimal</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title}>
            <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border-slate-200/60 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{stat.title}</CardTitle>
                <div className={cn("p-2 rounded-xl transition-colors", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{stat.sub}</p>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-indigo-600 group-hover:w-full transition-all duration-500" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity Table */}
      <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-5">
          <div className="space-y-1">
            <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              Real-time Pipeline
            </CardTitle>
            <CardDescription className="text-[10px] font-medium uppercase">Last actions across digitization units</CardDescription>
          </div>
          <Link href="/dashboard/admin/scanning">
            <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8 rounded-lg border-slate-200">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-10">Asset Title</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-10">Unit Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-10">Operator</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-10">Timestamp</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.slice(0, isExpanded ? 20 : RECORDS_TO_SHOW).map((record) => (
                  <TableRow key={record.book_id} className="group hover:bg-indigo-50/30 transition-colors border-slate-50">
                    <TableCell className="py-4">
                      <p className="font-bold text-xs text-slate-800 tracking-tight uppercase truncate max-w-[240px]">
                        {record.title_english || "Untitled Metadata"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border-none", getScanningStatusClasses(record.status))}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-slate-500 uppercase">{record.assigned_to || '--'}</TableCell>
                    <TableCell className="text-[10px] font-mono text-slate-400">
                      {new Date(record.last_edited_time).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/dashboard/admin/scanning">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <View className="h-4 w-4 text-indigo-600" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {sortedRecords.length > RECORDS_TO_SHOW && (
          <CardFooter className="p-0 border-t border-slate-50">
            <Button 
              variant="ghost" 
              className="w-full rounded-none h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Compress Records' : 'Expand System Activity'}
              {isExpanded ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function AccountsDashboard() {
  const accountStats = [
    { title: 'Salary Ledgers', sub: 'Employee Payroll', icon: DollarSign, href: '/dashboard/admin/salaries', color: 'text-emerald-600' },
    { title: 'Expense Tracking', sub: 'Petty Cash Flow', icon: Wallet, href: '/dashboard/admin/petty-cash', color: 'text-blue-600' },
    { title: 'Official Letters', sub: 'Correspondence', icon: FileText, href: '/dashboard/admin/correspondence', color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Financial Terminal</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Authorized Accounts Access Only</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {accountStats.map((stat) => (
          <Link href={stat.href} key={stat.title}>
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/60 rounded-2xl group overflow-hidden">
              <CardHeader className="pb-2">
                <div className="p-3 bg-slate-50 rounded-xl w-fit group-hover:bg-white transition-colors">
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-800">{stat.title}</CardTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}