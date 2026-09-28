const STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-50 text-brand-dark-blue border-blue-200' },
  queued: { label: 'Sending', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  sending: { label: 'Sending', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  sent: { label: 'Sent', className: 'bg-green-50 text-green-700 border-green-200' },
  canceled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function CampaignStatus({ status }: { status: string }) {
  const style = STYLES[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${style.className}`}>{style.label}</span>;
}
