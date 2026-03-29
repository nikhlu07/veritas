import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * VeritasLogo — single source of truth for the brand mark.
 * Uses /public/logo.svg everywhere: nav, footer, verify, submit, error pages.
 */
export default function VeritasLogo({ size = 32, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Veritas"
      width={size}
      height={size}
      priority
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
}
