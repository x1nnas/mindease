interface MindEaseLogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg" | "xl";
  opacity?: number;
  animate?: boolean;
  className?: string;
}

interface LogoMarkProps {
  markSize: number;
  animate: boolean;
}

const LogoMark = ({ markSize, animate }: LogoMarkProps) => (
  <svg
    width={markSize}
    height={markSize}
    viewBox="0 0 48 48"
    fill="none"
    className={`shrink-0 ${animate ? 'logo-mark-animate' : ''}`}
    style={{ opacity: animate ? 0 : 1 }}
  >
    <defs>
      {/* Primary leaf gradient - soft green to teal */}
      <linearGradient id={`leafGradient-${markSize}`} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.75" />
      </linearGradient>
      
      {/* Subtle inner highlight */}
      <linearGradient id={`leafHighlight-${markSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Main leaf shape - single elegant curve */}
    <path
      d="M24 6
         C14 12 8 22 10 32
         C12 40 18 44 24 44
         C30 44 36 40 38 32
         C40 22 34 12 24 6Z"
      fill={`url(#leafGradient-${markSize})`}
    />
    
    {/* Central vein - subtle, organic curve */}
    <path
      d="M24 14
         C24 14 24 26 24 38"
      stroke="hsl(var(--background))"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.25"
    />
    
    {/* Soft side veins - gentle curves */}
    <path
      d="M24 22 C20 24 17 26 16 28"
      stroke="hsl(var(--background))"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.15"
    />
    <path
      d="M24 22 C28 24 31 26 32 28"
      stroke="hsl(var(--background))"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.15"
    />
    <path
      d="M24 30 C21 31 18 33 17 34"
      stroke="hsl(var(--background))"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.12"
    />
    <path
      d="M24 30 C27 31 30 33 31 34"
      stroke="hsl(var(--background))"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.12"
    />
  </svg>
);

interface WordmarkProps {
  textSize: string;
  animate: boolean;
}

const Wordmark = ({ textSize, animate }: WordmarkProps) => (
  <div
    className={`flex items-baseline ${textSize} font-light tracking-wide ${animate ? 'wordmark-animate' : ''}`}
    style={{ opacity: animate ? 0 : 1, transform: animate ? 'translateX(-10px)' : 'translateX(0)' }}
  >
    <span className="text-foreground/90 font-normal">Mind</span>
    <span className="text-primary font-medium">Ease</span>
  </div>
);

const MindEaseLogo = ({
  variant = "full",
  size = "md",
  opacity = 1,
  animate = false,
  className = "",
}: MindEaseLogoProps) => {
  const sizes = {
    sm: { mark: 28, text: "text-lg", gap: "gap-2" },
    md: { mark: 36, text: "text-2xl", gap: "gap-2.5" },
    lg: { mark: 52, text: "text-4xl", gap: "gap-3" },
    xl: { mark: 80, text: "text-5xl", gap: "gap-4" },
  };

  const config = sizes[size];

  return (
    <div
      className={`flex items-center ${config.gap} ${className} ${animate ? 'logo-container-animate' : ''}`}
      style={{ opacity: animate ? 0 : opacity }}
    >
      {(variant === "full" || variant === "mark") && <LogoMark markSize={config.mark} animate={animate} />}
      {(variant === "full" || variant === "wordmark") && <Wordmark textSize={config.text} animate={animate} />}
      {animate && (
        <style>{`
          @keyframes logoMarkFadeIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes wordmarkFadeIn {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes logoContainerFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: ${opacity};
            }
          }

          .logo-mark-animate {
            animation: logoMarkFadeIn 0.8s ease-out forwards;
          }

          .wordmark-animate {
            animation: wordmarkFadeIn 0.8s ease-out 0.1s forwards;
          }

          .logo-container-animate {
            animation: logoContainerFadeIn 1s ease-out forwards;
          }
        `}</style>
      )}
    </div>
  );
};

export default MindEaseLogo;
