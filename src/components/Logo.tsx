import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <Link href="/" className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
      <div className="relative" style={{ width: sizes[size], height: sizes[size] }}>
        <Image
          src="/logo.png"
          alt="Aura-7F Logo"
          width={sizes[size]}
          height={sizes[size]}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-display font-semibold ${textSizes[size]} gradient-text whitespace-nowrap`}>
          Aura-7F
        </span>
      )}
    </Link>
  );
}
