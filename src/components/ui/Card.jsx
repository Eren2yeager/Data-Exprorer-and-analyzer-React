/**
 * Card Component
 * Modern card with gradient options and hover effects
 */
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  gradient = null,
  hover = true,
  onClick = null,
  className = '',
  padding = 'md',
  shadow = 'md',
  ...props
}) => {
  // Gradient styles
  const gradients = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    green: 'bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20',
    orange: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    gray: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
  };

  // Padding styles
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Shadow styles
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const baseStyles = `
    rounded-xl
    border border-gray-200 dark:border-gray-700
    ${gradient ? gradients[gradient] : 'bg-white dark:bg-gray-800'}
    ${paddings[padding]}
    ${shadows[shadow]}
    ${hover ? 'transition-all duration-200' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const CardComponent = onClick ? motion.div : 'div';

  const motionProps = onClick
    ? {
        whileHover: { scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <CardComponent
      className={baseStyles}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Card Header
export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

// Card Title
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

// Card Description
export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
    {children}
  </p>
);

// Card Content
export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

// Card Footer
export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export default Card;
