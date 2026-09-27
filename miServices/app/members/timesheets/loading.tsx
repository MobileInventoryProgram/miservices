/** Shown while timesheets load from ServiceM8 (a long range can take a while) */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Staff Timesheets</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center gap-3 text-gray-500">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-dark-blue" aria-hidden="true" />
        <p>Loading timesheets from ServiceM8…</p>
      </div>
    </div>
  );
}
