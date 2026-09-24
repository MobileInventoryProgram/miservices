import { quoteStatusInfo, type QuoteStatus } from '@/lib/quote/types';

export default function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const info = quoteStatusInfo(status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${info.badge}`}>
      {info.label}
    </span>
  );
}
