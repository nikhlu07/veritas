import React from "react";
import { Card, CardContent } from "../ui/card";
import { AlertTriangle, Shield } from "lucide-react";

export const ProblemSection = (): JSX.Element => {
  return (
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
          <Card className="relative overflow-hidden border-2 border-red-200 bg-white">
            <CardContent className="p-8">
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
            </CardContent>
          </Card>

          {/* Veritas Verified Product */}
          <Card className="relative overflow-hidden border-2 border-emerald-200 bg-white shadow-lg">
            <CardContent className="p-8">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};