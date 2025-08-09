"use client";

import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Shirt, Coffee, Smartphone } from "lucide-react";

export const UseCasesSection = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = [
    {
      icon: <Shirt className="w-8 h-8" />,
      title: "Ethical Fashion",
      description: "Verifying claims about recycled materials and fair factory wages",
      details: "Track the entire lifecycle of garments, from sustainable material sourcing to fair labor practices. Verify organic cotton certifications, recycled polyester content, and ethical manufacturing processes.",
      stats: ["95% reduction in greenwashing", "Verified supply chain transparency", "Fair wage certification"]
    },
    {
      icon: <Coffee className="w-8 h-8" />,
      title: "Organic Food",
      description: "Proving organic certifications for products like coffee or produce",
      details: "Ensure authentic organic certifications, track farm-to-table journeys, and verify sustainable farming practices. Perfect for coffee, produce, and packaged goods.",
      stats: ["100% organic verification", "Farm-to-table tracking", "Pesticide-free guarantee"]
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Sustainable Electronics",
      description: "Tracking conflict-free minerals and e-waste recycling",
      details: "Verify conflict-free mineral sourcing, track component recycling, and ensure responsible manufacturing. Critical for smartphones, laptops, and electronic devices.",
      stats: ["Conflict-free minerals", "E-waste recycling verified", "Carbon footprint tracking"]
    }
  ];

  return (
    <section id="use-cases" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Real-World Impact
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            See how Veritas is transforming industries and building trust in sustainable commerce
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col md:flex-row justify-center mb-12 space-y-4 md:space-y-0 md:space-x-4">
          {useCases.map((useCase, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === index
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={activeTab === index ? 'text-white' : 'text-emerald-500'}>
                {useCase.icon}
              </span>
              <span>{useCase.title}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-500">
                      {useCases[activeTab].icon}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">
                    {useCases[activeTab].title}
                  </h3>
                </div>
                <p className="text-lg text-slate-600 mb-8">
                  {useCases[activeTab].details}
                </p>
                <div className="space-y-3">
                  {useCases[activeTab].stats.map((stat, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-700 font-medium">{stat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-600 text-3xl">
                      {useCases[activeTab].icon}
                    </span>
                  </div>
                  <p className="text-slate-600">Interactive demo coming soon</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};