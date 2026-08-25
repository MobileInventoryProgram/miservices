'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCopy } from 'react-icons/fi';
import type { SanityPriceList } from '@/lib/sanity';
import {
  bakeAdjustedPrices,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ORDER,
  BEDROOM_LABELS,
  BEDROOM_ORDER,
} from '@/lib/pricing';
import type { ServiceRow } from '@/lib/pricing';

interface DuplicateFormProps {
  templates: SanityPriceList[];
  preselectedTemplateId?: string;
}

export default function DuplicateForm({
  templates,
  preselectedTemplateId,
}: DuplicateFormProps) {
  const router = useRouter();
  const initialTemplate =
    templates.find((t) => t._id === preselectedTemplateId) || templates[0];

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate._id);
  const [title, setTitle] = useState('');
  const [blanketAdjustment, setBlanketAdjustment] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId) || templates[0];

  const previewRows = useMemo(
    () => bakeAdjustedPrices((selectedTemplate.serviceRows || []) as ServiceRow[], blanketAdjustment),
    [selectedTemplate.serviceRows, blanketAdjustment]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/members/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          title: title.trim(),
          blanketAdjustment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create price list');
      } else {
        router.push(`/members/pricing/${data.id}/edit`);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members/pricing"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to My Pricing
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Duplicate a Template</h1>
          <p className="mt-1 text-blue-200">
            Create a new price list from a shared template.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  id="template"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue text-sm"
                >
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Name for your list
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Custom Pricing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="blanketAdjustment" className="block text-sm font-medium text-gray-700 mb-1">
                Blanket Adjustment (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="blanketAdjustment"
                  type="number"
                  value={blanketAdjustment}
                  onChange={(e) => setBlanketAdjustment(Number(e.target.value) || 0)}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue text-sm"
                />
                <span className="text-sm text-gray-500">
                  {blanketAdjustment > 0
                    ? `+${blanketAdjustment}% on template prices`
                    : blanketAdjustment < 0
                      ? `${blanketAdjustment}% on template prices`
                      : 'No adjustment — prices copied as-is'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                The adjustment is baked in permanently. After creation, prices are stored directly and can be edited individually.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-helvetica mb-4">
              Price Preview
            </h2>

            {SERVICE_TYPE_ORDER.map((serviceType) => {
              const rows = previewRows.filter((r) => r.serviceType === serviceType);
              if (rows.length === 0) return null;

              const hasFurnished = rows.some((r) => r.furnishedPrice != null);

              return (
                <div key={serviceType} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 font-helvetica">
                      {SERVICE_TYPE_LABELS[serviceType]}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrooms</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Max Rooms</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Unfurnished</th>
                          {hasFurnished && (
                            <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Furnished</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {BEDROOM_ORDER.map((bed) => {
                          const row = rows.find((r) => r.bedrooms === bed);
                          if (!row) return null;
                          return (
                            <tr key={bed}>
                              <td className="px-3 py-2 text-sm text-gray-700">{BEDROOM_LABELS[bed]}</td>
                              <td className="px-3 py-2 text-sm text-gray-500">{row.maxRooms}</td>
                              <td className="px-3 py-2 text-sm text-gray-700 tabular-nums">&pound;{row.unfurnishedPrice}</td>
                              {hasFurnished && (
                                <td className="px-3 py-2 text-sm text-gray-700 tabular-nums">
                                  {row.furnishedPrice != null ? <>&pound;{row.furnishedPrice}</> : '—'}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Flat Rates & Additional Rates Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedTemplate.flatRates?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 font-helvetica">Flat Rates</h3>
                  </div>
                  <div className="px-6 py-4 space-y-2">
                    {selectedTemplate.flatRates.map((rate) => (
                      <div key={rate._key} className="flex justify-between text-sm">
                        <span className="text-gray-700">{rate.name}</span>
                        <span className="text-gray-900 font-medium">
                          &pound;{rate.price}
                          {rate.unit && <span className="text-gray-500 ml-1">{rate.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTemplate.additionalRoomRates && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 font-helvetica">Additional Rates</h3>
                  </div>
                  <div className="px-6 py-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Additional room (unfurnished)</span>
                      <span className="text-gray-900 font-medium">
                        &pound;{selectedTemplate.additionalRoomRates.unfurnishedPerRoom}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Additional room (furnished)</span>
                      <span className="text-gray-900 font-medium">
                        &pound;{selectedTemplate.additionalRoomRates.furnishedPerRoom}
                      </span>
                    </div>
                    {selectedTemplate.cancellationFee != null && (
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                        <span className="text-gray-700">Cancellation fee</span>
                        <span className="text-gray-900 font-medium">
                          &pound;{selectedTemplate.cancellationFee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
            >
              <FiCopy className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Price List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
