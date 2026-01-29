'use client';

import React from 'react';
import { FaBed, FaBath, FaCouch, FaUtensils } from 'react-icons/fa';

interface PropertySize {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
}

interface PropertySizeSelectorProps {
  value: PropertySize;
  onChange: (size: PropertySize) => void;
  error?: string;
}

export default function PropertySizeSelector({ value, onChange, error }: PropertySizeSelectorProps) {
  const handleIncrement = (field: keyof PropertySize) => {
    if (value[field] < 10) {
      onChange({ ...value, [field]: value[field] + 1 });
    }
  };

  const handleDecrement = (field: keyof PropertySize) => {
    if (value[field] > 0) {
      onChange({ ...value, [field]: value[field] - 1 });
    }
  };

  const rooms = [
    { key: 'bedrooms' as keyof PropertySize, label: 'Bedrooms', icon: FaBed },
    { key: 'bathrooms' as keyof PropertySize, label: 'Bathrooms', icon: FaBath },
    { key: 'livingRooms' as keyof PropertySize, label: 'Living Rooms', icon: FaCouch },
    { key: 'kitchens' as keyof PropertySize, label: 'Kitchens/Utility', icon: FaUtensils },
  ];

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-helvetica font-semibold mb-3">
        Property Size
        <span className="text-red-500 ml-1">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className={`bg-white border-2 rounded-lg p-4 transition-all ${
              value[key] > 0 ? 'border-brand-light-blue bg-brand-light-blue bg-opacity-5' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-brand-light-blue bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                  <Icon className="w-5 h-5 text-brand-light-blue" />
                </div>
                <span className="font-helvetica font-semibold text-gray-900">{label}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => handleDecrement(key)}
                disabled={value[key] === 0}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-lg"
              >
                −
              </button>
              <div className="w-16 text-center">
                <span className="text-2xl font-bold text-brand-dark-blue">{value[key]}</span>
              </div>
              <button
                type="button"
                onClick={() => handleIncrement(key)}
                disabled={value[key] === 10}
                className="w-10 h-10 rounded-lg bg-brand-light-blue hover:bg-opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
