'use client';

import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import Link from 'next/link';
import { RichText } from '@/components/cms/Sections';
import type { CmsLink } from '@/lib/cms/types';

export interface BookingPrompt {
  enabled?: boolean;
  heading?: string;
  text?: string;
  button?: CmsLink;
  note?: unknown[];
}

/** Pop-up on the contact page steering bookings to the booking form (content from the CMS) */
export default function BookingPromptModal({ prompt }: { prompt?: BookingPrompt }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen || !prompt?.enabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-helvetica font-bold text-brand-dark-blue">
            {prompt.heading}
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
            {prompt.text}
          </p>
          {prompt.button && (
            <Link
              href={prompt.button.href}
              className="block w-full bg-brand-light-blue text-white text-center border-2 border-transparent px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all"
            >
              {prompt.button.label}
            </Link>
          )}
          <div className="pt-4 border-t border-gray-200">
            <RichText value={prompt.note} paragraphClass="text-gray-600 text-sm leading-relaxed" />
          </div>
        </div>
      </div>
    </div>
  );
}
