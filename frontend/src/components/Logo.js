import React from 'react';

/**
 * HalalFlow Brand Logo Component
 * Uses the official 'H' logo icon with stylized typography
 */
const Logo = ({ size = 'md', showText = true, variant = 'default', className = '' }) => {
  const dimensions = {
    sm: { iconSize: 36, titleSize: '1.25rem', subSize: '0.68rem', gap: '10px' },
    md: { iconSize: 46, titleSize: '1.5rem', subSize: '0.74rem', gap: '12px' },
    lg: { iconSize: 56, titleSize: '1.85rem', subSize: '0.82rem', gap: '14px' },
    xl: { iconSize: 68, titleSize: '2.2rem', subSize: '0.92rem', gap: '16px' },
  };

  const current = dimensions[size] || dimensions.md;
  const isLight = variant === 'light';

  return (
    <div 
      className={`brand-logo-wrapper ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: current.gap, textDecoration: 'none' }}
    >
      {/* Official 'H' Logo Vector (SVG) */}
      <img
        src="/logo-h.svg"
        alt="HalalFlow"
        style={{
          width: `${current.iconSize}px`,
          height: `${current.iconSize}px`,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
      />

      {showText && (
        <div className="brand-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div 
            style={{ 
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)', 
              fontWeight: 800, 
              fontSize: current.titleSize,
              color: isLight ? '#FFFFFF' : 'var(--color-primary, #0F5238)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Halal<span style={{ color: isLight ? '#A8E7C5' : 'var(--color-primary-hover, #2D6A4F)' }}>Flow</span>
          </div>
          <div 
            style={{ 
              fontSize: current.subSize, 
              letterSpacing: '0.14em', 
              textTransform: 'uppercase', 
              color: isLight ? '#E9C46A' : 'var(--color-accent-dark, #765A05)',
              fontWeight: 700,
              marginTop: '2px',
              fontFamily: 'var(--font-body, "Inter", sans-serif)',
            }}
          >
            Islamic Finance
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
