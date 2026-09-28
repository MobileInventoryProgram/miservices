import { Metadata } from 'next';
import PageHeader from '@/components/members/PageHeader';
import Tabs from '@/components/members/Tabs';
import { ukToday } from '@/lib/dates';
import { reference } from '@/lib/servicem8/data';
import { addDays } from '@/lib/servicem8/timesheets';
import { adminOnly } from './params';
import RangeBar from './RangeBar';
import { SM8_TABS } from './tabs';

export const metadata: Metadata = {
  title: 'ServiceM8 | Members Area | miServices',
};

/** Head Office's read-only view of ServiceM8: tabs, and one date range shared by them */
export default async function ServiceM8Layout({ children }: { children: React.ReactNode }) {
  await adminOnly();
  const today = ukToday();
  const monthStart = `${today.slice(0, 7)}-01`;
  const lastMonthEnd = addDays(monthStart, -1);
  // The picker still works (as "All staff") if ServiceM8 can't be reached; the tab shows the error
  const staffOptions = await reference()
    .then((r) => r.data.activeStaff)
    .catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="ServiceM8" intro="A live, read-only view of ServiceM8. Nothing is copied into the Members Area.">
        <Tabs tabs={SM8_TABS} label="ServiceM8 sections" keepQuery={['from', 'to', 'staff']} />
      </PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <RangeBar
          today={today}
          staffOptions={staffOptions}
          presets={[
            { label: 'This month', from: monthStart, to: today },
            { label: 'Last month', from: `${lastMonthEnd.slice(0, 7)}-01`, to: lastMonthEnd },
            { label: 'Last 3 months', from: addDays(today, -90), to: today },
            { label: 'This year', from: `${today.slice(0, 4)}-01-01`, to: today },
            { label: 'Last 12 months', from: addDays(today, -364), to: today },
          ]}
        />
        {children}
      </div>
    </div>
  );
}
