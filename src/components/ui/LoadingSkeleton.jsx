/**
 * LoadingSkeleton Component
 * Animated loading placeholders
 */
import React from 'react';

const LoadingSkeleton = ({ 
  variant = 'text',
  width = '100%',
  height,
  count = 1,
  className = '',
}) => {
  const baseStyles = `
    animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
    dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
    bg-[length:200%_100%]
    rounded
  `;

  const variants = {
    text: 'h-4',
    title: 'h-8',
    button: 'h-10',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32',
    image: 'h-48',
  };

  const skeletonHeight = height || variants[variant];

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseStyles} ${skeletonHeight} ${className}`}
          style={{ width }}
        />
      ))}
    </>
  );
};

// Card Skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <LoadingSkeleton variant="title" className="mb-4" />
        <LoadingSkeleton variant="text" count={3} className="mb-2" />
        <div className="flex gap-2 mt-4">
          <LoadingSkeleton variant="button" width="100px" />
          <LoadingSkeleton variant="button" width="100px" />
        </div>
      </div>
    ))}
  </>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, index) => (
        <LoadingSkeleton key={index} variant="text" width="100%" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton key={colIndex} variant="text" width="100%" />
        ))}
      </div>
    ))}
  </div>
);

// List Skeleton
export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center gap-4">
        <LoadingSkeleton variant="avatar" />
        <div className="flex-1">
          <LoadingSkeleton variant="text" width="60%" className="mb-2" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
