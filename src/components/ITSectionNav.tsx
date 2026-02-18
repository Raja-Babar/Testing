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
  CalendarCheck,
  ScanLine,
  FileSignature,
  ClipboardCheck,
  UserCircle,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sirf IT Section ke items
const itScanningItems = [
  { href: '/dashboard/itsection/global-library', icon: ScanLine, label: 'Digitization Progress' },
  { href: '/dashboard/itsection/employee-reports', icon: FileSignature, label: 'Digitization Report' },
  { href: '/dashboard/itsection/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/dashboard/itsection/my-tasks', icon: ClipboardCheck, label: 'Employee Task Record' },
];

export function ITSectionNav() {
  const pathname = usePathname();

  return (
    <SidebarContent className="p-4 bg-white">
      <SidebarMenu className="flex flex-col gap-y-1.5">
        
        {/* --- Section Label --- */}
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">Main Terminal</p>

        {/* --- Dashboard Home --- */}
        <SidebarMenuItem>
          <Link href="/dashboard" className="w-full">
            <SidebarMenuButton 
              isActive={pathname === '/dashboard'} 
              tooltip="Dashboard Overview"
              className={cn(
                "h-11 rounded-xl px-3 transition-all duration-200 group",
                pathname === '/dashboard' 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200 hover:bg-slate-800" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <LayoutDashboard className={cn("h-4 w-4 shrink-0", pathname === '/dashboard' ? "text-indigo-400" : "group-hover:text-slate-900")} />
              <span className="font-black text-[11px] uppercase tracking-wider ml-1">Dashboard</span>
              {pathname === '/dashboard' && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* --- Work Menu Section --- */}
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mt-6 mb-2">Operations</p>
        
        {itScanningItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton
                  isActive={isActive}
                  className={cn(
                    "h-11 rounded-xl px-3 transition-all duration-200 group",
                    isActive 
                      ? "bg-slate-900 text-white shadow-md shadow-slate-200 hover:bg-slate-800" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-400" : "group-hover:text-slate-900")} />
                  <span className="font-black text-[11px] uppercase tracking-wider ml-1">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}

        {/* --- Account Section --- */}
        <div className="mt-8 pt-4 border-t border-slate-100">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">User Preference</p>
          <SidebarMenuItem>
            <Link href="/dashboard/itsection/profile" className="w-full">
              <SidebarMenuButton 
                isActive={pathname === '/dashboard/itsection/profile'} 
                className={cn(
                  "h-11 rounded-xl px-3 transition-all duration-200 group",
                  pathname === '/dashboard/itsection/profile' 
                    ? "bg-slate-900 text-white shadow-md hover:bg-slate-800" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <UserCircle className={cn("h-4 w-4 shrink-0", pathname === '/dashboard/itsection/profile' ? "text-indigo-400" : "group-hover:text-slate-900")} />
                <span className="font-black text-[11px] uppercase tracking-wider ml-1">Account Security</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </div>

      </SidebarMenu>
    </SidebarContent>
  );
}