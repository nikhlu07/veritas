/**
 * Demo Data for Perfect Veritas Experience
 * 
 * Contains realistic sample data for testing and demonstrations
 */

import type { CreateProductRequest, VerificationResponse } from '@/types';

// Demo Product Submissions - Ready-to-use examples
export const DEMO_PRODUCTS: CreateProductRequest[] = [
  {
    product_name: "Organic Ethiopian Single Origin Coffee",
    supplier_name: "Highland Coffee Cooperative",
    description: "Premium coffee beans grown at 2,000m altitude in the Ethiopian highlands using traditional farming methods passed down through generations.",
    claims: [
      {
        claim_type: "organic",
        description: "Certified organic by USDA and EU standards. Grown without synthetic pesticides, herbicides, or fertilizers. Soil health maintained through composting and crop rotation."
      },
      {
        claim_type: "fair-trade",
        description: "Direct trade partnership ensures farmers receive 15% above fair trade minimum price. Community development fund supports local schools and healthcare facilities."
      },
      {
        claim_type: "carbon-neutral",
        description: "Carbon footprint offset through reforestation projects in Ethiopia. Transportation emissions offset through verified carbon credit programs."
      }
    ]
  },
  {
    product_name: "Handcrafted Bamboo Yoga Mat",
    supplier_name: "EcoZen Wellness Co.",
    description: "Sustainable yoga mat made from organic bamboo fiber with natural rubber base. Designed for both comfort and environmental responsibility.",
    claims: [
      {
        claim_type: "sustainable",
        description: "Made from 100% renewable bamboo that regrows within 3 years. Natural rubber harvested using sustainable tapping methods that don't harm trees."
      },
      {
        claim_type: "cruelty-free",
        description: "No animal products or testing involved in production. All materials are plant-based and ethically sourced."
      },
      {
        claim_type: "recyclable",
        description: "Fully biodegradable components. Mat can be composted at end of life. Packaging made from recycled cardboard with soy-based inks."
      }
    ]
  },
  {
    product_name: "Wild Alaskan Sockeye Salmon",
    supplier_name: "Arctic Fisheries Collective",
    description: "Premium wild-caught sockeye salmon from pristine Alaskan waters. Flash-frozen within hours of catch to preserve freshness and nutrition.",
    claims: [
      {
        claim_type: "origin-verified",
        description: "Caught in Bristol Bay, Alaska using traditional fishing methods. GPS tracking and blockchain records verify exact catch location and time."
      },
      {
        claim_type: "sustainable",
        description: "MSC (Marine Stewardship Council) certified sustainable fishery. Quota-based fishing ensures healthy fish populations for future generations."
      },
      {
        claim_type: "quality-assured",
        description: "Third-party tested for mercury, PCBs, and other contaminants. Exceeds FDA and USDA safety standards. Cold chain maintained throughout processing."
      }
    ]
  },
  {
    product_name: "Heritage Tomato Heirloom Seeds",
    supplier_name: "Seed Savers Exchange",
    description: "Rare Cherokee Purple tomato seeds preserved from 1890s Cherokee heritage variety. Non-GMO, open-pollinated seeds with rich history and exceptional flavor.",
    claims: [
      {
        claim_type: "origin-verified",
        description: "Seeds traced back to original Cherokee Nation gardens from 1890s. Genetic testing confirms variety authenticity and absence of modern hybridization."
      },
      {
        claim_type: "organic",
        description: "Seeds grown on certified organic farms using traditional methods. No synthetic chemicals used in production or storage."
      },
      {
        claim_type: "local-sourced",
        description: "Grown by network of local farmers within 50 miles of processing facility. Supporting local agriculture and reducing transportation emissions."
      }
    ]
  }
];

// Sample verification results for demo
export const DEMO_VERIFICATION_RESULTS: { [key: string]: VerificationResponse['data'] } = {
  "VRT-2024-123456": {
    product: {
      id: 1,
      product_name: "Organic Ethiopian Single Origin Coffee",
      supplier_name: "Highland Coffee Cooperative",
      batch_id: "VRT-2024-123456",
      description: "Premium coffee beans grown at 2,000m altitude in the Ethiopian highlands using traditional farming methods passed down through generations.",
      created_at: "2024-01-15T10:30:00Z"
    },
    claims: [
      {
        id: 1,
        claim_type: "organic",
        description: "Certified organic by USDA and EU standards. Grown without synthetic pesticides, herbicides, or fertilizers. Soil health maintained through composting and crop rotation.",
        product_id: 1,
        hcs_transaction_id: "0.0.12345@1642248600.123456789",
        created_at: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        claim_type: "fair-trade",
        description: "Direct trade partnership ensures farmers receive 15% above fair trade minimum price. Community development fund supports local schools and healthcare facilities.",
        product_id: 1,
        hcs_transaction_id: "0.0.12345@1642248601.123456789",
        created_at: "2024-01-15T10:30:00Z"
      },
      {
        id: 3,
        claim_type: "carbon-neutral",
        description: "Carbon footprint offset through reforestation projects in Ethiopia. Transportation emissions offset through verified carbon credit programs.",
        product_id: 1,
        hcs_transaction_id: "0.0.12345@1642248602.123456789",
        created_at: "2024-01-15T10:30:00Z"
      }
    ],
    qr_code: {
      batchId: "VRT-2024-123456",
      verificationData: {
        verification_url: `${typeof window !== 'undefined' ? window.location.origin : 'https://veritas.example.com'}/verify/VRT-2024-123456`,
        batch_id: "VRT-2024-123456"
      }
    },
    summary: {
      total_claims: 3,
      verified_claims: 3,
      claim_types: ["organic", "fair-trade", "carbon-neutral"],
      has_hcs_data: true
    }
  }
};

// Demo scenarios for different states
export const DEMO_SCENARIOS = {
  SUCCESS: {
    name: "Perfect Success Flow",
    description: "All claims verified, QR code generated, blockchain records complete",
    data: DEMO_PRODUCTS[0]
  },
  PARTIAL_SUCCESS: {
    name: "Partial Verification",
    description: "Some claims verified, others pending blockchain confirmation",
    data: {
      ...DEMO_PRODUCTS[1],
      claims: DEMO_PRODUCTS[1].claims.slice(0, 2) // Only 2 claims
    }
  },
  NETWORK_RETRY: {
    name: "Network Recovery Demo",
    description: "Demonstrate retry logic and network error recovery",
    simulateNetworkIssue: true
  },
  MOBILE_OPTIMIZED: {
    name: "Mobile Experience",
    description: "Optimized for mobile demo with simplified inputs",
    data: {
      product_name: "Fresh Organic Apples",
      supplier_name: "Green Valley Farm",
      description: "Crisp, sweet apples grown organically in Washington state.",
      claims: [
        {
          claim_type: "organic",
          description: "USDA Certified Organic - grown without synthetic pesticides or fertilizers."
        }
      ]
    }
  }
};

// Realistic batch IDs for testing
export const DEMO_BATCH_IDS = [
  "VRT-2024-123456", // Full success
  "VRT-2024-789012", // Partial verification
  "VRT-2024-345678", // Recently submitted
  "VRT-2024-567890", // Different product type
];

// Form field suggestions for auto-complete demo
export const DEMO_SUGGESTIONS = {
  productNames: [
    "Organic Ethiopian Single Origin Coffee",
    "Handcrafted Bamboo Yoga Mat",
    "Wild Alaskan Sockeye Salmon",
    "Heritage Tomato Heirloom Seeds",
    "Fair Trade Dark Chocolate Bar",
    "Sustainable Cork Yoga Block",
    "Organic Cotton T-Shirt",
    "Recycled Plastic Water Bottle",
    "Local Honey from Wildflowers",
    "Artisan Sourdough Bread"
  ],
  supplierNames: [
    "Highland Coffee Cooperative",
    "EcoZen Wellness Co.",
    "Arctic Fisheries Collective",
    "Seed Savers Exchange",
    "Fair Trade Collective",
    "Green Valley Organic Farm",
    "Sustainable Textiles Inc.",
    "Ocean Plastic Solutions",
    "Wildflower Apiaries",
    "Heritage Bakehouse"
  ],
  claimDescriptions: {
    organic: [
      "Certified organic by USDA and EU standards. Grown without synthetic pesticides, herbicides, or fertilizers.",
      "USDA Certified Organic - grown without synthetic chemicals using sustainable farming practices.",
      "Organic certification verified through third-party audits and soil testing."
    ],
    "fair-trade": [
      "Direct trade partnership ensures farmers receive fair wages above market rate.",
      "Fair Trade Certified - supporting farmer communities and sustainable practices.",
      "Fair trade premiums invested in community development projects."
    ],
    "carbon-neutral": [
      "Carbon footprint offset through verified reforestation and renewable energy projects.",
      "Net zero emissions achieved through sustainable practices and carbon credit programs.",
      "Climate neutral certified with annual third-party verification."
    ],
    sustainable: [
      "Sustainably sourced materials with minimal environmental impact.",
      "Renewable resources used throughout production process.",
      "Sustainable practices verified by independent certification body."
    ]
  }
};

// Error scenarios for testing
export const ERROR_SCENARIOS = {
  INVALID_BATCH_ID: "VRT-INVALID-ID",
  NOT_FOUND: "VRT-2024-000000",
  NETWORK_ERROR: "NETWORK_ERROR_DEMO",
  TIMEOUT: "TIMEOUT_DEMO"
};

// Mobile-specific demo data (shorter, simpler)
export const MOBILE_DEMO_DATA: CreateProductRequest = {
  product_name: "Organic Coffee",
  supplier_name: "Fair Trade Co-op",
  description: "Premium organic coffee from Ethiopia",
  claims: [
    {
      claim_type: "organic",
      description: "USDA Certified Organic with no synthetic chemicals"
    },
    {
      claim_type: "fair-trade",
      description: "Fair trade certified supporting farmer communities"
    }
  ]
};

// Demo tips and guidance
export const DEMO_TIPS = {
  FORM_FILLING: [
    "💡 Try typing 'Organic' to see autocomplete suggestions",
    "🎯 Each claim needs specific evidence and details",
    "⚡ Form validates in real-time as you type",
    "🔄 You can add up to 10 different claims"
  ],
  QR_SCANNING: [
    "📱 QR codes work with any smartphone camera",
    "🔍 Point camera at QR code for instant verification",
    "📂 Download options available for printing",
    "🖨️ Print-optimized for product packaging"
  ],
  VERIFICATION: [
    "🔒 All data is stored on Hedera blockchain",
    "✅ Green badges indicate verified claims",
    "🕐 Yellow badges show pending verification",
    "🔗 Click transaction links to view on blockchain explorer"
  ]
};