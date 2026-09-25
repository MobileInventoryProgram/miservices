import React from 'react';
import { FiFileText } from 'react-icons/fi';

interface DocumentCardProps {
  title: string;
  description: string;
  onViewSample: () => void;
}

export default function DocumentCard({ title, description, onViewSample }: DocumentCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <FiFileText className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-brand-dark-blue mb-3 font-helvetica">
          {title}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        onClick={onViewSample}
        className="w-full bg-brand-light-blue text-white border-2 border-transparent px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
      >
        View Sample
      </button>
    </div>
  );
}
