import React from 'react';
import { Icon } from '@iconify/react';

/**
 * Icon wrapper component using Iconify
 * 
 * Available icon sets:
 * - mdi (Material Design Icons) - recommended
 * - feather (Feather Icons)
 * - tabler (Tabler Icons)
 * - heroicons (Heroic Icons)
 * 
 * Usage examples:
 * <IconComponent icon="mdi:home" />
 * <IconComponent icon="mdi:home" size={24} />
 * <IconComponent icon="mdi:home" color="red" />
 */

const IconComponent = ({ 
  icon, 
  size = 20, 
  color = 'currentColor',
  className = '',
  style = {},
  ...props 
}) => {
  return (
    <Icon 
      icon={icon} 
      width={size} 
      height={size} 
      style={{ 
        color,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style 
      }}
      className={className}
      {...props}
    />
  );
};

export default IconComponent;
