'use client';

import Link from 'next/link';
import { Shield, AlertTriangle, CheckCircle, QrCode, Zap, Users, Globe, ArrowRight } from 'lucide-react';

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="Veritas Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-slate-900">Veritas</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('use-cases')}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Use Cases
              </button>
              <Link 
                href="/verify"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded transition-colors"
              >
                Launch App
              </Link>
            </div>
            <div className="md:hidden">
              <Link 
                href="/verify"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm rounded transition-colors"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23334155%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Main container */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col lg:flex-row items-center gap-12">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Verify Any Product{" "}
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Claim Instantly
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed mx-auto lg:mx-0">
              Bridge the trust gap with Veritas, a blockchain-based product
              verification system. Leveraging the security of the Hedera network,
              we ensure every product claim is authentic and verifiable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
              >
                Submit a Claim
              </Link>
              <Link
                href="/verify"
                className="border-2 border-slate-400 text-slate-300 hover:text-white hover:border-white px-8 py-3 text-lg font-semibold rounded-lg bg-transparent backdrop-blur-sm transition-all duration-300 text-center"
              >
                Verify a Product
              </Link>
            </div>
          </div>

          {/* Network visualization */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-80 h-80 lg:w-[400px] lg:h-[400px]">
              {/* Subtle background glow */}
              <div className="absolute inset-12 bg-gradient-to-r from-blue-400/6 to-purple-400/6 rounded-full blur-3xl"></div>

              {/* Network SVG */}
              <svg
                className="w-full h-full relative z-10"
                viewBox="0 0 400 400"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Main circle */}
                <circle
                  cx="200"
                  cy="200"
                  r="160"
                  fill="none"
                  stroke="url(#gradient1)"
                  strokeWidth="1.5"
                  opacity="0.25"
                />

                {/* Inner circle */}
                <circle
                  cx="200"
                  cy="200"
                  r="110"
                  fill="none"
                  stroke="url(#gradient2)"
                  strokeWidth="1"
                  opacity="0.2"
                />

                {/* Subtle connection lines */}
                <g stroke="url(#gradient3)" strokeWidth="0.8" opacity="0.15">
                  <line x1="200" y1="50" x2="200" y2="350" />
                  <line x1="50" y1="200" x2="350" y2="200" />
                  <line x1="90" y1="90" x2="310" y2="310" />
                  <line x1="310" y1="90" x2="90" y2="310" />
                  <line x1="200" y1="90" x2="310" y2="200" />
                  <line x1="310" y1="200" x2="200" y2="310" />
                  <line x1="200" y1="310" x2="90" y2="200" />
                  <line x1="90" y1="200" x2="200" y2="90" />
                </g>

                {/* Network nodes */}
                <g>
                  <circle cx="200" cy="50" r="3" fill="#60a5fa" className="animate-pulse" />
                  <circle cx="350" cy="200" r="3" fill="#a78bfa" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <circle cx="200" cy="350" r="3" fill="#34d399" className="animate-pulse" style={{ animationDelay: '1s' }} />
                  <circle cx="50" cy="200" r="3" fill="#fbbf24" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                  <circle cx="310" cy="90" r="2.5" fill="#fb7185" className="animate-pulse" style={{ animationDelay: '0.25s' }} />
                  <circle cx="310" cy="310" r="2.5" fill="#06b6d4" className="animate-pulse" style={{ animationDelay: '0.75s' }} />
                  <circle cx="90" cy="310" r="2.5" fill="#8b5cf6" className="animate-pulse" style={{ animationDelay: '1.25s' }} />
                  <circle cx="90" cy="90" r="2.5" fill="#10b981" className="animate-pulse" style={{ animationDelay: '1.75s' }} />
                  <circle cx="200" cy="90" r="2.5" fill="#60a5fa" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <circle cx="310" cy="200" r="2.5" fill="#a78bfa" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <circle cx="200" cy="310" r="2.5" fill="#34d399" className="animate-pulse" style={{ animationDelay: '1.1s' }} />
                  <circle cx="90" cy="200" r="2.5" fill="#fbbf24" className="animate-pulse" style={{ animationDelay: '1.6s' }} />
                  <circle cx="200" cy="200" r="4" fill="#e879f9" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              The Trust Gap in 
              <span className="block text-emerald-600">Sustainability</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Consumers have no way to verify claims about ethical labor, recycled materials, 
              or organic sourcing. The result? Widespread greenwashing and broken trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Unverified Product */}
            <div className="relative overflow-hidden border-2 border-red-200 bg-white rounded-lg shadow-sm">
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                      <span className="text-slate-500 text-sm">Product Image</span>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12">
                      100% Organic
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="text-xl font-bold text-slate-900">Unverified Claim</h3>
                </div>
                <p className="text-slate-600 text-center">
                  Claims without verification are susceptible to fraud and misinformation. 
                  Consumers can't trust what they're buying.
                </p>
              </div>
            </div>

            {/* Veritas Verified Product */}
            <div className="relative overflow-hidden border-2 border-emerald-200 bg-white shadow-lg rounded-lg">
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-700 text-sm">Product Image</span>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Verified
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-500 mr-2" />
                  <h3 className="text-xl font-bold text-slate-900">Veritas Verified</h3>
                </div>
                <p className="text-slate-600 text-center">
                  Claims recorded on the Hedera blockchain are immutable and publicly 
                  verifiable. Trust through transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              How Veritas Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A simple three-step process that creates unbreakable trust between brands and consumers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">1. Submit Claims</h3>
              <p className="text-slate-600">
                Brands submit product information and sustainability claims to our platform, 
                providing evidence and documentation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Blockchain Recording</h3>
              <p className="text-slate-600">
                Claims are recorded on the Hedera blockchain, creating an immutable and 
                transparent record that cannot be altered.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Instant Verification</h3>
              <p className="text-slate-600">
                Consumers scan QR codes or search batch IDs to instantly verify 
                product authenticity and sustainability claims.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/submit"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Perfect for Every Industry
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From fashion to food, Veritas helps brands build trust and consumers make informed choices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Fashion */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fashion & Apparel</h3>
              <p className="text-slate-600 mb-4">
                Verify ethical labor practices, sustainable materials, and fair trade certifications.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Organic cotton verification</li>
                <li>• Fair labor certification</li>
                <li>• Recycled material content</li>
              </ul>
            </div>

            {/* Food */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Food & Beverage</h3>
              <p className="text-slate-600 mb-4">
                Authenticate organic certifications, origin tracking, and quality standards.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Organic certification</li>
                <li>• Farm-to-table tracking</li>
                <li>• Quality assurance</li>
              </ul>
            </div>

            {/* Electronics */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Electronics</h3>
              <p className="text-slate-600 mb-4">
                Verify conflict-free minerals, energy efficiency, and recycling programs.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Conflict-free minerals</li>
                <li>• Energy efficiency ratings</li>
                <li>• E-waste programs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Build Trust?
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join the transparency revolution. Start verifying your products today 
            and give your customers the confidence they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/submit"
              className="bg-white text-emerald-600 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Submit Your First Product
            </Link>
            <Link 
              href="/verify"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300"
            >
              Try Product Verification
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
