"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export default function ReportsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase.from('employee_reports').select('*').order('submitted_date', { ascending: false }).limit(50);
      if (error) console.error(error);
      else if (mounted) setReports(data || []);
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-4">Base44 — Employee Reports</h1>
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="p-3 border rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{r.employee_name || r.employee_id}</div>
                <div className="text-sm text-slate-500">{r.note}</div>
              </div>
              <div className="text-xs text-slate-400">{new Date(r.submitted_date).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
