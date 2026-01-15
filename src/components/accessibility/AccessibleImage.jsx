import React from 'react';

// Accessible Image with proper alt text (section 9.1)
export function AccessibleImage({ 
  src, 
  alt, 
  decorative = false,
  loading = "lazy",
  className = "",
  ...props 
}) {
  return (
    <img
      src={src}
      alt={decorative ? "" : alt}
      role={decorative ? "presentation" : undefined}
      aria-hidden={decorative ? "true" : undefined}
      loading={loading}
      className={className}
      {...props}
    />
  );
}