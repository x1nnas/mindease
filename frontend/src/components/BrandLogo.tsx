import doveLogo from '../assets/Dove nobg.svg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  customText?: string; // Optional custom text to replace "MindEase"
  className?: string;
}

/**
 * Consistent Brand Logo Component
 * 
 * Use this component anywhere you need the MindEase logo with consistent styling
 */
export function BrandLogo({ size = 'md', showText = true, customText, className = '' }: BrandLogoProps) {
  const sizes = {
    sm: { logo: 'w-16 h-16', text: 'text-xs' },
    md: { logo: 'w-24 h-24', text: 'text-sm' },
    lg: { logo: 'w-32 h-32', text: 'text-base' },
  };

  const config = sizes[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className="opacity-25 hover:opacity-35 transition-opacity duration-300"
        style={{
          filter: `
            drop-shadow(0 0 12px hsl(150 50% 50% / 0.3)) 
            drop-shadow(0 0 24px hsl(150 50% 50% / 0.15))
          `,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
          }}
        >
          {/* Dark outline/shadow layer for depth */}
          <img 
            src={doveLogo}
            alt=""
            className={`${config.logo} absolute inset-0`}
            style={{ 
              filter: 'brightness(0) saturate(100%) invert(15%) sepia(40%) saturate(600%) hue-rotate(120deg) brightness(40%) contrast(200%)',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              opacity: 0.5,
              transform: 'translate(1px, 1px)',
            }}
          />
          {/* Secondary shadow for more depth */}
          <img 
            src={doveLogo}
            alt=""
            className={`${config.logo} absolute inset-0`}
            style={{ 
              filter: 'brightness(0) saturate(100%) invert(25%) sepia(35%) saturate(550%) hue-rotate(120deg) brightness(60%) contrast(150%)',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              opacity: 0.3,
              transform: 'translate(0.5px, 0.5px)',
            }}
          />
          {/* Main dove body with highlights */}
          <img 
            src={doveLogo}
            alt="MindEase Logo"
            className={`${config.logo} relative`}
            style={{ 
              filter: `
                brightness(0) saturate(100%) 
                invert(67%) sepia(30%) saturate(500%) hue-rotate(120deg) 
                brightness(115%) contrast(95%)
                drop-shadow(0 1px 3px hsl(150 50% 45% / 0.5))
                drop-shadow(0 2px 6px hsl(150 50% 35% / 0.3))
                drop-shadow(0 -1px 2px hsl(150 50% 60% / 0.4))
              `,
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
      {showText && (
        <p 
          className={`mt-4 ${config.text} font-medium tracking-[0.15em] ${customText ? 'normal-case' : 'uppercase'}`}
          style={{
            background: 'linear-gradient(135deg, hsl(150 50% 60%) 0%, hsl(150 50% 50%) 50%, hsl(150 50% 55%) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px hsl(150 50% 50% / 0.2), 0 0 40px hsl(150 50% 50% / 0.1)',
            letterSpacing: customText ? '0.05em' : '0.15em',
          }}
        >
          {customText || 'MindEase'}
        </p>
      )}
    </div>
  );
}
