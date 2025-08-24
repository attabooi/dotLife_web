import React from 'react';

interface PixelIconProps {
  className?: string;
  size?: number;
}

// 픽셀 스타일의 트로피 아이콘
export const PixelTrophy: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="4" y="2" width="8" height="2" fill="currentColor"/>
      <rect x="5" y="4" width="6" height="1" fill="currentColor"/>
      <rect x="6" y="5" width="4" height="1" fill="currentColor"/>
      <rect x="7" y="6" width="2" height="1" fill="currentColor"/>
      <rect x="6" y="7" width="4" height="1" fill="currentColor"/>
      <rect x="5" y="8" width="6" height="1" fill="currentColor"/>
      <rect x="4" y="9" width="8" height="1" fill="currentColor"/>
      <rect x="3" y="10" width="10" height="1" fill="currentColor"/>
      <rect x="2" y="11" width="12" height="1" fill="currentColor"/>
      <rect x="1" y="12" width="14" height="1" fill="currentColor"/>
      <rect x="2" y="13" width="12" height="1" fill="currentColor"/>
      <rect x="3" y="14" width="10" height="1" fill="currentColor"/>
      <rect x="4" y="15" width="8" height="1" fill="currentColor"/>
    </svg>
  );
};

// 픽셀 스타일의 크라운 아이콘
export const PixelCrown: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="2" y="8" width="12" height="1" fill="currentColor"/>
      <rect x="3" y="9" width="10" height="1" fill="currentColor"/>
      <rect x="4" y="10" width="8" height="1" fill="currentColor"/>
      <rect x="5" y="11" width="6" height="1" fill="currentColor"/>
      <rect x="6" y="12" width="4" height="1" fill="currentColor"/>
      <rect x="7" y="13" width="2" height="1" fill="currentColor"/>
      <rect x="8" y="14" width="0" height="1" fill="currentColor"/>
      <rect x="1" y="7" width="2" height="1" fill="currentColor"/>
      <rect x="13" y="7" width="2" height="1" fill="currentColor"/>
      <rect x="0" y="6" width="3" height="1" fill="currentColor"/>
      <rect x="13" y="6" width="3" height="1" fill="currentColor"/>
      <rect x="1" y="5" width="2" height="1" fill="currentColor"/>
      <rect x="13" y="5" width="2" height="1" fill="currentColor"/>
      <rect x="2" y="4" width="1" height="1" fill="currentColor"/>
      <rect x="13" y="4" width="1" height="1" fill="currentColor"/>
      <rect x="3" y="3" width="1" height="1" fill="currentColor"/>
      <rect x="12" y="3" width="1" height="1" fill="currentColor"/>
      <rect x="4" y="2" width="1" height="1" fill="currentColor"/>
      <rect x="11" y="2" width="1" height="1" fill="currentColor"/>
      <rect x="5" y="1" width="1" height="1" fill="currentColor"/>
      <rect x="10" y="1" width="1" height="1" fill="currentColor"/>
      <rect x="6" y="0" width="1" height="1" fill="currentColor"/>
      <rect x="9" y="0" width="1" height="1" fill="currentColor"/>
      <rect x="7" y="0" width="1" height="1" fill="currentColor"/>
      <rect x="8" y="0" width="1" height="1" fill="currentColor"/>
    </svg>
  );
};

// 픽셀 스타일의 메달 아이콘
export const PixelMedal: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="6" y="2" width="4" height="1" fill="currentColor"/>
      <rect x="5" y="3" width="6" height="1" fill="currentColor"/>
      <rect x="4" y="4" width="8" height="1" fill="currentColor"/>
      <rect x="3" y="5" width="10" height="1" fill="currentColor"/>
      <rect x="2" y="6" width="12" height="1" fill="currentColor"/>
      <rect x="1" y="7" width="14" height="1" fill="currentColor"/>
      <rect x="2" y="8" width="12" height="1" fill="currentColor"/>
      <rect x="3" y="9" width="10" height="1" fill="currentColor"/>
      <rect x="4" y="10" width="8" height="1" fill="currentColor"/>
      <rect x="5" y="11" width="6" height="1" fill="currentColor"/>
      <rect x="6" y="12" width="4" height="1" fill="currentColor"/>
      <rect x="7" y="13" width="2" height="1" fill="currentColor"/>
      <rect x="8" y="14" width="0" height="1" fill="currentColor"/>
      <rect x="7" y="15" width="2" height="1" fill="currentColor"/>
    </svg>
  );
};

// 픽셀 스타일의 타워 아이콘
export const PixelTower: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="7" y="14" width="2" height="2" fill="currentColor"/>
      <rect x="6" y="12" width="4" height="2" fill="currentColor"/>
      <rect x="5" y="10" width="6" height="2" fill="currentColor"/>
      <rect x="4" y="8" width="8" height="2" fill="currentColor"/>
      <rect x="3" y="6" width="10" height="2" fill="currentColor"/>
      <rect x="2" y="4" width="12" height="2" fill="currentColor"/>
      <rect x="1" y="2" width="14" height="2" fill="currentColor"/>
      <rect x="0" y="0" width="16" height="2" fill="currentColor"/>
    </svg>
  );
};

// 픽셀 스타일의 브릭 아이콘
export const PixelBrick: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="0" y="0" width="16" height="8" fill="currentColor"/>
      <rect x="0" y="8" width="16" height="8" fill="currentColor"/>
      <rect x="4" y="0" width="1" height="16" fill="rgba(0,0,0,0.1)"/>
      <rect x="8" y="0" width="1" height="16" fill="rgba(0,0,0,0.1)"/>
      <rect x="12" y="0" width="1" height="16" fill="rgba(0,0,0,0.1)"/>
      <rect x="0" y="4" width="16" height="1" fill="rgba(0,0,0,0.1)"/>
      <rect x="0" y="12" width="16" height="1" fill="rgba(0,0,0,0.1)"/>
    </svg>
  );
};

// 픽셀 스타일의 화염 아이콘
export const PixelFlame: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="7" y="0" width="2" height="1" fill="currentColor"/>
      <rect x="6" y="1" width="4" height="1" fill="currentColor"/>
      <rect x="5" y="2" width="6" height="1" fill="currentColor"/>
      <rect x="4" y="3" width="8" height="1" fill="currentColor"/>
      <rect x="3" y="4" width="10" height="1" fill="currentColor"/>
      <rect x="2" y="5" width="12" height="1" fill="currentColor"/>
      <rect x="1" y="6" width="14" height="1" fill="currentColor"/>
      <rect x="2" y="7" width="12" height="1" fill="currentColor"/>
      <rect x="3" y="8" width="10" height="1" fill="currentColor"/>
      <rect x="4" y="9" width="8" height="1" fill="currentColor"/>
      <rect x="5" y="10" width="6" height="1" fill="currentColor"/>
      <rect x="6" y="11" width="4" height="1" fill="currentColor"/>
      <rect x="7" y="12" width="2" height="1" fill="currentColor"/>
      <rect x="8" y="13" width="0" height="1" fill="currentColor"/>
      <rect x="7" y="14" width="2" height="1" fill="currentColor"/>
      <rect x="6" y="15" width="4" height="1" fill="currentColor"/>
    </svg>
  );
};

// 픽셀 스타일의 체크마크 아이콘
export const PixelCheck: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="2" y="6" width="2" height="2" fill="currentColor"/>
      <rect x="4" y="8" width="2" height="2" fill="currentColor"/>
      <rect x="6" y="10" width="2" height="2" fill="currentColor"/>
      <rect x="8" y="12" width="2" height="2" fill="currentColor"/>
      <rect x="10" y="10" width="2" height="2" fill="currentColor"/>
      <rect x="12" y="8" width="2" height="2" fill="currentColor"/>
      <rect x="14" y="6" width="2" height="2" fill="currentColor"/>
    </svg>
  );
};

// 픽셀 스타일의 화살표 아이콘들
export const PixelChevronUp: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="6" y="12" width="4" height="2" fill="currentColor"/>
      <rect x="7" y="10" width="2" height="2" fill="currentColor"/>
      <rect x="8" y="8" width="0" height="2" fill="currentColor"/>
      <rect x="7" y="6" width="2" height="2" fill="currentColor"/>
      <rect x="6" y="4" width="4" height="2" fill="currentColor"/>
    </svg>
  );
};

export const PixelChevronDown: React.FC<PixelIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="6" y="2" width="4" height="2" fill="currentColor"/>
      <rect x="7" y="4" width="2" height="2" fill="currentColor"/>
      <rect x="8" y="6" width="0" height="2" fill="currentColor"/>
      <rect x="7" y="8" width="2" height="2" fill="currentColor"/>
      <rect x="6" y="10" width="4" height="2" fill="currentColor"/>
    </svg>
  );
};
