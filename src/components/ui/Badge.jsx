/**
 * Badge Component
 * Status badges with variants and sizes
 */
import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  gradient = false,
  icon = null,
  className = '',
}) => {
  // Variant styles
  const variants = {
    default: gradient
      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: gradient
      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    success: gradient
      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger: gradient
      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: gradient
      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
      : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    purple: gradient
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };

  // Size styles
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const baseStyles = `
    inline-flex items-center
    font-medium rounded-full
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <span className={baseStyles}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

// Dot Badge (for status indicators)
export const DotBadge = ({ variant = 'default', className = '' }) => {
  const colors = {
    default: 'bg-gray-400',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
  };

  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[variant]} ${className}`} />
  );
};

export default Badge;
