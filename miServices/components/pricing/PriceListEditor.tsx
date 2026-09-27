'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiAlertCircle,
  FiCheck,
  FiPercent,
  FiPlus,
  FiPrinter,
  FiRotateCcw,
  FiSave,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import PageHeader, { headerSecondaryButton } from '@/components/members/PageHeader';
import type { SanityAdditionalRoomRates, SanityFlatRate, SanityServiceRow } from '@/lib/sanity';
import { BEDROOM_LABELS, BEDROOM_ORDER, SERVICE_TYPE_LABELS, SERVICE_TYPE_ORDER, adjustPrice, formatPrice } from '@/lib/pricing';

type ServiceType = SanityServiceRow['serviceType'];
type Bedrooms = SanityServiceRow['bedrooms'];

/** Max rooms used when a size is added and no other service has that size yet */
const DEFAULT_MAX_ROOMS: Record<Bedrooms, number> = { studio_1: 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13 };
const STANDARD_SIZES: Bedrooms[] = ['studio_1', '2', '3', '4', '5'];

const inputClass =
  'px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const cardClass = 'bg-white rounded-lg shadow-sm border border-gray-200';
const smallButton =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50';

interface Prices {
  serviceRows: SanityServiceRow[];
  flatRates: SanityFlatRate[];
  additionalRoomRates: SanityAdditionalRoomRates;
  cancellationFee: number;
}

export interface PriceListEditorProps {
  mode: 'franchise' | 'admin';
  initialTitle: string;
  initialIsDefault: boolean;
  initialServiceRows: SanityServiceRow[];
  initialFlatRates: SanityFlatRate[];
  initialAdditionalRoomRates: SanityAdditionalRoomRates;
  initialCancellationFee: number;
  /** Admin only */
  initialAvailableToFranchisees?: boolean;
  initialFlyerNote?: string;
  saveUrl: string;
  /** Franchise only: makes this the franchise's default list */
  setDefaultUrl?: string;
  backHref: string;
  backLabel: string;
  /** Read-only view of this list, for the breadcrumbs */
  viewHref?: string;
  /** This list's leaflet (A5 flyer and PDFs) */
  leafletHref?: string;
}

/** Price box that accepts pence; the list updates as you type */
function PriceInput({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  const [draft, setDraft] = useState(String(value));
  const parse = (text: string) => {
    const parsed = Math.round(parseFloat(text) * 100) / 100;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };
  // Follow changes made elsewhere, e.g. "Adjust all prices"
  useEffect(() => {
    if (parse(draft) !== value) setDraft(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-500">&pound;</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.5"
        aria-label={label}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          const parsed = parse(e.target.value);
          if (parsed !== null && parsed !== value) onChange(parsed);
        }}
        onBlur={() => setDraft(String(value))}
        className={`${inputClass} w-24 py-1.5 tabular-nums`}
      />
    </div>
  );
}

/** Service rows in a stable order: services, then sizes */
function sortRows(rows: SanityServiceRow[]) {
  return [...rows].sort(
    (a, b) =>
      SERVICE_TYPE_ORDER.indexOf(a.serviceType) - SERVICE_TYPE_ORDER.indexOf(b.serviceType) ||
      BEDROOM_ORDER.indexOf(a.bedrooms) - BEDROOM_ORDER.indexOf(b.bedrooms)
  );
}

export default function PriceListEditor(props: PriceListEditorProps) {
  const { mode, saveUrl, setDefaultUrl, backHref, backLabel, viewHref, leafletHref } = props;
  const isAdmin = mode === 'admin';
  const router = useRouter();

  const [title, setTitle] = useState(props.initialTitle);
  const [serviceRows, setServiceRows] = useState<SanityServiceRow[]>(sortRows(props.initialServiceRows));
  const [flatRates, setFlatRates] = useState<SanityFlatRate[]>(props.initialFlatRates || []);
  const [additionalRoomRates, setAdditionalRoomRates] = useState(props.initialAdditionalRoomRates);
  const [cancellationFee, setCancellationFee] = useState(props.initialCancellationFee);
  const [isDefault, setIsDefault] = useState(props.initialIsDefault);
  const [availableToFranchisees, setAvailableToFranchisees] = useState(!!props.initialAvailableToFranchisees);
  const [flyerNote, setFlyerNote] = useState(props.initialFlyerNote || '');

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [adjustPercent, setAdjustPercent] = useState('');
  const [adjustFee, setAdjustFee] = useState(false);
  const [adjustNotice, setAdjustNotice] = useState('');
  // Prices before the last across-the-board change, so it can be undone
  const [beforeAdjust, setBeforeAdjust] = useState<Prices | null>(null);

  // Unsaved-changes tracking
  const payload = useMemo(
    () => ({
      title,
      serviceRows: sortRows(serviceRows),
      flatRates,
      additionalRoomRates,
      cancellationFee,
      ...(isAdmin ? { isDefault, availableToFranchisees, flyerNote } : {}),
    }),
    [title, serviceRows, flatRates, additionalRoomRates, cancellationFee, isAdmin, isDefault, availableToFranchisees, flyerNote]
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(payload));
  const dirty = JSON.stringify(payload) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const changed = () => setSuccess(false);

  // ─── Across-the-board % change ─────────────────────────────────

  const percent = Number(adjustPercent);
  const percentValid = adjustPercent.trim() !== '' && Number.isFinite(percent) && percent !== 0 && percent > -100 && percent <= 100;
  const exampleRow = serviceRows.find((r) => r.unfurnishedPrice > 0) || serviceRows[0];

  /** Change every price by a percentage, rounded to the nearest 50p */
  const applyAdjustment = () => {
    if (!percentValid) return;
    setBeforeAdjust({ serviceRows, flatRates, additionalRoomRates, cancellationFee });
    setServiceRows((rows) =>
      rows.map((row) => ({
        ...row,
        unfurnishedPrice: adjustPrice(row.unfurnishedPrice, percent),
        furnishedPrice: row.furnishedPrice != null ? adjustPrice(row.furnishedPrice, percent) : row.furnishedPrice,
      }))
    );
    setFlatRates((rates) => rates.map((rate) => ({ ...rate, price: adjustPrice(rate.price, percent) })));
    setAdditionalRoomRates((rates) => ({
      unfurnishedPerRoom: adjustPrice(rates.unfurnishedPerRoom, percent),
      furnishedPerRoom: adjustPrice(rates.furnishedPerRoom, percent),
    }));
    if (adjustFee) setCancellationFee((fee) => adjustPrice(fee, percent));
    setAdjustNotice(
      `All prices ${percent > 0 ? 'increased' : 'reduced'} by ${Math.abs(percent)}%${adjustFee ? ', including the cancellation fee' : ''}. Check them below, then click Save Changes.`
    );
    setAdjustPercent('');
    changed();
  };

  const undoAdjustment = () => {
    if (!beforeAdjust) return;
    setServiceRows(beforeAdjust.serviceRows);
    setFlatRates(beforeAdjust.flatRates);
    setAdditionalRoomRates(beforeAdjust.additionalRoomRates);
    setCancellationFee(beforeAdjust.cancellationFee);
    setBeforeAdjust(null);
    setAdjustNotice('Price change undone.');
  };

  // ─── Services and sizes ────────────────────────────────────────

  const usedServices = SERVICE_TYPE_ORDER.filter((s) => serviceRows.some((r) => r.serviceType === s));
  const unusedServices = SERVICE_TYPE_ORDER.filter((s) => !usedServices.includes(s));

  const maxRoomsFor = (bedrooms: Bedrooms) =>
    serviceRows.find((r) => r.bedrooms === bedrooms && r.maxRooms > 0)?.maxRooms ?? DEFAULT_MAX_ROOMS[bedrooms];

  const newRow = (serviceType: ServiceType, bedrooms: Bedrooms, furnished: boolean): SanityServiceRow => ({
    _key: `${serviceType}-${bedrooms}`,
    serviceType,
    bedrooms,
    maxRooms: maxRoomsFor(bedrooms),
    unfurnishedPrice: 0,
    ...(furnished ? { furnishedPrice: 0 } : {}),
  });

  const updateRow = (serviceType: ServiceType, bedrooms: Bedrooms, patch: Partial<SanityServiceRow>) => {
    setServiceRows((rows) => rows.map((r) => (r.serviceType === serviceType && r.bedrooms === bedrooms ? { ...r, ...patch } : r)));
    changed();
  };

  const addService = (serviceType: ServiceType) => {
    setServiceRows((rows) => sortRows([...rows, ...STANDARD_SIZES.map((b) => newRow(serviceType, b, false))]));
    changed();
  };

  const removeService = (serviceType: ServiceType) => {
    setServiceRows((rows) => rows.filter((r) => r.serviceType !== serviceType));
    changed();
  };

  const addSize = (serviceType: ServiceType, bedrooms: Bedrooms) => {
    const furnished = serviceRows.some((r) => r.serviceType === serviceType && r.furnishedPrice != null);
    setServiceRows((rows) => sortRows([...rows, newRow(serviceType, bedrooms, furnished)]));
    changed();
  };

  const removeSize = (serviceType: ServiceType, bedrooms: Bedrooms) => {
    setServiceRows((rows) => rows.filter((r) => !(r.serviceType === serviceType && r.bedrooms === bedrooms)));
    changed();
  };

  /** Turning furnished prices on starts each at the unfurnished price */
  const setFurnished = (serviceType: ServiceType, on: boolean) => {
    setServiceRows((rows) =>
      rows.map((r) => {
        if (r.serviceType !== serviceType) return r;
        if (on) return { ...r, furnishedPrice: r.furnishedPrice ?? r.unfurnishedPrice };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { furnishedPrice, ...rest } = r;
        return rest;
      })
    );
    changed();
  };

  // ─── Flat rates ────────────────────────────────────────────────

  const updateFlatRate = (index: number, patch: Partial<SanityFlatRate>) => {
    setFlatRates((rates) => rates.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    changed();
  };
  const addFlatRate = () => {
    setFlatRates((rates) => [...rates, { _key: `flat-${Date.now().toString(36)}`, name: '', price: 0 }]);
    changed();
  };
  const removeFlatRate = (index: number) => {
    setFlatRates((rates) => rates.filter((_, i) => i !== index));
    changed();
  };

  // ─── Save / default / delete ───────────────────────────────────

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(saveUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to save price list');
      } else {
        setSavedSnapshot(JSON.stringify(payload));
        setBeforeAdjust(null);
        setAdjustNotice('');
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async () => {
    if (!setDefaultUrl) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(setDefaultUrl, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(saveUrl, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to delete price list');
        setIsLoading(false);
        setConfirmDelete(false);
      } else {
        setSavedSnapshot(JSON.stringify(payload)); // nothing left to warn about
        router.push(backHref);
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // The saved default can't be deleted until another list is the default
  const savedIsDefault = isAdmin && JSON.parse(savedSnapshot).isDefault === true;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader width="5xl"
        title={isAdmin ? 'Edit Standard Price List' : 'Edit Price List'}
        intro={
          isAdmin && (
            <span className="block text-sm max-w-2xl">
              Head Office standard list. Changes don&apos;t affect franchises&apos; own copies, or quotes already sent.
            </span>
          )
        }
        breadcrumbs={[{ label: backLabel, href: backHref }, { label: props.initialTitle, href: viewHref }, { label: 'Edit' }]}
        actions={
          leafletHref &&
          (dirty ? (
            // The leaflet is built from the saved list, so unsaved changes wouldn't show on it yet
            <span className={`${headerSecondaryButton} cursor-not-allowed opacity-60`} title="Save first so the leaflet shows your changes">
              <FiPrinter className="w-4 h-4" />
              Generate leaflet
            </span>
          ) : (
            <Link href={leafletHref} className={headerSecondaryButton}>
              <FiPrinter className="w-4 h-4" />
              Generate leaflet
            </Link>
          ))
        }
      />
      {leafletHref && dirty && (
        <p className="mx-auto max-w-5xl px-4 pt-3 text-right text-xs text-gray-500 sm:px-6 lg:px-8">Save first so the leaflet shows your changes.</p>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Details */}
        <div className={`${cardClass} p-6 space-y-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="listTitle" className="block text-sm font-medium text-gray-700 mb-1">
                List Name
              </label>
              <input
                id="listTitle"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  changed();
                }}
                className={`${inputClass} w-full shadow-sm`}
              />
            </div>
            {!isAdmin && (
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
            )}
            {isAdmin && (
              <div>
                <label htmlFor="flyerNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Flyer note <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="flyerNote"
                  type="text"
                  value={flyerNote}
                  maxLength={200}
                  placeholder="e.g. Please add £12 for furnished properties"
                  onChange={(e) => {
                    setFlyerNote(e.target.value);
                    changed();
                  }}
                  className={`${inputClass} w-full shadow-sm`}
                />
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={availableToFranchisees}
                  onChange={(e) => {
                    setAvailableToFranchisees(e.target.checked);
                    changed();
                  }}
                />
                <span>
                  <span className="font-medium text-gray-900">Available to franchisees</span>
                  <span className="block text-gray-500">Franchisees can view it, quote from it and copy it to make their own.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={isDefault}
                  onChange={(e) => {
                    setIsDefault(e.target.checked);
                    changed();
                  }}
                />
                <span>
                  <span className="font-medium text-gray-900">System default</span>
                  <span className="block text-gray-500">Marks this as Head Office&apos;s main standard list. Only one list can be the default.</span>
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Adjust all prices */}
        <div className={`${cardClass} p-6`}>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 font-helvetica">
            <FiPercent className="w-5 h-5 text-brand-light-blue" />
            Adjust all prices
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Increase (or reduce, with a minus) every price on this list by a percentage. Each price is rounded to the nearest 50p.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="adjustPercent" className="block text-sm font-medium text-gray-700 mb-1">
                Change by
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="adjustPercent"
                  type="number"
                  step="0.5"
                  min="-99"
                  max="100"
                  placeholder="e.g. 5"
                  value={adjustPercent}
                  onChange={(e) => setAdjustPercent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyAdjustment()}
                  className={`${inputClass} w-24`}
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
              <input type="checkbox" checked={adjustFee} onChange={(e) => setAdjustFee(e.target.checked)} />
              Include cancellation fee
            </label>
            <button
              type="button"
              onClick={applyAdjustment}
              disabled={!percentValid}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50 transition-colors"
            >
              Apply to all prices
            </button>
            {beforeAdjust && (
              <button type="button" onClick={undoAdjustment} className={`${smallButton} py-2 text-gray-700 bg-gray-100 hover:bg-gray-200`}>
                <FiRotateCcw className="w-4 h-4" />
                Undo
              </button>
            )}
          </div>
          {percentValid && exampleRow && (
            <p className="mt-3 text-sm text-gray-600">
              For example: {BEDROOM_LABELS[exampleRow.bedrooms]} {SERVICE_TYPE_LABELS[exampleRow.serviceType].toLowerCase()}{' '}
              {formatPrice(exampleRow.unfurnishedPrice)} → <strong>{formatPrice(adjustPrice(exampleRow.unfurnishedPrice, percent))}</strong>
            </p>
          )}
          {adjustNotice && (
            <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800" role="status">
              {adjustNotice}
            </p>
          )}
        </div>

        {/* Services */}
        {usedServices.map((serviceType) => {
          const rows = serviceRows.filter((r) => r.serviceType === serviceType);
          const hasFurnished = rows.some((r) => r.furnishedPrice != null);
          const unusedSizes = BEDROOM_ORDER.filter((b) => !rows.some((r) => r.bedrooms === b));
          const label = SERVICE_TYPE_LABELS[serviceType];

          return (
            <div key={serviceType} className={`${cardClass} overflow-hidden`}>
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900 font-helvetica">{label}</h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={hasFurnished} onChange={(e) => setFurnished(serviceType, e.target.checked)} />
                    Furnished prices
                  </label>
                  <button
                    type="button"
                    onClick={() => removeService(serviceType)}
                    className={`${smallButton} text-red-600 hover:bg-red-50`}
                    aria-label={`Remove ${label}`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Property size</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Max rooms</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{hasFurnished ? 'Unfurnished' : 'Price'}</th>
                      {hasFurnished && <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Furnished</th>}
                      <th className="px-4 py-2">
                        <span className="sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row) => {
                      const size = BEDROOM_LABELS[row.bedrooms];
                      return (
                        <tr key={row.bedrooms}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{size}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              aria-label={`${label} ${size} max rooms`}
                              value={row.maxRooms}
                              onChange={(e) => updateRow(serviceType, row.bedrooms, { maxRooms: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
                              className={`${inputClass} w-20 py-1.5`}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <PriceInput
                              label={`${label} ${size} ${hasFurnished ? 'unfurnished price' : 'price'}`}
                              value={row.unfurnishedPrice}
                              onChange={(v) => updateRow(serviceType, row.bedrooms, { unfurnishedPrice: v })}
                            />
                          </td>
                          {hasFurnished && (
                            <td className="px-4 py-2">
                              <PriceInput
                                label={`${label} ${size} furnished price`}
                                value={row.furnishedPrice ?? 0}
                                onChange={(v) => updateRow(serviceType, row.bedrooms, { furnishedPrice: v })}
                              />
                            </td>
                          )}
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeSize(serviceType, row.bedrooms)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label={`Remove ${size} from ${label}`}
                              title="Remove this size"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {unusedSizes.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Add a size:</span>
                  {unusedSizes.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => addSize(serviceType, b)}
                      className={`${smallButton} py-1 text-brand-dark-blue bg-white border border-gray-200 hover:bg-blue-50`}
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      {BEDROOM_LABELS[b]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {unusedServices.length > 0 && (
          <div className={`${cardClass} border-dashed px-6 py-4 flex flex-wrap items-center gap-3`}>
            <label htmlFor="addService" className="text-sm font-medium text-gray-700">
              Add a service
            </label>
            <select
              id="addService"
              value=""
              onChange={(e) => e.target.value && addService(e.target.value as ServiceType)}
              className={`${inputClass} bg-white`}
            >
              <option value="">Choose a service…</option>
              {unusedServices.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_TYPE_LABELS[s]}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500">Starts with Studio/1 to 5 Bed at £0 — then enter the prices.</span>
          </div>
        )}

        {/* Flat rates */}
        <div className={`${cardClass} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-helvetica">Flat Rates</h3>
              <p className="text-sm text-gray-500">Fixed-price extras, e.g. a commercial inspection per hour.</p>
            </div>
            <button type="button" onClick={addFlatRate} className={`${smallButton} text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}>
              <FiPlus className="w-4 h-4" />
              Add flat rate
            </button>
          </div>
          {flatRates.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-500">No flat rates.</p>
          ) : (
            <div className="px-6 py-4 space-y-3">
              {flatRates.map((rate, index) => (
                <div key={rate._key} className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={rate.name}
                    placeholder="Name"
                    aria-label="Flat rate name"
                    onChange={(e) => updateFlatRate(index, { name: e.target.value })}
                    className={`${inputClass} flex-1 min-w-[12rem] py-1.5`}
                  />
                  <PriceInput
                    label={`${rate.name || 'Flat rate'} price`}
                    value={rate.price}
                    onChange={(v) => updateFlatRate(index, { price: v })}
                  />
                  <input
                    type="text"
                    value={rate.unit || ''}
                    placeholder="unit, e.g. per hour"
                    aria-label="Flat rate unit"
                    onChange={(e) => updateFlatRate(index, { unit: e.target.value || undefined })}
                    className={`${inputClass} w-36 py-1.5`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFlatRate(index)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Remove ${rate.name || 'flat rate'}`}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional rates */}
        <div className={`${cardClass} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-helvetica">Additional Rates</h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-700">Additional room (unfurnished)</span>
              <PriceInput
                label="Additional room unfurnished"
                value={additionalRoomRates.unfurnishedPerRoom}
                onChange={(v) => {
                  setAdditionalRoomRates((r) => ({ ...r, unfurnishedPerRoom: v }));
                  changed();
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-700">Additional room (furnished)</span>
              <PriceInput
                label="Additional room furnished"
                value={additionalRoomRates.furnishedPerRoom}
                onChange={(v) => {
                  setAdditionalRoomRates((r) => ({ ...r, furnishedPerRoom: v }));
                  changed();
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-700">Cancellation fee</span>
              <PriceInput
                label="Cancellation fee"
                value={cancellationFee}
                onChange={(v) => {
                  setCancellationFee(v);
                  changed();
                }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">All prices exclude VAT at the prevailing rate.</p>

        {/* Actions — kept in view while editing a long list */}
        <div className="sticky bottom-0 -mx-4 sm:mx-0 border-t sm:border sm:rounded-lg border-gray-200 bg-white/95 backdrop-blur px-4 py-3 shadow-sm space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md flex items-center gap-2" role="alert">
              <FiAlertCircle className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !title.trim() || !dirty}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
            >
              <FiSave className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            {dirty ? (
              <span className="text-sm text-amber-700">Unsaved changes</span>
            ) : (
              success && (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700" role="status">
                  <FiCheck className="w-4 h-4" /> Saved
                </span>
              )
            )}
            <div className="ml-auto flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <span className="text-sm text-gray-700">Delete this price list?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className={`${smallButton} py-2 text-white bg-red-600 hover:bg-red-700`}
                  >
                    Yes, delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className={`${smallButton} py-2 text-gray-700 bg-gray-100 hover:bg-gray-200`}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isLoading || savedIsDefault}
                  title={savedIsDefault ? 'Make another list the system default before deleting this one' : undefined}
                  className={`${smallButton} py-2 text-red-600 bg-white border border-red-200 hover:bg-red-50`}
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
