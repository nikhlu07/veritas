'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle,
  Star,
  Sparkles,
  Trophy,
  Zap,
  Heart,
  Target
} from 'lucide-react';
import { DEMO_VERIFICATION_RESULTS } from '@/data/demoData';

interface DemoShowcaseProps {
  className?: string;
  onComplete?: () => void;
}

export default function DemoShowcase({ className = '', onComplete }: DemoShowcaseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const demoSteps = [
    {
      title: "Welcome to Veritas! 🎉",
      description: "Experience the future of product authenticity verification",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      action: "Let's start the journey"
    },
    {
      title: "Submit Your Product 📝",
      description: "Easy form with real-time validation and smart suggestions",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      action: "Fill out product details"
    },
    {
      title: "Blockchain Magic ✨",
      description: "Your product is being recorded on Hedera blockchain",
      icon: Zap,
      color: "from-green-500 to-teal-500",
      action: "Processing on blockchain"
    },
    {
      title: "QR Code Generated 📱",
      description: "Production-ready QR code for your product packaging",
      icon: CheckCircle,
      color: "from-emerald-500 to-green-500",
      action: "Download & print QR code"
    },
    {
      title: "Perfect Verification 🏆",
      description: "Customers can instantly verify authenticity",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      action: "View verification results"
    },
    {
      title: "Demo Complete! 💝",
      description: "You've experienced the complete Veritas journey",
      icon: Heart,
      color: "from-pink-500 to-red-500",
      action: "Start using Veritas"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          setIsPlaying(false);
          setIsComplete(true);
          setShowCelebration(true);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, demoSteps.length, onComplete]);

  const currentStepData = demoSteps[currentStep];
  const Icon = currentStepData?.icon || Star;

  const handlePlay = () => {
    if (isComplete) {
      setCurrentStep(0);
      setIsComplete(false);
      setShowCelebration(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
    setShowCelebration(false);
  };

  const handleSkipToEnd = () => {
    setCurrentStep(demoSteps.length - 1);
    setIsPlaying(false);
    setIsComplete(true);
    setShowCelebration(true);
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center z-50 ${className}`}>
      <div className="max-w-2xl w-full mx-4">
        {/* Main showcase card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-br opacity-5" 
               style={{ background: `linear-gradient(135deg, ${currentStepData?.color || 'from-purple-500 to-pink-500'})` }}>
          </div>
          
          {/* Celebration confetti */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-3 h-3 bg-gradient-to-r ${currentStepData?.color} rounded-full animate-bounce`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Demo Progress
              </span>
              <span className="text-sm font-medium text-gray-600">
                {currentStep + 1} / {demoSteps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentStepData?.color} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="text-center mb-8">
            {/* Icon with animation */}
            <div className={`inline-flex p-6 rounded-full bg-gradient-to-br ${currentStepData?.color} mb-6 ${isPlaying ? 'animate-pulse' : ''} ${showCelebration ? 'animate-bounce' : ''}`}>
              <Icon className="w-12 h-12 text-white" />
            </div>

            {/* Title and description */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
              {currentStepData?.title}
            </h2>
            <p className="text-xl text-gray-600 mb-8 animate-slide-up">
              {currentStepData?.description}
            </p>

            {/* Step-specific content */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-gray-800">Ready to experience:</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Instant submission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Blockchain security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>QR code generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Perfect verification</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="text-left">
                    <div className="font-medium text-gray-700 mb-2">Demo Form Fields:</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Product Name:</span>
                        <span className="text-blue-600">Organic Ethiopian Coffee</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supplier:</span>
                        <span className="text-blue-600">Highland Coffee Co-op</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Claims:</span>
                        <span className="text-green-600">3 verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700">Recording on Hedera blockchain...</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Immutable • Transparent • Secure
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-24 h-24 bg-gray-900 mx-auto rounded-lg flex items-center justify-center">
                      <div className="text-white text-xs">QR CODE</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    High-resolution • Print-ready • Mobile-optimized
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">98</div>
                      <div className="text-xs text-gray-600">Trust Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">3/3</div>
                      <div className="text-xs text-gray-600">Claims Verified</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">100%</div>
                      <div className="text-xs text-gray-600">Blockchain Proof</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-gray-800">🎉 Congratulations!</div>
                  <div className="text-sm text-gray-600">
                    You've just experienced the complete Veritas journey from product submission to verification.
                    Your customers can now trust your products with blockchain-verified authenticity.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePlay}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : isComplete
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Demo
                </>
              ) : isComplete ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Restart Demo
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Demo
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <button
              onClick={handleSkipToEnd}
              className="flex items-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
            >
              <FastForward className="w-4 h-4" />
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}