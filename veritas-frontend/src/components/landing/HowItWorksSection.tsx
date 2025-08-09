import React from "react";
import { Card, CardContent } from "../ui/card";
import { Upload, Database, Search } from "lucide-react";

export const HowItWorksSection = (): JSX.Element => {
  const steps = [
    {
      number: 1,
      icon: <Upload className="w-8 h-8 text-emerald-500" />,
      title: "Submit the Claim",
      description: "A brand or supplier logs a claim about their product's sustainability credentials"
    },
    {
      number: 2,
      icon: <Database className="w-8 h-8 text-emerald-500" />,
      title: "Record on Hedera",
      description: "The claim is permanently recorded on the Hedera Consensus Service with cryptographic proof"
    },
    {
      number: 3,
      icon: <Search className="w-8 h-8 text-emerald-500" />,
      title: "Verify the Proof",
      description: "Anyone can scan a QR code or enter a batch ID to see the undeniable, on-chain proof"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Three simple steps to create immutable proof of your sustainability claims
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-emerald-600">{step.number}</span>
                  </div>
                  <div className="flex justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-emerald-300"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-emerald-300 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};