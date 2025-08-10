'use client';

import Link from 'next/link';
import { Shield, CheckCircle, QrCode, Zap, Users, Globe, ArrowRight, Leaf, Award, Lock } from 'lucide-react';

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
        
        {/* Main nav */}
        <div className="bg-white/90 backdrop-blur-lg border-b border-slate-200/30 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <img
                  src="/logo.svg"
                  alt="Veritas Logo"
                  className="w-12 h-12"
                />
                <span className="text-xl font-semibold text-slate-900">Veritas</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors relative group"
                >
                  How It Works
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-200"></span>
                </button>
                <button
                  onClick={() => scrollToSection('use-cases')}
                  className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors relative group"
                >
                  Use Cases
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-200"></span>
                </button>
                <Link
                  href="/verify"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 text-sm rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  Launch App
                </Link>
              </div>
              <div className="md:hidden">
                <Link
                  href="/verify"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 text-sm rounded-xl transition-colors font-medium shadow-md"
                >
                  Launch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-8xl mx-auto w-full">
          {/* Massive Hero Card */}
          <div className="relative glass-enhanced rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/50 overflow-hidden mx-2 lg:mx-4 animate-glow-pulse">
            
            {/* Epic background effects */}
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-emerald-300/30 via-teal-300/20 to-cyan-300/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-violet-300/25 via-purple-300/20 to-pink-300/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-200/15 via-indigo-200/10 to-purple-200/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="relative grid lg:grid-cols-2 gap-16 p-12 lg:p-20 xl:p-24">
              
              {/* Epic Content */}
              <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
                
                {/* Status Badge */}
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-100/80 to-teal-100/80 rounded-full border border-emerald-200/60 shadow-lg backdrop-blur-sm w-fit mx-auto lg:mx-0">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-space font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    🚀 Live on Hedera Blockchain
                  </span>
                </div>

                {/* Epic Headline */}
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-5xl xl:text-6xl font-space font-bold text-slate-900 leading-tight tracking-tight">
                    Verify Product
                  </h1>
                  <h1 className="text-3xl lg:text-5xl xl:text-6xl font-space font-bold leading-tight tracking-tight animate-text-shimmer">
                    Claims Instantly
                  </h1>
                </div>

                {/* Epic Description */}
                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-outfit">
                  Bridge the trust gap with blockchain-verified product authenticity. 
                  Every claim is <span className="font-semibold text-emerald-600">immutable</span>, 
                  <span className="font-semibold text-blue-600"> transparent</span>, and 
                  <span className="font-semibold text-purple-600"> instantly verifiable</span>.
                </p>

                {/* Epic Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 pt-8 justify-center lg:justify-start">
                  <Link
                    href="/demo"
                    className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-base font-space font-semibold rounded-xl transition-all duration-300 hover:scale-105 text-center shadow-lg hover:shadow-emerald-500/25"
                  >
                    <span className="relative z-10">🎯 View Live Demo</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <Link
                    href="/verify/COFFEE-2024-1001"
                    className="group relative border-2 border-slate-300 hover:border-emerald-500 bg-white/80 backdrop-blur-sm text-slate-700 hover:text-emerald-600 px-8 py-4 text-base font-space font-semibold rounded-xl transition-all duration-300 hover:scale-105 text-center shadow-lg hover:shadow-xl"
                  >
                    <span className="relative z-10">🔍 Try Verification</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center lg:justify-start gap-6 pt-6">
                  <div className="text-center">
                    <div className="text-xl font-space font-bold text-slate-900">1,247+</div>
                    <div className="text-xs text-slate-600 font-outfit">Products Verified</div>
                  </div>
                  <div className="w-px h-8 bg-slate-300"></div>
                  <div className="text-center">
                    <div className="text-xl font-space font-bold text-emerald-600">98.5%</div>
                    <div className="text-xs text-slate-600 font-outfit">Trust Score</div>
                  </div>
                  <div className="w-px h-8 bg-slate-300"></div>
                  <div className="text-center">
                    <div className="text-xl font-space font-bold text-blue-600">24/7</div>
                    <div className="text-xs text-slate-600 font-outfit">Verification</div>
                  </div>
                </div>
              </div>

              {/* Modern Phone Mockup */}
              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative w-80 h-[600px]">
                  
                  {/* Background Effects */}
                  <div className="absolute inset-0">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-emerald-300/40 to-teal-300/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-tr from-violet-300/35 to-purple-300/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  {/* Phone Frame */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative group hover:scale-105 transition-all duration-500">
                      
                      {/* Shadow */}
                      <div className="absolute inset-0 bg-black/20 rounded-[3rem] blur-2xl transform translate-y-4 translate-x-2 scale-105"></div>
                      
                      {/* Phone */}
                      <div className="relative w-72 h-[580px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-2 shadow-2xl">
                        
                        {/* Screen */}
                        <div className="w-full h-full bg-gradient-to-br from-white to-emerald-50/30 rounded-[2.5rem] overflow-hidden relative">
                          
                          {/* Dynamic Island */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full"></div>
                          
                          {/* Status Bar */}
                          <div className="h-16 flex items-center justify-between px-6 pt-8 text-slate-900 font-space">
                            <span className="font-bold">9:41</span>
                            <div className="flex items-center gap-2">
                              <span>📶</span>
                              <span>🔋</span>
                            </div>
                          </div>
                          
                          {/* App Header */}
                          <div className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-sm font-bold">V</span>
                              </div>
                              <h3 className="text-lg font-space font-bold text-slate-900">Veritas</h3>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-6 space-y-4">
                            
                            {/* Product Card */}
                            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-emerald-100">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                  <span className="text-white text-xl">☕</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-space font-bold text-slate-900 text-sm">Organic Coffee</h4>
                                  <p className="text-xs text-slate-500">COFFEE-2024-1001</p>
                                </div>
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-600">Status</span>
                                  <span className="font-bold text-emerald-600">VERIFIED</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                  <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full w-[98%]"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Claims */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm text-slate-700">100% Organic</span>
                                <span className="ml-auto text-emerald-600 text-xs">✓</span>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-slate-700">Fair Trade</span>
                                <span className="ml-auto text-blue-600 text-xs">✓</span>
                              </div>
                            </div>
                            
                            {/* Scan Button */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-3 rounded-xl font-space font-bold text-sm">
                              🔍 Scan New Product
                            </div>
                            
                          </div>
                          
                          {/* Home Indicator */}
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Gap Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-light text-slate-900 mb-4">
              The Trust Gap in 
              <span className="font-medium text-emerald-600"> Sustainability</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed">
              Consumers struggle to verify sustainability claims, leading to widespread 
              greenwashing and broken trust between brands and buyers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Problem */}
            <div className="relative bg-white/70 backdrop-blur-sm border border-red-100 rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100/30 to-orange-100/30 rounded-full blur-xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl mx-auto shadow-lg bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-2xl">❓</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900">Unverified Claims</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Without verification, sustainability claims are just marketing promises 
                  that consumers can't trust or validate.
                </p>
              </div>
            </div>

            {/* Solution */}
            <div className="relative bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl mx-auto shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900">Blockchain Verified</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every claim is immutably recorded on Hedera, creating transparent, 
                  verifiable proof that builds genuine trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-light text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed">
              Three simple steps to create transparent, verifiable trust between brands and consumers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-3xl">📄</span>
                </div>
                {/* Flow arrow */}
                <div className="hidden md:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-300 to-blue-300"></div>
                <div className="hidden md:block absolute top-10 -right-2 w-0 h-0 border-l-4 border-l-blue-300 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-3">Submit Claims</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Brands submit product information and sustainability claims with supporting evidence.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-3xl">⛓️</span>
                </div>
                {/* Flow arrow */}
                <div className="hidden md:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300"></div>
                <div className="hidden md:block absolute top-10 -right-2 w-0 h-0 border-l-4 border-l-purple-300 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-3">Blockchain Recording</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Claims are immutably recorded on Hedera, creating transparent, unalterable proof.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <span className="text-white text-3xl">📱</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-3">Instant Verification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Consumers scan QR codes to instantly verify product authenticity and claims.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] text-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* White header section */}
          <div className="text-center mb-16 bg-white rounded-3xl p-12 shadow-lg border border-slate-100 mx-4 lg:mx-8">
            <h2 className="text-2xl lg:text-3xl font-light text-slate-900 mb-4">
              Perfect for Every Industry
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed">
              From fashion to food, Veritas helps brands build authentic trust 
              and empowers consumers to make informed choices.
            </p>
          </div>

          {/* Greenish background container for cards */}
          <div className="bg-gradient-to-br from-emerald-50/30 to-green-50/20 rounded-3xl p-10 lg:p-12 border border-emerald-100/20 mx-4 lg:mx-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Fashion */}
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-pink-100/20 to-rose-100/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative">
                  {/* Fashion product image */}
                  <div className="w-16 h-16 rounded-xl mb-4 shadow-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <span className="text-white text-2xl">👕</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Fashion & Apparel</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Verify ethical labor, sustainable materials, and fair trade certifications.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                      Organic cotton verification
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                      Fair labor practices
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                      Recycled materials
                    </div>
                  </div>
                </div>
              </div>

              {/* Food */}
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-green-100/20 to-emerald-100/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative">
                  {/* Food product image */}
                  <div className="w-16 h-16 rounded-xl mb-4 shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-white text-2xl">🍎</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Food & Beverage</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Authenticate organic certifications, origin tracking, and quality standards.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Organic certification
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Farm-to-table tracking
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Quality assurance
                    </div>
                  </div>
                </div>
              </div>

              {/* Electronics */}
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-100/20 to-cyan-100/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative">
                  {/* Electronics product image */}
                  <div className="w-16 h-16 rounded-xl mb-4 shadow-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-white text-2xl">📱</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Electronics</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Verify conflict-free minerals, energy efficiency, and recycling programs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Conflict-free minerals
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Energy efficiency
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      E-waste programs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl border border-emerald-100 p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-light text-slate-900 mb-4">
              Ready to Build 
              <span className="font-medium text-emerald-600"> Authentic Trust</span>?
            </h2>
            <p className="text-base text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the transparency revolution. Start verifying your products today 
              and give your customers the confidence they deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] text-sm"
              >
                Submit Product
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/verify"
                className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm"
              >
                Try Verification
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}