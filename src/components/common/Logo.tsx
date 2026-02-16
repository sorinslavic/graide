/**
 * Logo Component
 * grAIde branding with navy + coral color scheme
 */

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const taglineSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${sizeClasses[size]} font-bold text-navy-600`}>
        Gr<span className="text-coral-500">AI</span>de
      </h1>
      {showTagline && (
        <p className={`${taglineSizes[size]} text-navy-400 font-medium mt-1`}>
          AI for Better Learning
        </p>
      )}
    </div>
  );
}
