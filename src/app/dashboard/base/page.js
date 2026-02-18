'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard on mount
    router.push('/dashboard');
  }, [router]);

  return null; // This page will redirect
}
