import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { RootLayoutClient } from './layout-client';
import '@/app/globals.css'

export const metadata = {
  title: 'Base44 APP',
  description: 'Book Digitization Management System',
  icons: {
    icon: 'https://base44.com/logo_v2.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <Toaster />
      </body>
    </html>
  );
}
