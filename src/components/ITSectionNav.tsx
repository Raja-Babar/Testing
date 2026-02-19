'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Book, ClipboardList, Clock, Home, ListChecks, UserCircle } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/books', icon: Book, label: 'Books' },
  { href: '/dashboard/itsection/my-tasks', icon: ListChecks, label: 'My Tasks' },
  { href: '/dashboard/itsection/employee-reports', icon: ClipboardList, label: 'Reports' },
  { href: '/dashboard/itsection/attendance', icon: Clock, label: 'Attendance' },
  { href: '/dashboard/itsection/profile', icon: UserCircle, label: 'Profile' },
];

export function ITSectionNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="gap-1">
      {navItems.map((item) => {
        // Precise matching: active if exact match OR if it's a sub-route of a specific section
        const isActive = item.href === '/dashboard' 
          ? pathname === '/dashboard' 
          : pathname.startsWith(item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton 
              asChild 
              isActive={isActive}
              tooltip={item.label}
              className={`
                transition-all duration-200 
                ${isActive 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white shadow-md' 
                  : 'hover:bg-slate-100 text-slate-600'}
              `}
            >
              <Link href={item.href} className="flex items-center gap-3">
                <item.icon className={`size-4 ${isActive ? 'text-indigo-400' : ''}`} />
                <span className="font-bold text-[11px] uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}