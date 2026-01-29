import React from 'react';
import Button from './Button';

interface SuccessMessageProps {
  title?: string;
  message: string;
  onClose?: () => void;
  buttonText?: string;
}

export default function SuccessMessage({
  title = 'Success!',
  message,
  onClose,
  buttonText = 'Book Another Job',
}: SuccessMessageProps) {
  return (
    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
      <div className="text-green-600 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-helvetica font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-700 mb-6">{message}</p>
      {onClose && (
        <Button onClick={onClose} variant="primary">
          {buttonText}
        </Button>
      )}
    </div>
  );
}
