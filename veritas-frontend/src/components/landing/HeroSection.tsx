"use client";

import { Button } from "../ui/button";

export const HeroSection = (): JSX.Element => {
  const scrollToUseCases = () => {
    const element = document.getElementById("use-cases");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
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
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Submit a Claim
            </Button>
            <Button
              variant="outline"
              onClick={scrollToUseCases}
              className="border-2 border-slate-400 text-slate-300 hover:text-white hover:border-white px-8 py-3 text-lg font-semibold rounded-lg bg-transparent backdrop-blur-sm transition-all duration-300"
            >
              Verify a Product
            </Button>
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
  );
};