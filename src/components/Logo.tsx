import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  noLink?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true, noLink = false }: LogoProps) {
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

  const xSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const content = (
    <>
      <div className="relative" style={{ width: sizes[size], height: sizes[size] }}>
        <Image
          src="/logo.png"
          alt="Bash X Code Logo"
          width={sizes[size]}
          height={sizes[size]}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex items-center gap-1">
          <span className={`font-display font-bold ${textSizes[size]} gradient-text whitespace-nowrap`}>
            Bash
          </span>
          <span className={`font-display font-black ${xSizes[size]} text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mx-1 transform rotate-12`}>
            X
          </span>
          <span className={`font-display font-bold ${textSizes[size]} gradient-text whitespace-nowrap`}>
            Code
          </span>
        </div>
      )}
    </>
  );

  if (noLink) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
      {content}
    </Link>
  );
}
