/**
 * EmptyState Component
 * Beautiful empty state with icon and action
 */
import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full"
        >
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        </motion.div>
      )}

      {/* Title */}
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </motion.h3>
      )}

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-400 mb-6 max-w-md"
        >
          {description}
        </motion.p>
      )}

      {/* Action */}
      {(action || (actionLabel && onAction)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {action || (
            <Button onClick={onAction} gradient>
              {actionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Preset empty states
export const NoDataEmptyState = ({ onAction, actionLabel = 'Add Data' }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    }
    title="No data found"
    description="Get started by adding your first item"
    actionLabel={actionLabel}
    onAction={onAction}
  />
);

export const NoResultsEmptyState = ({ onAction, actionLabel = 'Clear Filters' }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    }
    title="No results found"
    description="Try adjusting your search or filter to find what you're looking for"
    actionLabel={actionLabel}
    onAction={onAction}
  />
);

export const ErrorEmptyState = ({ onAction, actionLabel = 'Try Again' }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    }
    title="Something went wrong"
    description="We encountered an error while loading the data"
    actionLabel={actionLabel}
    onAction={onAction}
  />
);

export default EmptyState;
