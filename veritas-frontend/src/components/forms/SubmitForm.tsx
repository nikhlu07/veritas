'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Minus, 
  Send, 
  Loader2, 
  Package, 
  User, 
  FileText, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { submitProduct } from '@/lib/api';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import { TrustBadge } from '@/components/ui/TrustIndicators';
import { DEMO_SUGGESTIONS } from '@/data/demoData';
import { TooltipTrigger, InfoTooltip } from '@/components/ui/Tooltip';
import type { CreateProductRequest, CreateProductResponse } from '@/types';

// Enhanced validation schema
const submitFormSchema = z.object({
  product_name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&]+$/, 'Product name contains invalid characters'),
  supplier_name: z.string()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(100, 'Supplier name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&]+$/, 'Supplier name contains invalid characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  claims: z.array(z.object({
    claim_type: z.string().min(1, 'Please select a claim type'),
    description: z.string()
      .min(10, 'Claim description must be at least 10 characters')
      .max(300, 'Claim description cannot exceed 300 characters'),
  })).min(1, 'At least one claim is required').max(10, 'Maximum 10 claims allowed'),
});

type FormData = z.infer<typeof submitFormSchema>;

interface SubmitFormProps {
  onSuccess?: (response: CreateProductResponse) => void;
  onError?: (error: Error) => void;
  demoData?: CreateProductRequest;
}

// Enhanced claim types with descriptions
const CLAIM_TYPES = [
  { value: 'organic', label: 'Organic', description: 'Certified organic production methods' },
  { value: 'fair-trade', label: 'Fair Trade', description: 'Ethical trading and fair wages' },
  { value: 'carbon-neutral', label: 'Carbon Neutral', description: 'Net zero carbon emissions' },
  { value: 'ethical-labor', label: 'Ethical Labor', description: 'Fair labor practices and working conditions' },
  { value: 'sustainable', label: 'Sustainable', description: 'Environmentally sustainable practices' },
  { value: 'local-sourced', label: 'Locally Sourced', description: 'Sourced from local suppliers' },
  { value: 'recyclable', label: 'Recyclable', description: 'Recyclable packaging and materials' },
  { value: 'cruelty-free', label: 'Cruelty Free', description: 'No animal testing involved' },
  { value: 'quality-assured', label: 'Quality Assured', description: 'Meets quality standards and certifications' },
  { value: 'origin-verified', label: 'Origin Verified', description: 'Verified source of origin' },
];

const SUBMISSION_STEPS = [
  'Validating Information',
  'Recording on Blockchain', 
  'Generating QR Code',
  'Finalizing Submission'
];

export default function SubmitForm({ onSuccess, onError, demoData }: SubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<CreateProductResponse | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewBatchId, setPreviewBatchId] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(submitFormSchema),
    defaultValues: {
      product_name: '',
      supplier_name: '',
      description: '',
      claims: [{ claim_type: '', description: '' }],
    },
    mode: 'onChange', // Real-time validation
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'claims',
  });

  const watchedFields = watch();

  // Fill form with demo data when provided
  useEffect(() => {
    if (demoData) {
      reset({
        product_name: demoData.product_name,
        supplier_name: demoData.supplier_name,
        description: demoData.description || '',
        claims: demoData.claims.map(claim => ({
          claim_type: claim.claim_type,
          description: claim.description
        }))
      });
      toast.success('🎯 Demo data loaded! Ready to submit.');
    }
  }, [demoData, reset]);

  // Auto-generate preview batch ID
  useEffect(() => {
    if (watchedFields.product_name && watchedFields.supplier_name) {
      const year = new Date().getFullYear();
      const randomId = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
      setPreviewBatchId(`VRT-${year}-${randomId}`);
    } else {
      setPreviewBatchId('');
    }
  }, [watchedFields.product_name, watchedFields.supplier_name]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmissionStep(0);
    
    try {
      // Step 1: Validate
      setSubmissionStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const requestData: CreateProductRequest = {
        product_name: data.product_name.trim(),
        supplier_name: data.supplier_name.trim(),
        description: data.description?.trim() || undefined,
        claims: data.claims.map(claim => ({
          claim_type: claim.claim_type,
          description: claim.description.trim(),
        })),
      };

      // Step 2: Record on blockchain
      setSubmissionStep(2);
      
      // Step 3: Generate QR Code
      setSubmissionStep(3);
      
      const response = await submitProduct(requestData);
      
      // Step 4: Finalize
      setSubmissionStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubmissionResult(response);
      setShowSuccess(true);
      toast.success('🎉 Product successfully submitted and verified on blockchain!', {
        duration: 5000,
      });
      onSuccess?.(response);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit product';
      toast.error(`❌ Submission failed: ${errorMessage}`);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
      setSubmissionStep(0);
    }
  };

  const addClaim = () => {
    if (fields.length < 10) {
      append({ claim_type: '', description: '' });
    }
  };

  const removeClaim = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const resetForm = () => {
    reset();
    setSubmissionResult(null);
    setShowSuccess(false);
    setPreviewBatchId('');
  };

  // Success state
  if (showSuccess && submissionResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Submission Successful! 🎉</h2>
          <p className="text-xl opacity-90">Your product has been recorded on the blockchain</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Product Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Product Name</label>
                <p className="text-lg font-semibold text-gray-900">{submissionResult.product.product_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Supplier</label>
                <p className="text-lg text-gray-900">{submissionResult.product.supplier_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Batch ID</label>
                <p className="text-lg font-mono bg-blue-50 text-blue-700 px-3 py-2 rounded border">
                  {submissionResult.product.batch_id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Claims Verified</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {submissionResult.claims.map((claim, index) => (
                    <span
                      key={claim.id}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {CLAIM_TYPES.find(t => t.value === claim.claim_type)?.label || claim.claim_type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Blockchain Links */}
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Blockchain Verification
              </h4>
              <div className="space-y-2">
                {submissionResult.hcs_results.filter(r => r.success).map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">
                      {result.type} Record
                    </span>
                    {result.data && (
                      <a
                        href={`https://hashscan.io/testnet/transaction/${result.data.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                      >
                        View on Hedera <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-6">
            <QRCodeDisplay
              qrData={submissionResult.qr_code}
              batchId={submissionResult.product.batch_id}
              size="large"
              title="Production QR Code"
              description="Ready for printing and product attachment"
              variant="production"
              showUrl={true}
              showBatchId={true}
              showDownloadButtons={true}
              showPrintButton={true}
              className="border-2 border-green-200 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50"
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={resetForm}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Submit Another Product
              </button>
              
              <button
                onClick={() => window.open(`/verify/${submissionResult.product.batch_id}`, '_blank')}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                View Verification Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit Product for Verification</h2>
          <p className="text-lg text-gray-600">
            Create a blockchain-verified record of your product's authenticity claims
          </p>
        </div>

        {/* Progress Indicator */}
        {!isSubmitting && previewBatchId && (
          <div className="px-8 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Preview Batch ID</p>
                <p className="text-sm text-blue-700 font-mono">{previewBatchId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Progress */}
        {isSubmitting && (
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Processing Submission</h3>
              <span className="text-sm text-gray-600">Step {submissionStep} of {SUBMISSION_STEPS.length}</span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="font-medium text-gray-900">{SUBMISSION_STEPS[submissionStep - 1] || 'Preparing...'}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(submissionStep / SUBMISSION_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Product Information Section */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Product Information
            </h3>
            <p className="text-gray-600 mt-1">Basic details about your product</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Product Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="product_name" className="block text-sm font-semibold text-gray-700">
                  Product Name *
                </label>
                <TooltipTrigger 
                  content="Enter a clear, descriptive name for your product. This will be displayed to customers during verification."
                  variant="info"
                />
              </div>
              <input
                type="text"
                id="product_name"
                {...register('product_name')}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none ${
                  errors.product_name 
                    ? 'border-red-300 focus:border-red-500' 
                    : dirtyFields.product_name && !errors.product_name
                    ? 'border-green-300 focus:border-green-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="e.g., Organic Fair Trade Coffee Beans"
                disabled={isSubmitting}
              />
              {errors.product_name && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{errors.product_name.message}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Use a clear, descriptive name for your product</p>
            </div>

            {/* Supplier Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="supplier_name" className="block text-sm font-semibold text-gray-700">
                  Supplier Name *
                </label>
                <TooltipTrigger 
                  content="Your company or organization name. This establishes trust and accountability for your product claims."
                  variant="info"
                />
              </div>
              <input
                type="text"
                id="supplier_name"
                {...register('supplier_name')}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none ${
                  errors.supplier_name 
                    ? 'border-red-300 focus:border-red-500' 
                    : dirtyFields.supplier_name && !errors.supplier_name
                    ? 'border-green-300 focus:border-green-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="e.g., Green Valley Organic Farms"
                disabled={isSubmitting}
              />
              {errors.supplier_name && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{errors.supplier_name.message}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Your company or organization name</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Product Description <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Provide additional details about your product, its origin, production methods, or certifications..."
                disabled={isSubmitting}
              />
              {errors.description && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{errors.description.message}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {watchedFields.description?.length || 0}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Claims Section */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Product Claims *
                </h3>
                <p className="text-gray-600 mt-1">Add claims about your product's qualities and certifications</p>
              </div>
              
              <button
                type="button"
                onClick={addClaim}
                disabled={isSubmitting || fields.length >= 10}
                className="veritas-button veritas-button--success veritas-button--sm"
              >
                <Plus className="w-4 h-4" />
                Add Claim ({fields.length}/10)
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border-2 border-gray-200 rounded-xl p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    Claim {index + 1}
                  </h4>
                  
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClaim(index)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Claim Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Claim Type *
                    </label>
                    <select
                      {...register(`claims.${index}.claim_type` as const)}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none ${
                        errors.claims?.[index]?.claim_type 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Choose a claim type...</option>
                      {CLAIM_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                    {errors.claims?.[index]?.claim_type && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.claims[index]?.claim_type?.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Claim Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Evidence & Details *
                    </label>
                    <textarea
                      {...register(`claims.${index}.description` as const)}
                      rows={3}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none resize-none ${
                        errors.claims?.[index]?.description 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Provide detailed evidence for this claim, including certifications, test results, or documentation..."
                      disabled={isSubmitting}
                    />
                    {errors.claims?.[index]?.description && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.claims[index]?.description?.message}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {watchedFields.claims?.[index]?.description?.length || 0}/300 characters
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {errors.claims && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">{errors.claims.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="veritas-button veritas-button--primary veritas-button--xl flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
              {isSubmitting ? 'Processing Submission...' : 'Submit for Blockchain Verification'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="veritas-button veritas-button--secondary veritas-button--lg"
            >
              Reset Form
            </button>
          </div>

          {/* Form Status */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">Form is valid and ready to submit</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600">Please complete all required fields</span>
                  </>
                )}
              </div>
              <span className="text-gray-500">
                {Object.keys(dirtyFields).length > 0 ? 'Unsaved changes' : 'No changes'}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Product Information</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Use clear, descriptive names</li>
              <li>• Include brand or model if applicable</li>
              <li>• Keep descriptions factual and specific</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Claims & Evidence</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Provide detailed supporting evidence</li>
              <li>• Reference certifications or test results</li>
              <li>• Be specific about verification methods</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}