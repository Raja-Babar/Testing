'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { ITSectionNav } from '@/components/ITSectionNav'; 
import { UserNav } from '@/components/user-nav';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, appLogo } = useAuth();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setInitialCheckDone(true);
      if (!user) {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  // --- LOADING SCREEN ---
  if (isLoading && !initialCheckDone && !user) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
             <ShieldCheck className="h-10 w-10 text-indigo-500 animate-pulse" />
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 animate-spin text-indigo-400" />
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white italic">MHPISSJ Portal</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
            Verifying System Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user && initialCheckDone) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r border-slate-200">
        <div className="flex h-full flex-col bg-white">
          
          {/* --- BRANDING HEADER --- */}
          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-6">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border-2 border-slate-900 shadow-sm bg-slate-900">
              <Image 
                src={appLogo || "/logo.png"} 
                alt="Logo" 
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">
                MHPISSJ
              </span>
              <span className="text-[9px] font-bold uppercase tracking-tighter text-indigo-600 italic">
                Internal Hub
              </span>
            </div>
          </div>

          {/* --- DYNAMIC NAVIGATION AREA --- */}
          <div className="flex-1 overflow-y-auto py-2">
            {/* Logic: Role-Based Navigation Rendering */}
            {user?.role === 'Admin' && <DashboardNav />}
            
            {user?.role === 'I.T & Scanning-Employee' && <ITSectionNav />}
            
            {/* Library Employee ke liye bhi check add kiya hai */}
            {user?.role === 'Library-Employee' && <DashboardNav />}
          </div>

          {/* --- FOOTER VERSION --- */}
          <div className="p-4 border-t border-slate-50">
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Core System Online</span>
            </div>
          </div>
        </div>
      </Sidebar>

      <SidebarInset className="flex flex-col bg-slate-50/40">
        {/* --- TOP BAR --- */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 md:px-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-slate-100 text-slate-600 transition-all border border-slate-100" />
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden md:block italic">
              Terminal / {user?.role.split('-')[0]}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        
        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}