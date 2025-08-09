'use client';

import React, { forwardRef } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Search,
  Upload,
  X,
  Plus,
  Minus
} from 'lucide-react';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  onRightIconClick?: () => void;
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  hint,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  loading,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  const hasSuccess = !!success;

  return (
    <div className="space-y-2">
      {label && (
        <label className={`veritas-label ${props.required ? 'veritas-label--required' : ''}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <LeftIcon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            veritas-input 
            ${LeftIcon ? 'pl-11' : ''} 
            ${RightIcon || loading ? 'pr-11' : ''}
            ${hasError ? 'veritas-input--error' : ''}
            ${hasSuccess ? 'veritas-input--success' : ''}
            ${className}
          `}
          {...props}
        />
        
        {(RightIcon || loading) && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner w-5 h-5" />
            ) : (
              RightIcon && <RightIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center gap-2 text-green-600 animate-slide-up">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}
      
      {hint && !error && !success && (
        <div className="flex items-center gap-2 text-gray-500">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{hint}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  maxLength?: number;
  showCounter?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  success,
  hint,
  maxLength,
  showCounter = false,
  className = '',
  value,
  ...props
}, ref) => {
  const hasError = !!error;
  const hasSuccess = !!success;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className={`veritas-label ${props.required ? 'veritas-label--required' : ''}`}>
            {label}
          </label>
          {showCounter && maxLength && (
            <span className={`text-sm ${
              currentLength > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-500'
            }`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        ref={ref}
        maxLength={maxLength}
        className={`
          veritas-input resize-none
          ${hasError ? 'veritas-input--error' : ''}
          ${hasSuccess ? 'veritas-input--success' : ''}
          ${className}
        `}
        value={value}
        {...props}
      />

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center gap-2 text-green-600 animate-slide-up">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}
      
      {hint && !error && !success && (
        <div className="flex items-center gap-2 text-gray-500">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{hint}</span>
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  success,
  hint,
  options,
  placeholder = 'Select an option...',
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  const hasSuccess = !!success;

  return (
    <div className="space-y-2">
      {label && (
        <label className={`veritas-label ${props.required ? 'veritas-label--required' : ''}`}>
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        className={`
          veritas-input cursor-pointer
          ${hasError ? 'veritas-input--error' : ''}
          ${hasSuccess ? 'veritas-input--success' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center gap-2 text-green-600 animate-slide-up">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}
      
      {hint && !error && !success && (
        <div className="flex items-center gap-2 text-gray-500">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{hint}</span>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Form Section Component
interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = '' 
}: FormSectionProps) {
  return (
    <div className={`veritas-card p-6 ${className}`}>
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

// File Upload Component
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 10 * 1024 * 1024, // 10MB
  label = "Upload File",
  error,
  hint,
  disabled = false
}: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      // Handle size error
      return;
    }

    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    onFileRemove?.();
  };

  return (
    <div className="space-y-2">
      <label className="veritas-label">{label}</label>
      
      {!selectedFile ? (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className={`
            border-2 border-dashed rounded-xl p-6 text-center transition-colors
            ${disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}>
            <Upload className={`w-8 h-8 mx-auto mb-2 ${
              disabled ? 'text-gray-300' : 'text-gray-400'
            }`} />
            <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
              Click to upload or drag and drop
            </p>
            {hint && (
              <p className="text-xs text-gray-500 mt-1">{hint}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
              <p className="text-xs text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

// Progress Steps Component
interface Step {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className = '' }: ProgressStepsProps) {
  return (
    <nav className={`mb-8 ${className}`}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li key={step.id} className="flex-1">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${step.completed 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : step.current
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-500'
                  }
                `}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-3 min-w-0">
                  <p className={`text-sm font-medium ${
                    step.current ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500">{step.description}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 
                  ${step.completed ? 'bg-green-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}