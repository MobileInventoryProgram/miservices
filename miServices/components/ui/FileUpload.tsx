'use client';

import React, { useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

interface FileUploadProps {
  label: string;
  error?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number;
  onChange: (file: File | null) => void;
}

export default function FileUpload({ 
  label, 
  error, 
  required,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10485760,
  onChange,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (file) {
      if (file.size > maxSize) {
        setUploadError(`File size must be less than ${maxSize / 1048576}MB`);
        setSelectedFile(null);
        onChange(null);
        return;
      }

      setSelectedFile(file);
      onChange(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError('');
    onChange(null);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-helvetica font-semibold mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!selectedFile ? (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-brand-light-blue hover:bg-brand-light-blue hover:bg-opacity-5 ${
              error || uploadError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <div className="text-center">
              <FiUpload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG (max {maxSize / 1048576}MB)
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <FiFile className="w-5 h-5 text-brand-light-blue mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {(error || uploadError) && (
        <p className="text-red-500 text-sm mt-1">{error || uploadError}</p>
      )}
    </div>
  );
}
