'use client';

import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function BookingPromptModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-helvetica font-bold text-brand-dark-blue">
            Are You Looking to Make a Booking?
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            If so, fill out the booking form on our Booking Page for faster service.
          </p>
          <Link
            href="/booking"
            className="block w-full bg-brand-light-blue text-white text-center px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all"
          >
            Go to Booking Page
          </Link>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm leading-relaxed">
              If you're after ongoing work, close this pop-up and choose <strong>'Quote'</strong> from the contact form, and one of the sales team will be with you ASAP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
