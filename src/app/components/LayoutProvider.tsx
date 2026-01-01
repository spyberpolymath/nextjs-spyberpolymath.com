"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { clearInvalidToken } from '@/lib/tokenUtils';

interface LayoutProviderProps {
  children: React.ReactNode;
}

export default function LayoutProvider({ children }: LayoutProviderProps) {
  const pathname = usePathname() || '';

  // Check if current route is admin or admin-auth
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/admin-auth');

  // Clean up invalid tokens on app load
  useEffect(() => {
    clearInvalidToken();
  }, []);

  if (isAdminRoute) {
    // For admin routes, don't show navbar and footer
    return <>{children}</>;
  }

  // For all other routes, show navbar and footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
