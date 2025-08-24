import { cn } from "~/lib/utils";

interface PixelLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "monochrome" | "animated";
  className?: string;
}

export function PixelLogo({ 
  size = "md", 
  variant = "default", 
  className 
}: PixelLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const baseClasses = "inline-block";
  const sizeClass = sizeClasses[size];
  
  return (
    <div className={cn(baseClasses, sizeClass, className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-full h-full",
          variant === "animated" && "animate-pulse"
        )}
      >
        {/* Background grid pattern */}
        <defs>
          <pattern id="pixelGrid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
          </pattern>
        </defs>
        
        {/* Background */}
        <rect width="48" height="48" fill="url(#pixelGrid)" className="text-gray-300"/>
        
                 {/* Tower base */}
         <rect x="16" y="32" width="16" height="4" fill="#ea580c" className="tower-base"/>
         <rect x="18" y="28" width="12" height="4" fill="#c2410c" className="tower-base"/>
         <rect x="20" y="24" width="8" height="4" fill="#9a3412" className="tower-base"/>
         
         {/* Tower blocks - pixelated style */}
         <rect x="22" y="20" width="4" height="4" fill="#f97316" className="tower-block"/>
         <rect x="20" y="16" width="8" height="4" fill="#ea580c" className="tower-block"/>
         <rect x="18" y="12" width="12" height="4" fill="#c2410c" className="tower-block"/>
         <rect x="16" y="8" width="16" height="4" fill="#9a3412" className="tower-block"/>
         
         {/* Top pixel blocks */}
         <rect x="24" y="4" width="4" height="4" fill="#fbbf24" className="tower-top"/>
         <rect x="20" y="0" width="12" height="4" fill="#f59e0b" className="tower-top"/>
        
                 {/* Floating pixels around tower */}
         <rect x="8" y="12" width="2" height="2" fill="#fbbf24" opacity="0.8" className="floating-pixel"/>
         <rect x="38" y="16" width="2" height="2" fill="#f97316" opacity="0.8" className="floating-pixel"/>
         <rect x="6" y="24" width="2" height="2" fill="#ea580c" opacity="0.8" className="floating-pixel"/>
         <rect x="40" y="28" width="2" height="2" fill="#f59e0b" opacity="0.8" className="floating-pixel"/>
        
        {/* Text "dotLife" in pixel font style */}
        <g className="logo-text" fill="currentColor">
          {/* d */}
          <rect x="4" y="36" width="2" height="8" fill="currentColor"/>
          <rect x="6" y="36" width="4" height="2" fill="currentColor"/>
          <rect x="6" y="40" width="4" height="2" fill="currentColor"/>
          <rect x="8" y="38" width="2" height="2" fill="currentColor"/>
          
          {/* o */}
          <rect x="12" y="38" width="4" height="2" fill="currentColor"/>
          <rect x="12" y="42" width="4" height="2" fill="currentColor"/>
          <rect x="12" y="40" width="2" height="2" fill="currentColor"/>
          <rect x="14" y="40" width="2" height="2" fill="currentColor"/>
          
          {/* t */}
          <rect x="18" y="36" width="6" height="2" fill="currentColor"/>
          <rect x="20" y="36" width="2" height="8" fill="currentColor"/>
          
          {/* L */}
          <rect x="26" y="36" width="2" height="8" fill="currentColor"/>
          <rect x="26" y="42" width="4" height="2" fill="currentColor"/>
          
          {/* i */}
          <rect x="32" y="36" width="2" height="2" fill="currentColor"/>
          <rect x="32" y="40" width="2" height="6" fill="currentColor"/>
          
          {/* f */}
          <rect x="36" y="36" width="6" height="2" fill="currentColor"/>
          <rect x="38" y="36" width="2" height="8" fill="currentColor"/>
          <rect x="36" y="40" width="4" height="2" fill="currentColor"/>
          
          {/* e */}
          <rect x="44" y="38" width="2" height="2" fill="currentColor"/>
          <rect x="42" y="40" width="4" height="2" fill="currentColor"/>
          <rect x="42" y="42" width="4" height="2" fill="currentColor"/>
          <rect x="42" y="38" width="2" height="2" fill="currentColor"/>
        </g>
        
        {/* CSS animations */}
        <style jsx>{`
          .tower-block {
            animation: ${variant === "animated" ? "glow 2s ease-in-out infinite alternate" : "none"};
          }
          
          .tower-top {
            animation: ${variant === "animated" ? "pulse 1.5s ease-in-out infinite" : "none"};
          }
          
          .floating-pixel {
            animation: ${variant === "animated" ? "float 3s ease-in-out infinite" : "none"};
          }
          
          @keyframes glow {
            from { filter: brightness(1); }
            to { filter: brightness(1.3); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </svg>
    </div>
  );
}

// Text-only version for headers
export function PixelLogoText({ 
  size = "md", 
  variant = "default", 
  className 
}: PixelLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl",
    xl: "text-3xl"
  };

  return (
    <div className={cn(
      "font-mono font-bold tracking-wider flex items-center",
      sizeClasses[size],
      variant === "animated" && "animate-pulse",
      className
    )}>
      <span className="text-orange-500">dot</span>
      <span className="text-gray-900">Life</span>
    </div>
  );
}

// Compact version for small spaces
export function PixelLogoCompact({ 
  size = "sm", 
  variant = "default", 
  className 
}: PixelLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  return (
    <div className={cn("inline-block", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-full h-full",
          variant === "animated" && "animate-pulse"
        )}
      >
                 {/* Simplified tower */}
         <rect x="8" y="16" width="8" height="4" fill="#ea580c"/>
         <rect x="9" y="12" width="6" height="4" fill="#c2410c"/>
         <rect x="10" y="8" width="4" height="4" fill="#f97316"/>
         <rect x="11" y="4" width="2" height="4" fill="#fbbf24"/>
         
         {/* Floating pixel */}
         <rect x="4" y="6" width="2" height="2" fill="#f59e0b" opacity="0.8"/>
         <rect x="18" y="10" width="2" height="2" fill="#ea580c" opacity="0.8"/>
      </svg>
    </div>
  );
}
