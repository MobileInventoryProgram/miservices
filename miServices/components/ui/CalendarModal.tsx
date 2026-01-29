'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsLoading(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-bold text-brand-dark-blue font-helvetica">
            Book Your Discovery Call
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="relative overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#3f59a9] rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-lg text-gray-600 font-helvetica">
                Loading calendar...
              </p>
              <p className="mt-2 text-sm text-gray-500">
                This may take a few seconds
              </p>
            </div>
          )}
          
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2HuLzA6AfyePjTnxsKE8YsTBoSal6b24iA3HCqTOQ6aeq1hAXvhCseREj64u6Q6w_9KFNf8wzz?gv=true"
            style={{ border: 0 }}
            width="100%"
            height="600"
            frameBorder="0"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
