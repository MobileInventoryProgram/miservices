/** Shown under the tabs while a tab pulls from ServiceM8 (a long range can take a few seconds) */
export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-dark-blue" aria-hidden="true" />
      <p>Pulling the latest from ServiceM8…</p>
    </div>
  );
}
