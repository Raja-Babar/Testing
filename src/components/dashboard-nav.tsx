'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  DollarSign,
  Briefcase,
  BookOpen,
  ScanLine,
  Sparkles,
  Users,
  FileText,
  FileSignature,
  ChevronDown,
  File,
  Library,
  Database,
  ClipboardCheck,
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// --- SECTIONS DATA ---
const itScanningItems = [
  { href: '/dashboard/admin/scanning', icon: ScanLine, label: 'Digitization Progress' },
  { href: '/dashboard/itsection/employee-reports', icon: FileSignature, label: 'Digitization Report' },
  { href: '/dashboard/itsection/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/dashboard/itsection/employee-task-record', icon: ClipboardCheck, label: 'Employee Task Record' },
];

const mhpResearchLibraryItems = [
  { href: '/dashboard/mhprl/lib-attendance', icon: CalendarCheck, label: 'Lib-Attendance' },
  { href: '/dashboard/mhprl/lib-emp-report', icon: FileSignature, label: 'Lib-Emp-Report' },
  { href: '/dashboard/mhprl/mhpr-lib-database', icon: Database, label: 'MHPR-Lib-Database' },
];

const administrationItems = [
  { href: '/dashboard/admin/salaries', icon: DollarSign, label: 'Salaries' },
  { href: '/dashboard/admin/petty-cash', icon: Wallet, label: 'Petty Cash' },
  { href: '/dashboard/admin/correspondence', icon: FileText, label: 'Correspondence' },
];

const appFileItems = [
  { href: '/dashboard/admin/report-assistant', icon: Sparkles, label: 'Report Assistant' },
  { href: '/dashboard/admin/reporting', icon: FileText, label: 'Reporting' },
];

const publicationItems = [
  { href: '/dashboard/admin/mhprl/library', icon: Library, label: 'Auto-Generate-Bill' },
  { href: '/dashboard/admin/publications', icon: BookOpen, label: 'Bills-Records' },
];

const baseItems = [
  { href: '/dashboard/base', icon: Library, label: 'Base Home' },
  { href: '/dashboard/base/books', icon: BookOpen, label: 'Books' },
  { href: '/dashboard/base/automation', icon: Sparkles, label: 'Automation' },
  { href: '/dashboard/base/reports', icon: FileText, label: 'Reports' },
];

// --- Sub-component for Collapsible Sections ---
function NavSection({ 
  title, icon: Icon, items, isOpen, onOpenChange, pathname 
}: { 
  title: string, icon: any, items: any[], isOpen: boolean, onOpenChange: (v: boolean) => void, pathname: string 
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="w-full">
      <CollapsibleTrigger asChild>
        <SidebarMenuButton 
          className={cn(
            "w-full justify-between h-10 rounded-xl px-3 transition-all",
            isOpen ? "bg-slate-50 text-slate-900" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", isOpen ? "text-indigo-600" : "text-slate-400")} />
            <span className="font-black text-[10px] uppercase tracking-wider">{title}</span>
          </div>
          <ChevronDown className={cn('h-3 w-3 transition-transform opacity-50', isOpen && 'rotate-180')} />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent className="py-1 pl-4 border-l-2 ml-5 mt-1 border-slate-100 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton
                  isActive={isActive}
                  className={cn(
                    "h-9 rounded-lg px-3 transition-all",
                    isActive 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-indigo-400" : "text-slate-400")} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-tight", isActive && "text-white")}>
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const [openSections, setOpenSections] = useState({
    it: pathname.includes('/itsection') || pathname.includes('/scanning'),
    admin: pathname.includes('salaries') || pathname.includes('petty-cash'),
    lib: pathname.includes('mhprl'),
    pub: pathname.includes('publications') || pathname.includes('mhprl/library'),
    app: pathname.includes('report-'),
    base: pathname.startsWith('/dashboard/base'),
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!user) return null;

  const isHome = pathname === '/dashboard';

  return (
    <SidebarContent className="p-4 bg-white">
      <SidebarMenu className="flex flex-col gap-y-1.5">
        
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">Main</p>

        <SidebarMenuItem>
          <Link href="/dashboard" className="w-full">
            <SidebarMenuButton 
              isActive={isHome}
              className={cn(
                "h-11 rounded-xl px-3 group",
                isHome ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <LayoutDashboard className={cn("h-4 w-4", isHome ? "text-indigo-400" : "group-hover:text-slate-900")} />
              <span className="font-black text-[11px] uppercase tracking-wider ml-1">Terminal Home</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* --- ADMIN VIEW --- */}
        {user.role === 'Admin' && (
          <div className="space-y-1.5 mt-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">Management</p>
            
            <SidebarMenuItem>
              <Link href="/dashboard/admin/user-management">
                <SidebarMenuButton 
                  isActive={pathname.startsWith('/dashboard/admin/user-management')}
                  className={cn("h-11 rounded-xl px-3", pathname.includes('user-management') ? "bg-slate-900 text-white" : "text-slate-500")}
                >
                  <Users className={pathname.includes('user-management') ? "text-indigo-400" : ""} />
                  <span className="font-black text-[11px] uppercase tracking-wider ml-1">User Controls</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <NavSection title="I.T & Scanning" icon={ScanLine} items={itScanningItems} isOpen={openSections.it} onOpenChange={() => toggleSection('it')} pathname={pathname} />
            <NavSection title="Administration" icon={Wallet} items={administrationItems} isOpen={openSections.admin} onOpenChange={() => toggleSection('admin')} pathname={pathname} />
            <NavSection title="MHP-Library" icon={Library} items={mhpResearchLibraryItems} isOpen={openSections.lib} onOpenChange={() => toggleSection('lib')} pathname={pathname} />
            <NavSection title="Publications" icon={BookOpen} items={publicationItems} isOpen={openSections.pub} onOpenChange={() => toggleSection('pub')} pathname={pathname} />
            
            <SidebarMenuItem>
              <Link href="/dashboard/admin/projects">
                <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/projects')} className={cn("h-11 rounded-xl px-3", pathname.includes('projects') ? "bg-slate-900 text-white" : "text-slate-500")}>
                  <Briefcase className={pathname.includes('projects') ? "text-indigo-400" : ""} />
                  <span className="font-black text-[11px] uppercase tracking-wider ml-1">Global Projects</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <NavSection title="System Files" icon={File} items={appFileItems} isOpen={openSections.app} onOpenChange={() => toggleSection('app')} pathname={pathname} />
            
            <NavSection title="Base" icon={Library} items={baseItems} isOpen={openSections.base} onOpenChange={() => toggleSection('base')} pathname={pathname} />
          </div>
        )}

        {/* --- EMPLOYEE VIEWS (Simple List) --- */}
        {(user.role === 'I.T & Scanning-Employee' || user.role === 'Library-Employee') && (
          <div className="space-y-1 mt-4">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">My Operations</p>
             {(user.role === 'I.T & Scanning-Employee' ? itScanningItems : mhpResearchLibraryItems).map(item => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton 
                      isActive={pathname === item.href}
                      className={cn("h-11 rounded-xl px-3", pathname === item.href ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
                    >
                      <item.icon className={pathname === item.href ? "text-indigo-400" : ""} />
                      <span className="font-black text-[11px] uppercase tracking-wider ml-1">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
             ))}
          </div>
        )}

        {/* --- ACCOUNT --- */}
        <div className="mt-auto pt-8">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">Personal</p>
          <SidebarMenuItem>
            <Link href="/dashboard/itsection/profile" className="w-full">
              <SidebarMenuButton 
                isActive={pathname === '/dashboard/itsection/profile'} 
                className={cn(
                  "h-11 rounded-xl px-3 transition-all",
                  pathname === '/dashboard/itsection/profile' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <UserCircle className={cn("h-4 w-4", pathname === '/dashboard/itsection/profile' ? "text-indigo-400" : "text-slate-400")} />
                <span className="font-black text-[11px] uppercase tracking-wider ml-1">My Security</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </div>

      </SidebarMenu>
    </SidebarContent>
  );
}