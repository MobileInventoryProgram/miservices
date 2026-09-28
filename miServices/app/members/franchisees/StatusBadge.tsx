import type { FranchiseStatus } from '@/lib/franchisees/admin';

const STYLES: Record<FranchiseStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-green-50 text-green-700 border-green-200' },
  hidden: { label: 'Hidden', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

/** Live on Our Network, hidden while being set up, or deactivated */
export default function FranchiseStatusBadge({ status }: { status: FranchiseStatus }) {
  const s = STYLES[status];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
}
