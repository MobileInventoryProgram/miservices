import PageHeader from '@/components/members/PageHeader';

/** Shown while timesheets load from ServiceM8 (a long range can take a while) */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Staff Timesheets" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center gap-3 text-gray-500">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-dark-blue" aria-hidden="true" />
        <p>Loading timesheets from ServiceM8…</p>
      </div>
    </div>
  );
}
