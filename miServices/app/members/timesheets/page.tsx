import { redirect } from 'next/navigation';

/** Timesheets moved into the ServiceM8 section; keep old links and bookmarks working */
export default function OldTimesheets({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value) q.set(k, value);
  }
  const s = q.toString();
  redirect(`/members/servicem8/timesheets${s ? `?${s}` : ''}`);
}
