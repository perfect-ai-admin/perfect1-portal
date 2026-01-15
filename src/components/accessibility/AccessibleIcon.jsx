import React from 'react';

// Accessible Icon with ARIA labels (section 9.1)
export function AccessibleIcon({ 
  icon: Icon, 
  label, 
  decorative = false,
  className = "",
  ...props 
}) {
  if (decorative) {
    return (
      <Icon 
        className={className}
        aria-hidden="true"
        {...props}
      />
    );
  }

  return (
    <Icon 
      className={className}
      role="img"
      aria-label={label}
      {...props}
    />
  );
}

// Accessible Button with Icon
export function AccessibleIconButton({ 
  icon: Icon, 
  label, 
  onClick,
  className = "",
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg ${className}`}
      {...props}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}