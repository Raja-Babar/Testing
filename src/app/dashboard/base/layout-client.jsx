'use client';

import { AuthProvider } from '@/context/auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Ek instance create karein jo re-renders par reset na ho
const queryClient = new QueryClient();

export function RootLayoutClient({ children }) {
  // Agar aap Sidebar ya Nav use kar rahe hain to LayoutComponent yahan define karein
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
          <div className="flex min-h-screen">
            {/* Aapka Sidebar yahan aayega */}
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
          </div>
      </QueryClientProvider>
    </AuthProvider>
  );
}