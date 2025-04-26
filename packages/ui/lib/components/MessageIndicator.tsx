import React, { useEffect, useState } from 'react';

export interface MessageIndicatorProps {
  /** Type of message */
  type: 'loading' | 'success' | 'error' | 'warning' | null;
  /** Custom text to display */
  message?: string;
  /** Auto-hide duration in milliseconds; omit for manual control */
  duration?: number;
}

export const MessageIndicator: React.FC<MessageIndicatorProps> = ({ type, message, duration }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setVisible(true);
      if (duration) {
        const timeout = window.setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timeout);
      }
    } else {
      setVisible(false);
    }
    return undefined;
  }, [type, duration]);

  if (!visible || !type) {
    return null;
  }

  const config = {
    loading: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ),
      defaultMessage: 'Loading...',
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
      defaultMessage: 'Success!',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 002 0V7zm-1 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      defaultMessage: 'Error occurred',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.213 2.991-1.743 2.991H3.482c-1.53 0-2.493-1.657-1.743-2.991L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-9a1 1 0 00-.894.553l-3.5 6a1 1 0 00.894 1.447h7a1 1 0 00.894-1.447l-3.5-6A1 1 0 0010 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      defaultMessage: 'Warning!',
    },
  }[type];

  return (
    <div
      className={` bottom-4 right-4 flex items-center px-2 py-1 rounded-md shadow-md space-x-2 ${config.bg} ${config.text}`}>
      {config.icon}
      <span className="font-xs">{message || config.defaultMessage}</span>
    </div>
  );
};
