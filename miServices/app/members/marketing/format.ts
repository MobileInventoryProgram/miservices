/** '2026-10-06 09:30:00.123+00' or ISO → '6 Oct 2026, 10:30' (UK time) */
export function when(stamp: string | null | undefined): string {
  if (!stamp) return '—';
  const d = new Date(stamp.includes('T') ? stamp : stamp.replace(' ', 'T').replace(/\+00$/, 'Z'));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
}
