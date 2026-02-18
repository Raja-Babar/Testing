import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-provider';

export const metadata: Metadata = {
  title: 'MHPISSJ Portal | M.H. Panhwar Institute',
  description: 'Internal Operations & Digitization Management System',
  icons: {
    icon: '/logo.png',
  },
};

// Mobile responsiveness aur theme color fix karne ke liye
export const viewport: Viewport = {
  themeColor: '#4f46e5', // Indigo-600
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Poppins for English & MB Lateefi for Sindhi/Urdu contexts */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/mb-lateefi" rel="stylesheet" />
      </head>
      <body 
        className="antialiased min-h-screen bg-background text-foreground selection:bg-indigo-600 selection:text-white"
        style={{ fontFamily: "'Poppins', sans-serif" }} 
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}