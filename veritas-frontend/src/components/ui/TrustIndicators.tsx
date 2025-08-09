'use client';

import React from 'react';
import { 
  CheckCircle, 
  Shield, 
  Clock, 
  AlertCircle, 
  Award, 
  Zap,
  Lock,
  Globe,
  TrendingUp,
  Star,
  Verified,
  ExternalLink
} from 'lucide-react';

interface TrustBadgeProps {
  type: 'verified' | 'pending' | 'blockchain' | 'certified' | 'premium';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function TrustBadge({ 
  type, 
  label, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}: TrustBadgeProps) {
  const configs = {
    verified: {
      icon: CheckCircle,
      label: 'Verified',
      colors: 'bg-green-100 text-green-700 border-green-300',
      iconColor: 'text-green-600'
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      colors: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      iconColor: 'text-yellow-600'
    },
    blockchain: {
      icon: Shield,
      label: 'Blockchain Secured',
      colors: 'bg-blue-100 text-blue-700 border-blue-300',
      iconColor: 'text-blue-600'
    },
    certified: {
      icon: Award,
      label: 'Certified',
      colors: 'bg-purple-100 text-purple-700 border-purple-300',
      iconColor: 'text-purple-600'
    },
    premium: {
      icon: Star,
      label: 'Premium',
      colors: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
      iconColor: 'text-yellow-600'
    }
  };

  const config = configs[type];
  const Icon = config.icon;
  
  const sizes = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`
      inline-flex items-center font-semibold rounded-full border
      ${sizes[size]} ${config.colors} ${className}
    `}>
      {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
      <span>{label || config.label}</span>
    </span>
  );
}

interface TrustScoreProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function TrustScore({ 
  score, 
  label = 'Trust Score', 
  size = 'md', 
  showLabel = true,
  animated = false,
  className = '' 
}: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-400 to-emerald-500';
    if (score >= 75) return 'from-blue-400 to-cyan-500';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const sizes = {
    sm: { container: 'w-12 h-12', text: 'text-sm', label: 'text-xs' },
    md: { container: 'w-16 h-16', text: 'text-lg', label: 'text-sm' },
    lg: { container: 'w-20 h-20', text: 'text-xl', label: 'text-base' }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`
        relative ${sizes[size].container} rounded-full 
        bg-gradient-to-br ${getScoreColor(score)} 
        flex items-center justify-center shadow-lg
        ${animated ? 'animate-pulse' : ''}
      `}>
        <span className={`font-bold text-white ${sizes[size].text}`}>
          {score}
        </span>
        <div className="absolute -top-1 -right-1">
          <div className={`w-3 h-3 rounded-full bg-white shadow-sm ${getScoreColor(score)}`}></div>
        </div>
      </div>
      {showLabel && (
        <span className={`font-medium ${getTextColor(score)} ${sizes[size].label}`}>
          {label}
        </span>
      )}
    </div>
  );
}

interface SecurityIndicatorProps {
  level: 'basic' | 'standard' | 'premium' | 'enterprise';
  features?: string[];
  className?: string;
}

export function SecurityIndicator({ level, features = [], className = '' }: SecurityIndicatorProps) {
  const configs = {
    basic: {
      label: 'Basic Security',
      icon: Shield,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300'
    },
    standard: {
      label: 'Standard Security',
      icon: Lock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    premium: {
      label: 'Premium Security',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300'
    },
    enterprise: {
      label: 'Enterprise Security',
      icon: Verified,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    }
  };

  const config = configs[level];
  const Icon = config.icon;

  return (
    <div className={`
      p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor} ${className}
    `}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-white ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
          <p className="text-xs text-gray-500">Blockchain Protected</p>
        </div>
      </div>
      
      {features.length > 0 && (
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface BlockchainProofProps {
  transactionId: string;
  timestamp: string;
  network?: string;
  status?: 'confirmed' | 'pending' | 'failed';
  className?: string;
}

export function BlockchainProof({ 
  transactionId, 
  timestamp, 
  network = 'Hedera',
  status = 'confirmed',
  className = '' 
}: BlockchainProofProps) {
  const statusConfig = {
    confirmed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Confirmed'
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Pending'
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Failed'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleViewTransaction = () => {
    const url = `https://hashscan.io/testnet/transaction/${transactionId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`
      p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 
      transition-colors cursor-pointer group ${className}
    `} onClick={handleViewTransaction}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Blockchain Proof</h4>
            <p className="text-xs text-gray-500">{network} Network</p>
          </div>
        </div>
        <TrustBadge type={status === 'confirmed' ? 'verified' : 'pending'} size="sm" />
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Transaction ID
          </label>
          <p className="text-sm font-mono text-gray-800 bg-gray-50 p-2 rounded mt-1 break-all">
            {transactionId}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <label className="text-xs font-medium text-gray-500">Timestamp</label>
            <p className="text-sm text-gray-700">{timestamp}</p>
          </div>
          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium group-hover:translate-x-1 transition-transform">
            <ExternalLink className="w-3 h-3" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface VerificationStatsProps {
  totalVerifications: number;
  successRate: number;
  averageTime: string;
  className?: string;
}

export function VerificationStats({ 
  totalVerifications, 
  successRate, 
  averageTime,
  className = '' 
}: VerificationStatsProps) {
  const stats = [
    {
      label: 'Total Verifications',
      value: totalVerifications.toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Average Time',
      value: averageTime,
      icon: Zap,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="veritas-card p-4 text-center hover:scale-105 transition-transform">
            <div className={`inline-flex p-3 rounded-xl bg-gray-100 ${stat.color} mb-3`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}