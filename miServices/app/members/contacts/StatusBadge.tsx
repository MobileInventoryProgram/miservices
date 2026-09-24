import { contactStatus } from '@/lib/crm/options';

export default function StatusBadge({ status }: { status?: string }) {
  const s = contactStatus(status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${s.badge}`}>
      {s.label}
    </span>
  );
}
