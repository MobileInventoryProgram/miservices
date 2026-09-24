'use client';

import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

interface AssetCard {
  key: string;
  label: string;
  channel: string;
  width: number;
  height: number;
  tip: string;
}

const toggle = 'px-3 py-1.5 text-sm rounded transition-colors';

/** Generated brand assets with theme and personalisation toggles */
export default function BrandAssetGallery({ assets, territory }: { assets: AssetCard[]; territory: string | null }) {
  const [theme, setTheme] = useState<'light' | 'navy'>('light');
  const [personal, setPersonal] = useState(!!territory);

  const url = (key: string, download = false) =>
    `/api/members/assets/brand/${key}?theme=${theme}${personal ? '&personal=1' : ''}${download ? '&download=1' : ''}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="inline-flex rounded-md border border-gray-200 p-0.5" role="group" aria-label="Colour">
          {(['light', 'navy'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className={`${toggle} ${theme === value ? 'bg-brand-dark-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {value === 'light' ? 'Light' : 'Navy'}
            </button>
          ))}
        </div>
        {territory && (
          <div className="inline-flex rounded-md border border-gray-200 p-0.5" role="group" aria-label="Version">
            {[
              { value: false, label: 'General' },
              { value: true, label: `miServices ${territory}` },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setPersonal(option.value)}
                aria-pressed={personal === option.value}
                className={`${toggle} ${personal === option.value ? 'bg-brand-dark-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500">
          {personal && territory ? `Includes your franchise name and phone number.` : 'The Head Office version, without local details.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {assets.map((asset) => (
          <article key={asset.key} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-center bg-gray-100 p-4" style={{ minHeight: 180 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url(asset.key)}
                alt={`${asset.label} preview`}
                width={asset.width}
                height={asset.height}
                loading="lazy"
                className={`h-auto max-h-72 w-auto max-w-full shadow ${asset.width === asset.height ? 'rounded-full' : 'rounded'}`}
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-gray-900 font-helvetica">{asset.label}</h2>
                <span className="text-xs text-gray-500">
                  {asset.channel} · {asset.width} × {asset.height}px
                </span>
              </div>
              <p className="text-sm text-gray-600">{asset.tip}</p>
              <a
                href={url(asset.key, true)}
                className="mt-auto inline-flex items-center gap-2 self-start rounded-md bg-brand-light-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark-blue transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Download PNG
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
