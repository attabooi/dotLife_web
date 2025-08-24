import { cn } from "~/lib/utils";

interface BackgroundLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

export function BackgroundLogo({ 
  size = "xl", 
  className 
}: BackgroundLogoProps) {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48", 
    lg: "w-64 h-64",
    xl: "w-96 h-96",
    "2xl": "w-[32rem] h-[32rem]",
    "3xl": "w-[40rem] h-[40rem]"
  };

  const sizeClass = sizeClasses[size];
  
     return (
     <div className={cn("inline-block opacity-50", sizeClass, className)}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background grid pattern */}
        <defs>
          <pattern id="backgroundGrid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
          </pattern>
        </defs>
        
        {/* Background */}
        <rect width="200" height="200" fill="url(#backgroundGrid)" className="text-gray-400"/>
        
        {/* Large background tower - very subtle */}
        <g className="background-tower" opacity="0.3">
          {/* Base layers */}
          <rect x="60" y="140" width="80" height="20" fill="#ea580c" opacity="0.1"/>
          <rect x="70" y="120" width="60" height="20" fill="#c2410c" opacity="0.1"/>
          <rect x="80" y="100" width="40" height="20" fill="#9a3412" opacity="0.1"/>
          
          {/* Main tower blocks - animated */}
          <rect x="90" y="80" width="20" height="20" fill="#f97316" opacity="0.2" className="tower-block-1"/>
          <rect x="80" y="60" width="40" height="20" fill="#ea580c" opacity="0.2" className="tower-block-2"/>
          <rect x="70" y="40" width="60" height="20" fill="#c2410c" opacity="0.2" className="tower-block-3"/>
          <rect x="60" y="20" width="80" height="20" fill="#9a3412" opacity="0.2" className="tower-block-4"/>
          
          {/* Top blocks */}
          <rect x="95" y="0" width="10" height="20" fill="#fbbf24" opacity="0.3" className="tower-top"/>
          <rect x="85" y="-20" width="30" height="20" fill="#f59e0b" opacity="0.3" className="tower-top"/>
        </g>
        
        {/* Floating background pixels */}
        <g className="background-pixels" opacity="0.2">
          <rect x="20" y="30" width="8" height="8" fill="#fbbf24" className="floating-pixel-1"/>
          <rect x="160" y="50" width="8" height="8" fill="#f97316" className="floating-pixel-2"/>
          <rect x="30" y="120" width="8" height="8" fill="#ea580c" className="floating-pixel-3"/>
          <rect x="150" y="140" width="8" height="8" fill="#f59e0b" className="floating-pixel-4"/>
          <rect x="180" y="80" width="8" height="8" fill="#c2410c" className="floating-pixel-5"/>
          <rect x="10" y="160" width="8" height="8" fill="#9a3412" className="floating-pixel-6"/>
        </g>
        
        {/* CSS animations for building effect */}
        <style jsx>{`
          .tower-block-1 {
            animation: buildBlock 8s ease-in-out infinite;
            animation-delay: 0s;
          }
          
          .tower-block-2 {
            animation: buildBlock 8s ease-in-out infinite;
            animation-delay: 0.5s;
          }
          
          .tower-block-3 {
            animation: buildBlock 8s ease-in-out infinite;
            animation-delay: 1s;
          }
          
          .tower-block-4 {
            animation: buildBlock 8s ease-in-out infinite;
            animation-delay: 1.5s;
          }
          
          .tower-top {
            animation: buildBlock 8s ease-in-out infinite;
            animation-delay: 2s;
          }
          
          .floating-pixel-1 {
            animation: floatPixel 12s ease-in-out infinite;
            animation-delay: 2.5s;
          }
          
          .floating-pixel-2 {
            animation: floatPixel 12s ease-in-out infinite;
            animation-delay: 3s;
          }
          
          .floating-pixel-3 {
            animation: floatPixel 12s ease-in-out infinite;
            animation-delay: 3.5s;
          }
          
          .floating-pixel-4 {
            animation: floatPixel 12s ease-in-out infinite;
            animation-delay: 4s;
          }
          
          .floating-pixel-5 {
            animation: floatPixel 12s ease-in-out infinite;
            animation-delay: 4.5s;
          }
          
          .floating-pixel-6 {
            animation: floatPixel 12s ease-in-out infinite;
            animation-delay: 5s;
          }
          
          @keyframes buildBlock {
            0%, 100% { 
              opacity: 0.1;
              transform: scale(0.8);
            }
            50% { 
              opacity: 0.3;
              transform: scale(1.1);
            }
          }
          
          @keyframes floatPixel {
            0%, 100% { 
              opacity: 0.1;
              transform: translateY(0px) scale(0.8);
            }
            25% { 
              opacity: 0.3;
              transform: translateY(-10px) scale(1.2);
            }
            50% { 
              opacity: 0.2;
              transform: translateY(-5px) scale(1);
            }
            75% { 
              opacity: 0.4;
              transform: translateY(-15px) scale(1.1);
            }
          }
        `}</style>
      </svg>
    </div>
  );
}
