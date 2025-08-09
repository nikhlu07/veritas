'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle, Lightbulb, AlertCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  variant?: 'default' | 'info' | 'warning' | 'success';
  showIcon?: boolean;
  className?: string;
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  variant = 'default',
  showIcon = false,
  className = '',
  delay = 500
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const variants = {
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      icon: Info
    },
    info: {
      bg: 'bg-blue-600',
      text: 'text-white',
      icon: HelpCircle
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'text-gray-900',
      icon: AlertCircle
    },
    success: {
      bg: 'bg-green-600',
      text: 'text-white',
      icon: Lightbulb
    }
  };

  const currentVariant = variants[variant];
  const Icon = currentVariant.icon;

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  useEffect(() => {
    const updatePosition = () => {
      if (!triggerRef.current || !isVisible) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const scrollX = window.pageXOffset;
      const scrollY = window.pageYOffset;

      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2 + scrollX;
          y = rect.top + scrollY - 10;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 + scrollX;
          y = rect.bottom + scrollY + 10;
          break;
        case 'left':
          x = rect.left + scrollX - 10;
          y = rect.top + rect.height / 2 + scrollY;
          break;
        case 'right':
          x = rect.right + scrollX + 10;
          y = rect.top + rect.height / 2 + scrollY;
          break;
      }

      setCoords({ x, y });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    const baseClasses = `
      fixed z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg pointer-events-none
      transition-all duration-200 max-w-xs
      ${currentVariant.bg} ${currentVariant.text}
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `;

    const positionClasses = {
      top: 'transform -translate-x-1/2 -translate-y-full',
      bottom: 'transform -translate-x-1/2',
      left: 'transform -translate-x-full -translate-y-1/2',
      right: 'transform -translate-y-1/2'
    };

    return `${baseClasses} ${positionClasses[position]}`;
  };

  const getArrowClasses = () => {
    const baseArrowClasses = 'absolute w-2 h-2 transform rotate-45';
    const arrowColor = variant === 'warning' ? 'bg-yellow-500' : currentVariant.bg.replace('bg-', 'bg-');

    const positionClasses = {
      top: `${arrowColor} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`,
      bottom: `${arrowColor} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`,
      left: `${arrowColor} left-full top-1/2 -translate-x-1/2 -translate-y-1/2`,
      right: `${arrowColor} right-full top-1/2 translate-x-1/2 -translate-y-1/2`
    };

    return `${baseArrowClasses} ${positionClasses[position]}`;
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
        onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
        onClick={handleClick}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={getTooltipClasses()}
          style={{
            left: coords.x,
            top: coords.y
          }}
        >
          <div className="flex items-center gap-2">
            {showIcon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span>{content}</span>
          </div>
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </>
  );
}

// Predefined tooltip components for common use cases
export function InfoTooltip({ content, children, ...props }: Omit<TooltipProps, 'variant' | 'showIcon'>) {
  return (
    <Tooltip content={content} variant="info" showIcon {...props}>
      {children}
    </Tooltip>
  );
}

export function HelpTooltip({ content, children, ...props }: Omit<TooltipProps, 'variant' | 'showIcon'>) {
  return (
    <Tooltip content={content} variant="default" showIcon {...props}>
      {children}
    </Tooltip>
  );
}

export function WarningTooltip({ content, children, ...props }: Omit<TooltipProps, 'variant' | 'showIcon'>) {
  return (
    <Tooltip content={content} variant="warning" showIcon {...props}>
      {children}
    </Tooltip>
  );
}

// Tooltip trigger button component
interface TooltipTriggerProps {
  content: string;
  variant?: 'default' | 'info' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TooltipTrigger({ content, variant = 'info', size = 'sm', className = '' }: TooltipTriggerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colors = {
    default: 'text-gray-400 hover:text-gray-600',
    info: 'text-blue-400 hover:text-blue-600',
    warning: 'text-yellow-400 hover:text-yellow-600',
    success: 'text-green-400 hover:text-green-600'
  };

  return (
    <Tooltip content={content} variant={variant} showIcon>
      <button
        type="button"
        className={`inline-flex items-center justify-center transition-colors ${colors[variant]} ${className}`}
      >
        <HelpCircle className={sizes[size]} />
      </button>
    </Tooltip>
  );
}