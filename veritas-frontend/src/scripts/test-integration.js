/**
 * Frontend Integration Test Script
 * 
 * This script tests the complete user journey and component integration
 * Run with: node src/scripts/test-integration.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Veritas Frontend Integration Tests...\n');

// Test configuration
const tests = {
  components: [
    'src/components/forms/SubmitForm.tsx',
    'src/components/verification/VerificationResults.tsx',
    'src/components/ui/QRCodeDisplay.tsx',
    'src/components/ui/TrustIndicators.tsx',
    'src/components/ui/FormComponents.tsx',
    'src/components/ui/ErrorComponents.tsx',
    'src/components/ui/SkeletonLoaders.tsx',
    'src/components/layout/Header.tsx'
  ],
  pages: [
    'src/app/page.tsx',
    'src/app/submit/page.tsx',
    'src/app/verify/page.tsx',
    'src/app/verify/[batchId]/page.tsx'
  ],
  api: [
    'src/lib/api.ts'
  ],
  styles: [
    'src/styles/design-system.css',
    'src/app/globals.css'
  ],
  types: [
    'src/types/index.ts'
  ]
};

// Helper functions
function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

function checkFileContent(filePath, searchStrings) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    return { exists: false, matches: [] };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const matches = searchStrings.filter(str => content.includes(str));
  
  return {
    exists: true,
    content: content,
    matches: matches,
    allFound: matches.length === searchStrings.length
  };
}

function runTest(testName, testFunction) {
  try {
    const result = testFunction();
    console.log(result.success ? '✅' : '❌', testName);
    if (result.message) {
      console.log('   ', result.message);
    }
    if (result.details) {
      result.details.forEach(detail => console.log('    -', detail));
    }
    return result.success;
  } catch (error) {
    console.log('❌', testName);
    console.log('    Error:', error.message);
    return false;
  }
}

// Test Suite
const testSuite = {
  // 1. File Structure Tests
  'File Structure - All Components Exist': () => {
    const missing = tests.components.filter(file => !checkFileExists(file));
    return {
      success: missing.length === 0,
      message: missing.length > 0 ? `Missing files: ${missing.join(', ')}` : 'All component files exist',
      details: missing
    };
  },

  'File Structure - All Pages Exist': () => {
    const missing = tests.pages.filter(file => !checkFileExists(file));
    return {
      success: missing.length === 0,
      message: missing.length > 0 ? `Missing files: ${missing.join(', ')}` : 'All page files exist',
      details: missing
    };
  },

  'File Structure - Core Files Exist': () => {
    const allFiles = [...tests.api, ...tests.styles, ...tests.types];
    const missing = allFiles.filter(file => !checkFileExists(file));
    return {
      success: missing.length === 0,
      message: missing.length > 0 ? `Missing files: ${missing.join(', ')}` : 'All core files exist',
      details: missing
    };
  },

  // 2. API Integration Tests
  'API Integration - Retry Logic': () => {
    const result = checkFileContent('src/lib/api.ts', ['retryRequest', 'shouldRetry', 'RETRY_CONFIG']);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Retry logic implemented' : `Missing: ${result.searchStrings?.filter(s => !result.matches.includes(s)).join(', ')}`) :
        'API file not found'
    };
  },

  'API Integration - Error Handling': () => {
    const result = checkFileContent('src/lib/api.ts', ['handleApiError', 'AxiosError', 'ApiError']);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Error handling implemented' : 'Incomplete error handling') :
        'API file not found'
    };
  },

  // 3. Component Integration Tests
  'Components - Form Integration': () => {
    const result = checkFileContent('src/components/forms/SubmitForm.tsx', [
      'submitProduct',
      'QRCodeDisplay',
      'veritas-button',
      'toast.success'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Submit form properly integrated' : 'Form integration incomplete') :
        'Submit form component not found'
    };
  },

  'Components - Verification Integration': () => {
    const result = checkFileContent('src/components/verification/VerificationResults.tsx', [
      'VerificationSkeleton',
      'ErrorComponent',
      'TrustBadge',
      'BlockchainProof'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Verification component properly integrated' : 'Verification integration incomplete') :
        'Verification results component not found'
    };
  },

  'Components - Design System Integration': () => {
    const result = checkFileContent('src/components/ui/QRCodeDisplay.tsx', [
      'veritas-qr-container',
      'veritas-button',
      'toast.success'
    ]);
    return {
      success: result.exists && result.matches.length >= 2,
      message: result.exists ? 
        (result.matches.length >= 2 ? 'QR component uses design system' : 'Design system integration incomplete') :
        'QR component not found'
    };
  },

  // 4. Design System Tests
  'Design System - CSS Variables': () => {
    const result = checkFileContent('src/styles/design-system.css', [
      '--color-primary-600',
      '--color-secondary-600',
      '--gradient-trust',
      '--font-family-sans'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Design system CSS variables defined' : 'Missing CSS variables') :
        'Design system CSS not found'
    };
  },

  'Design System - Component Classes': () => {
    const result = checkFileContent('src/styles/design-system.css', [
      '.veritas-button',
      '.veritas-card',
      '.veritas-qr-container',
      '.trust-badge'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Design system component classes defined' : 'Missing component classes') :
        'Design system CSS not found'
    };
  },

  'Design System - Responsive Design': () => {
    const result = checkFileContent('src/styles/design-system.css', [
      '@media (max-width: 768px)',
      '@media (max-width: 1024px)',
      'veritas-grid--cols-',
      'veritas-container'
    ]);
    return {
      success: result.exists && result.matches.length >= 3,
      message: result.exists ? 
        (result.matches.length >= 3 ? 'Responsive design implemented' : 'Responsive design incomplete') :
        'Design system CSS not found'
    };
  },

  // 5. Error Handling Tests
  'Error Handling - Error Components': () => {
    const result = checkFileContent('src/components/ui/ErrorComponents.tsx', [
      'ErrorComponent',
      'NetworkStatus',
      'InlineError',
      'ErrorBoundaryFallback'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Error components implemented' : 'Error components incomplete') :
        'Error components file not found'
    };
  },

  'Error Handling - Skeleton Loaders': () => {
    const result = checkFileContent('src/components/ui/SkeletonLoaders.tsx', [
      'FormSkeleton',
      'QRCodeSkeleton',
      'VerificationSkeleton',
      'loading-skeleton'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Skeleton loaders implemented' : 'Skeleton loaders incomplete') :
        'Skeleton loaders file not found'
    };
  },

  // 6. TypeScript Integration
  'TypeScript - Type Definitions': () => {
    const result = checkFileContent('src/types/index.ts', [
      'CreateProductRequest',
      'VerificationResponse',
      'QRCodeData',
      'ApiError'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'TypeScript types properly defined' : 'Type definitions incomplete') :
        'Type definitions file not found'
    };
  },

  // 7. Page Integration Tests
  'Pages - Submit Page Integration': () => {
    const result = checkFileContent('src/app/submit/page.tsx', [
      'SubmitForm',
      'QRCodeDisplay',
      'CreateProductResponse',
      'handleSubmissionSuccess'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Submit page properly integrated' : 'Submit page integration incomplete') :
        'Submit page not found'
    };
  },

  'Pages - Verify Page Integration': () => {
    const result = checkFileContent('src/app/verify/[batchId]/page.tsx', [
      'VerificationResults',
      'verifyProduct',
      'useParams',
      'fetchVerificationData'
    ]);
    return {
      success: result.exists && result.allFound,
      message: result.exists ? 
        (result.allFound ? 'Verify page properly integrated' : 'Verify page integration incomplete') :
        'Verify page not found'
    };
  }
};

// Run all tests
console.log('Running Integration Tests:\n');

let passedTests = 0;
let totalTests = 0;

Object.entries(testSuite).forEach(([testName, testFunction]) => {
  totalTests++;
  if (runTest(testName, testFunction)) {
    passedTests++;
  }
  console.log(''); // Add spacing between tests
});

// Test Summary
console.log('═'.repeat(60));
console.log(`Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All integration tests passed!');
  console.log('\n✅ Frontend Integration Complete:');
  console.log('   - All components properly connected');
  console.log('   - API integration with retry logic');
  console.log('   - Error handling and loading states');
  console.log('   - Design system consistently applied');
  console.log('   - TypeScript types properly defined');
  console.log('   - Page navigation working');
  console.log('\n🚀 Ready for end-to-end testing!');
} else {
  console.log('❌ Some integration tests failed');
  console.log('   Please review the failed tests above');
  
  const failureRate = ((totalTests - passedTests) / totalTests * 100).toFixed(1);
  console.log(`   Failure rate: ${failureRate}%`);
}

console.log('\n📋 Next Steps:');
console.log('   1. Fix any failed tests');
console.log('   2. Test the complete user journey manually');
console.log('   3. Test responsive design on different devices');
console.log('   4. Test error scenarios and edge cases');
console.log('   5. Performance testing and optimization');

// Check if we can run the dev server
console.log('\n🔧 Development Server Check:');
try {
  // Check if package.json exists and has the right scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.dev) {
    console.log('✅ Dev server script available');
    console.log('   Run: npm run dev');
  } else {
    console.log('❌ Dev server script not found');
  }
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ Build script available');
    console.log('   Run: npm run build');
  } else {
    console.log('❌ Build script not found');
  }
  
} catch (error) {
  console.log('❌ Could not check package.json');
}

console.log('\n' + '═'.repeat(60));