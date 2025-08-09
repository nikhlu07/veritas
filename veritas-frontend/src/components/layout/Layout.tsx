'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function Layout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  className = ''
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {showHeader && <Header />}
      
      <main className={`flex-1 ${showHeader ? 'pt-16' : ''} ${className}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

// Page wrapper for consistent spacing
export function PageWrapper({ 
  children, 
  className = '',
  maxWidth = 'max-w-7xl'
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
}

// Section wrapper for content blocks
export function Section({ 
  children, 
  className = '',
  background = 'transparent'
}: {
  children: React.ReactNode;
  className?: string;
  background?: 'transparent' | 'white' | 'gray' | 'gradient';
}) {
  const bgClasses = {
    transparent: '',
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-r from-green-50 to-blue-50'
  };

  return (
    <section className={`py-12 lg:py-16 ${bgClasses[background]} ${className}`}>
      {children}
    </section>
  );
}