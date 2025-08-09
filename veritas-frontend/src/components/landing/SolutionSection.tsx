import React from "react";
import { Card, CardContent } from "../ui/card";
import { Zap, DollarSign, Leaf } from "lucide-react";

export const SolutionSection = (): JSX.Element => {
  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
      title: "Low Fees",
      description: "Minimal transaction costs make verification accessible for all businesses"
    },
    {
      icon: <Zap className="w-8 h-8 text-emerald-500" />,
      title: "Lightning Fast",
      description: "Near-instant verification with Hedera's high-throughput consensus"
    },
    {
      icon: <Leaf className="w-8 h-8 text-emerald-500" />,
      title: "Energy Efficient",
      description: "Carbon-negative network perfect for sustainability-focused projects"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Our Solution: Truth on the 
            <span className="block text-emerald-600">Ledger</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-12">
            Veritas leverages the Hedera network to create an immutable record of product 
            claims. Every verification is permanent, transparent, and impossible to fake.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Powered by Hedera Hashgraph
          </h3>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            The Hedera network provides the perfect foundation for sustainability projects 
            with its energy-efficient consensus, low fees, and enterprise-grade security. 
            Built for the future of transparent commerce.
          </p>
        </div>
      </div>
    </section>
  );
};