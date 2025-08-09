'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Menu, 
  X, 
  Search, 
  Upload,
  CheckCircle,
  Zap
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    description: 'Welcome to Veritas'
  },
  {
    name: 'Submit Product',
    href: '/submit',
    icon: Upload,
    description: 'Register your product on blockchain'
  },
  {
    name: 'Verify Product',
    href: '/verify',
    icon: Search,
    description: 'Check product authenticity'
  }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActivePage = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50' 
          : 'bg-white/80 backdrop-blur-sm shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              <Image 
                src="/logo.svg" 
                alt="Veritas Logo" 
                width={48} 
                height={48} 
                className="w-12 h-12" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Veritas
              </span>
              <span className="text-xs text-gray-500 -mt-1">
                Blockchain Trust
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = isActivePage(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-green-600 to-blue-600 shadow-lg'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>
                  )}
                  
                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </Link>
              );
            })}

            {/* CTA Button */}
            <div className="ml-6 pl-6 border-l border-gray-300">
              <Link
                href="/submit"
                className="veritas-button veritas-button--primary veritas-button--sm group"
              >
                <CheckCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>Get Verified</span>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-screen opacity-100 translate-y-0' 
            : 'max-h-0 opacity-0 -translate-y-4 overflow-hidden'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 bg-white/95 backdrop-blur-lg border-t border-gray-200/50">
          {navigation.map((item) => {
            const isActive = isActivePage(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-green-600 to-blue-600 shadow-lg'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={`p-1.5 rounded-lg ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  {Icon ? (
                    <Icon className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className={`text-xs mt-0.5 ${
                      isActive ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  )}
                </div>
                
                {isActive && (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </Link>
            );
          })}

          {/* Mobile CTA */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link
              href="/submit"
              className="veritas-button veritas-button--primary w-full justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Get Your Product Verified</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}