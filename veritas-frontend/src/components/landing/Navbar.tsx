import React from "react";
import { Button } from "../ui/button";

export const Navbar = (): JSX.Element => {
  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Use Cases", href: "#use-cases" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.svg" 
              alt="Veritas Logo" 
              className="w-8 h-8"
              style={{ width: "32px", height: "32px" }}
            />
            <span className="text-xl font-bold text-slate-900">Veritas</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
              Launch App
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 text-sm">
              Launch App
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};