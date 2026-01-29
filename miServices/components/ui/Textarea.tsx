import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export default function Textarea({ 
  label, 
  error, 
  required, 
  className = '', 
  ...props 
}: TextareaProps) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-helvetica font-semibold mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-blue transition-all resize-vertical ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        rows={5}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
