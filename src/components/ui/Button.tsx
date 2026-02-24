import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button className={`px-4 py-2 rounded-lg font-bold transition-all ${className}`} {...props}>
    {children}
  </button>
);
