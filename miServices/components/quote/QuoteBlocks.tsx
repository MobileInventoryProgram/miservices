import type { FlyerData } from '@/lib/flyer/data';
import { COLORS, TICK_PATH } from '@/lib/flyer/geometry';
import type { MiProgramTable } from '@/lib/quote/miprogram';
import type { TextBlock } from '@/lib/quote/template';

/** Quote content pieces shared by the slide views (text, price list, miProgram tiers). */

export function Blocks({ blocks }: { blocks: TextBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        block.type === 'paragraph' ? (
          <p key={i} className="whitespace-pre-line leading-relaxed text-gray-800">
            {block.text}
          </p>
        ) : (
          <ul key={i} className="space-y-2">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2.5 leading-relaxed text-gray-800">
                <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 flex-shrink-0" aria-hidden="true">
                  <path d={TICK_PATH} fill={COLORS.wave} />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

export function PricingTable({ pricing }: { pricing: FlyerData }) {
  const notes = [pricing.furnishedNote, pricing.flyerNote].filter(Boolean) as string[];
  return (
    <div className="mt-5 space-y-3">
      {notes.map((note) => (
        <p key={note} className="text-sm text-gray-700">
          {note}
        </p>
      ))}
      {pricing.table && (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.navy }} className="text-white">
                <th scope="col" className="px-3 py-2.5 text-left font-bold">
                  Property size
                </th>
                {pricing.table.columns.map((column) => (
                  <th key={column} scope="col" className="px-3 py-2.5 text-center font-bold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricing.table.rows.map((row, i) => (
                <tr key={row.size} className={i % 2 ? 'bg-blue-50/50' : 'bg-white'}>
                  <th scope="row" className="px-3 py-2 text-left font-normal text-gray-900">
                    <strong>{row.size}</strong> Bed
                    {row.maxRooms && <em className="ml-1 text-xs text-gray-500">{row.maxRooms}</em>}
                  </th>
                  {row.cells.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-2 text-center tabular-nums text-gray-900">
                      {cell.from && <em className="text-gray-500">From </em>}
                      <span className="font-bold">{cell.main}</span>
                      {cell.sub && <span className="text-xs text-gray-500"> / {cell.sub}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pricing.table?.dualPrices && <p className="text-xs italic text-gray-500">Prices shown as unfurnished / furnished.</p>}
      {pricing.extraRates.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
          {pricing.extraRates.map((rate) => (
            <li key={rate.label} className="flex items-baseline justify-between gap-4 px-3 py-2 text-sm">
              <span className="text-gray-800">{rate.label}</span>
              <span className="font-bold tabular-nums text-gray-900">{rate.price}</span>
            </li>
          ))}
        </ul>
      )}
      {pricing.extraRoomNote && <p className="text-sm text-gray-700">{pricing.extraRoomNote}</p>}
      <p className="text-xs italic text-gray-500">{pricing.settings.vatNote}</p>
    </div>
  );
}

export function MiProgramPrices({ table, compact = false }: { table: MiProgramTable; compact?: boolean }) {
  // Compact: smaller type and tighter cells, for the side-by-side slide layout
  const cell = compact ? 'px-2 py-1.5' : 'px-3 py-2';
  return (
    <div className={`${compact ? '' : 'mt-5 '}space-y-3`}>
      {table.callout && (
        <p className="rounded-md border px-4 py-3 text-sm font-bold" style={{ borderColor: COLORS.cyan, background: '#eef9fe', color: COLORS.navy }}>
          {table.callout}
        </p>
      )}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className={`w-full ${compact ? 'text-xs' : 'text-sm'}`}>
          <thead>
            <tr style={{ background: COLORS.navy }} className="text-white">
              <th scope="col" rowSpan={2} className={`${cell} text-left font-bold`}>
                Properties
              </th>
              <th scope="colgroup" colSpan={2} className={`${compact ? 'px-2 pt-1.5' : 'px-3 pt-2'} text-center font-bold`}>
                miProgram price
              </th>
              <th scope="colgroup" colSpan={2} className={`${compact ? 'px-2 pt-1.5' : 'px-3 pt-2'} text-center font-bold`} style={{ background: COLORS.wave }}>
                {compact ? `With ${table.discountPercent}% discount` : `With your ${table.discountPercent}% miServices discount`}
              </th>
            </tr>
            <tr style={{ background: COLORS.navy }} className="text-xs text-white/90">
              <th scope="col" className={`${compact ? 'px-2 pb-1.5' : 'px-3 pb-2'} text-center font-normal`}>Monthly</th>
              <th scope="col" className={`${compact ? 'px-2 pb-1.5' : 'px-3 pb-2'} text-center font-normal`}>Annual</th>
              <th scope="col" className={`${compact ? 'px-2 pb-1.5' : 'px-3 pb-2'} text-center font-normal`} style={{ background: COLORS.wave }}>Monthly</th>
              <th scope="col" className={`${compact ? 'px-2 pb-1.5' : 'px-3 pb-2'} text-center font-normal`} style={{ background: COLORS.wave }}>Annual</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr
                key={row.label}
                className={row.highlighted ? 'font-bold' : i % 2 ? 'bg-blue-50/50' : 'bg-white'}
                style={row.highlighted ? { background: '#dff3fc', boxShadow: `inset 3px 0 0 ${COLORS.cyan}` } : undefined}
              >
                <th scope="row" className={`${cell} text-left font-normal text-gray-900`}>
                  {row.highlighted ? <strong>{row.label} (your plan)</strong> : row.label}
                </th>
                <td className={`whitespace-nowrap ${cell} text-center tabular-nums text-gray-500 ${row.monthly.startsWith('£') ? 'line-through decoration-gray-300' : ''}`}>
                  {row.monthly}
                </td>
                <td className={`whitespace-nowrap ${cell} text-center tabular-nums text-gray-500 ${row.monthly.startsWith('£') ? 'line-through decoration-gray-300' : ''}`}>
                  {row.annual}
                </td>
                <td className={`whitespace-nowrap ${cell} text-center tabular-nums text-gray-900`}>{row.discountedMonthly}</td>
                <td className={`whitespace-nowrap ${cell} text-center tabular-nums text-gray-900`}>{row.discountedAnnual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        {table.note} Full details: {table.url}
      </p>
    </div>
  );
}
