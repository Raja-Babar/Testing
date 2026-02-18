'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User as UserIcon, Shield, Settings, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function UserNav() {
  const { user, logout } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

  // Enhanced Theme Logic
  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'Admin': return { variant: 'destructive', ring: 'ring-red-500/50', bg: 'bg-red-500' };
      case 'I.T & Scanning-Employee': return { variant: 'secondary', ring: 'ring-indigo-500/50', bg: 'bg-indigo-600' };
      case 'Library-Employee': return { variant: 'default', ring: 'ring-emerald-500/50', bg: 'bg-emerald-600' };
      default: return { variant: 'outline', ring: 'ring-slate-300', bg: 'bg-slate-500' };
    }
  };

  const theme = getRoleTheme(user.role);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-14 px-3 flex items-center gap-3 hover:bg-slate-50 rounded-[1.25rem] transition-all border border-transparent hover:border-slate-200 shadow-none">
            <div className="hidden md:flex flex-col items-end gap-0.5">
              <p className="text-[11px] font-black leading-none text-slate-800 uppercase tracking-tighter">{user.name}</p>
              <p className="text-[9px] font-bold leading-none text-indigo-600 uppercase italic tracking-widest opacity-80">
                {user.role}
              </p>
            </div>
            
            <div className={cn("rounded-full p-0.5 ring-2 ring-offset-2 transition-all duration-300", theme.ring)}>
              <Avatar className="h-8 w-8 border border-white">
                <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                <AvatarFallback className="font-black text-[10px] bg-slate-900 text-white">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-72 p-2 rounded-[1.5rem] shadow-2xl border-slate-200 bg-white" align="end" sideOffset={8}>
          <DropdownMenuLabel className="p-4 bg-slate-50/50 rounded-2xl mb-1">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black text-slate-900 leading-none uppercase tracking-tight">{user.name}</p>
                  <p className="text-[10px] font-medium leading-none text-slate-400 font-mono mt-1">
                  {user.email}
                  </p>
              </div>
              <Badge className={cn("w-fit text-[9px] px-2 py-0.5 font-black uppercase tracking-widest border-none text-white", theme.bg)}>
                <Shield className="h-2.5 w-2.5 mr-1 text-white/80" /> {user.role}
              </Badge>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-2 bg-slate-100" />
          
          <DropdownMenuGroup className="p-1">
            <DropdownMenuItem 
              onSelect={() => setIsProfileDialogOpen(true)} 
              className="rounded-xl cursor-pointer py-2.5 px-3 focus:bg-slate-50 group"
            >
              <div className="bg-slate-100 p-1.5 rounded-lg mr-3 group-focus:bg-white transition-colors">
                <UserIcon className="h-3.5 w-3.5 text-slate-600" />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-700">Quick Edit</span>
            </DropdownMenuItem>
            
            <Link href="/dashboard/itsection/profile">
              <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3 focus:bg-slate-50 group">
                <div className="bg-slate-100 p-1.5 rounded-lg mr-3 group-focus:bg-white transition-colors">
                  <Settings className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-slate-700">Account Security</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="mx-2 bg-slate-100" />
          
          <DropdownMenuItem 
            onClick={logout} 
            className="rounded-xl cursor-pointer py-3 px-3 mt-1 text-red-600 focus:bg-red-50 focus:text-red-700 group transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-black uppercase text-[10px] tracking-[0.2em]">Terminate Session</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- Dialog Component for Quick Edit (Keep your existing Dialog logic here) --- */}
    </>
  );
}