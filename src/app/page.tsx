'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkRedirect = async () => {
      // 1. Check session status
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 2. Authenticated: Route to Dashboard
        router.replace('/dashboard');
      } else {
        // 3. Unauthenticated: Route to Login
        router.replace('/login');
      }
    };

    checkRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#020617]">
      {/* Decorative background blur for premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px]" />
      
      <div className="flex flex-col items-center gap-6 relative z-10">
        {/* Branding Logo/Icon */}
        <div className="bg-slate-900 p-4 rounded-[2rem] border border-slate-800 shadow-2xl animate-pulse">
          <ShieldCheck className="h-8 w-8 text-indigo-500" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
              Authenticating Portal
            </p>
          </div>
          
          {/* Main Title */}
          <div className="mt-2">
            <h1 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-80">
              MHPISSJ <span className="text-indigo-500">Workspace</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10">
        <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">
          Version 3.0 • Secure Access
        </p>
      </div>
    </div>
  );
}