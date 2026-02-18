"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export default function AutomationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase.from('automation_rules').select('*').order('priority', { ascending: false }).limit(100);
      if (error) console.error(error);
      else if (mounted) setRules(data || []);
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-4">Base44 — Automation Rules</h1>
      <div className="space-y-3">
        {rules.map(r => (
          <div key={r.id} className="p-3 border rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{r.name}</div>
                <div className="text-sm text-slate-500">{r.description}</div>
              </div>
              <div className="text-xs font-black uppercase text-slate-400">{r.trigger_type} → {r.action_type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
