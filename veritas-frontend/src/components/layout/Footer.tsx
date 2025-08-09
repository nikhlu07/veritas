'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Mail, 
  Github, 
  Twitter, 
  Linkedin,
  ExternalLink,
  Heart,
  Zap,
  Lock,
  Globe
} from 'lucide-react';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { name: 'Submit Product', href: '/submit' },
      { name: 'Verify Product', href: '/verify' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Technology',
    links: [
      { name: 'Blockchain Security', href: '#blockchain' },
      { name: 'Hedera Network', href: 'https://hedera.com', external: true },
      { name: 'API Documentation', href: '#api-docs' },
      { name: 'Integration Guide', href: '#integration' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#about' },
      { name: 'Contact', href: '#contact' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', href: '#blog' },
      { name: 'Case Studies', href: '#case-studies' },
      { name: 'Help Center', href: '#help' },
      { name: 'Status Page', href: '#status' },
    ],
  },
];

const socialLinks = [
  {
    name: 'Twitter',
    href: '#',
    icon: Twitter,
    color: 'hover:text-blue-400',
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: Linkedin,
    color: 'hover:text-blue-600',
  },
  {
    name: 'GitHub',
    href: '#',
    icon: Github,
    color: 'hover:text-gray-900',
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-2.5 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Veritas
                </span>
                <span className="text-sm text-gray-500 -mt-1">
                  Blockchain Trust Platform
                </span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed max-w-md">
              Empowering trust through blockchain verification. 
              Authenticate products, verify claims, and build consumer confidence 
              with immutable proof of authenticity.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <Lock className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Fast</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span>Global</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Follow us:</span>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className={`p-2 rounded-lg bg-white border border-gray-200 text-gray-600 ${social.color} hover:shadow-md transition-all duration-300 hover:scale-110`}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      {...(link.external && { 
                        target: '_blank', 
                        rel: 'noopener noreferrer' 
                      })}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.name}
                      </span>
                      {link.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-white/90 mb-6">
                Get the latest updates on blockchain verification, new features, and industry insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white/95 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500"
                  />
                </div>
                <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap">
                  <Mail className="w-4 h-4" />
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-white/70 mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>© {currentYear} Veritas.</span>
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for a more transparent world.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="#privacy" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="#terms" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="#cookies" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cookies
              </Link>
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-3 h-3" />
                <span>Secured by Hedera</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}