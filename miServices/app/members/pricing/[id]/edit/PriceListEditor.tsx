'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiTrash2,
  FiStar,
} from 'react-icons/fi';
import type { SanityServiceRow, SanityFlatRate, SanityAdditionalRoomRates } from '@/lib/sanity';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ORDER,
  BEDROOM_LABELS,
  BEDROOM_ORDER,
} from '@/lib/pricing';

interface PriceListEditorProps {
  listId: string;
  initialTitle: string;
  initialIsDefault: boolean;
  initialServiceRows: SanityServiceRow[];
  initialFlatRates: SanityFlatRate[];
  initialAdditionalRoomRates: SanityAdditionalRoomRates;
  initialCancellationFee: number;
}

export default function PriceListEditor({
  listId,
  initialTitle,
  initialIsDefault,
  initialServiceRows,
  initialFlatRates,
  initialAdditionalRoomRates,
  initialCancellationFee,
}: PriceListEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [serviceRows, setServiceRows] = useState<SanityServiceRow[]>(initialServiceRows);
  const [flatRates, setFlatRates] = useState<SanityFlatRate[]>(initialFlatRates);
  const [additionalRoomRates, setAdditionalRoomRates] = useState(initialAdditionalRoomRates);
  const [cancellationFee, setCancellationFee] = useState(initialCancellationFee);
  const [isDefault, setIsDefault] = useState(initialIsDefault);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const cellKey = (serviceType: string, bedrooms: string, field: string) =>
    `${serviceType}-${bedrooms}-${field}`;

  const startEdit = (key: string, currentValue: number) => {
    setEditingCell(key);
    setEditValue(String(currentValue));
  };

  const commitEdit = useCallback(
    (serviceType: string, bedrooms: string, field: 'unfurnishedPrice' | 'furnishedPrice') => {
      const parsed = parseInt(editValue, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        setServiceRows((prev) =>
          prev.map((row) => {
            if (row.serviceType === serviceType && row.bedrooms === bedrooms) {
              return { ...row, [field]: parsed };
            }
            return row;
          })
        );
      }
      setEditingCell(null);
      setEditValue('');
    },
    [editValue]
  );

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/members/pricing/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          serviceRows,
          flatRates,
          additionalRoomRates,
          cancellationFee,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save price list');
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/members/pricing/${listId}/default`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to set as default');
      } else {
        setIsDefault(true);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this price list? This cannot be undone.')) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/members/pricing/${listId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete price list');
        setIsLoading(false);
      } else {
        router.push('/members/pricing');
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const renderPriceCell = (
    serviceType: string,
    bedrooms: string,
    field: 'unfurnishedPrice' | 'furnishedPrice',
    price: number
  ) => {
    const key = cellKey(serviceType, bedrooms, field);
    const editing = editingCell === key;

    if (editing) {
      return (
        <td key={key} className="px-3 py-2">
          <input
            type="number"
            min="0"
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => commitEdit(serviceType, bedrooms, field)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit(serviceType, bedrooms, field);
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-20 px-2 py-1 text-sm border border-brand-light-blue rounded focus:outline-none focus:ring-1 focus:ring-brand-light-blue"
          />
        </td>
      );
    }

    return (
      <td key={key} className="px-3 py-2">
        <button
          type="button"
          onClick={() => startEdit(key, price)}
          className="text-sm tabular-nums cursor-pointer rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100 transition-colors"
          title="Click to edit"
        >
          &pound;{price}
        </button>
      </td>
    );
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
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Edit Price List</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
            <FiAlertCircle className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
            <FiCheck className="flex-shrink-0" />
            <span className="text-sm">Price list saved successfully.</span>
          </div>
        )}

        {/* Title & Default */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="listTitle" className="block text-sm font-medium text-gray-700 mb-1">
                List Name
              </label>
              <input
                id="listTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue text-sm"
              />
            </div>
            <div className="flex items-end">
              {isDefault ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-md border border-amber-200">
                  <FiStar className="w-4 h-4" />
                  Default Price List
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSetDefault}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <FiStar className="w-4 h-4" />
                  Set as Default
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Service Tables */}
        {SERVICE_TYPE_ORDER.map((serviceType) => {
          const rows = serviceRows.filter((r) => r.serviceType === serviceType);
          if (rows.length === 0) return null;

          const hasFurnished = rows.some((r) => r.furnishedPrice != null);

          return (
            <div key={serviceType} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 font-helvetica">
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
                          {renderPriceCell(serviceType, bed, 'unfurnishedPrice', row.unfurnishedPrice)}
                          {hasFurnished && renderPriceCell(serviceType, bed, 'furnishedPrice', row.furnishedPrice ?? 0)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Flat Rates */}
        {flatRates.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-helvetica">Flat Rates</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              {flatRates.map((rate, index) => (
                <div key={rate._key} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={rate.name}
                    onChange={(e) => {
                      const updated = [...flatRates];
                      updated[index] = { ...updated[index], name: e.target.value };
                      setFlatRates(updated);
                    }}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">&pound;</span>
                    <input
                      type="number"
                      min="0"
                      value={rate.price}
                      onChange={(e) => {
                        const updated = [...flatRates];
                        updated[index] = { ...updated[index], price: Number(e.target.value) || 0 };
                        setFlatRates(updated);
                      }}
                      className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                    />
                  </div>
                  <input
                    type="text"
                    value={rate.unit || ''}
                    onChange={(e) => {
                      const updated = [...flatRates];
                      updated[index] = { ...updated[index], unit: e.target.value || undefined };
                      setFlatRates(updated);
                    }}
                    placeholder="unit"
                    className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-helvetica">Additional Rates</h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Additional room (unfurnished)</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">&pound;</span>
                <input
                  type="number"
                  min="0"
                  value={additionalRoomRates.unfurnishedPerRoom}
                  onChange={(e) =>
                    setAdditionalRoomRates({
                      ...additionalRoomRates,
                      unfurnishedPerRoom: Number(e.target.value) || 0,
                    })
                  }
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Additional room (furnished)</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">&pound;</span>
                <input
                  type="number"
                  min="0"
                  value={additionalRoomRates.furnishedPerRoom}
                  onChange={(e) =>
                    setAdditionalRoomRates({
                      ...additionalRoomRates,
                      furnishedPerRoom: Number(e.target.value) || 0,
                    })
                  }
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-700">Cancellation fee</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">&pound;</span>
                <input
                  type="number"
                  min="0"
                  value={cancellationFee}
                  onChange={(e) => setCancellationFee(Number(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Click any price cell to edit. All prices exclude VAT at the prevailing rate.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !title.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
          >
            <FiSave className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
