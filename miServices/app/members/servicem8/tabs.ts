export const SM8_BASE = '/members/servicem8';

export const SM8_TABS = [
  { href: SM8_BASE, label: 'Overview', exact: true },
  { href: `${SM8_BASE}/pipeline`, label: 'Pipeline' },
  { href: `${SM8_BASE}/clients`, label: 'Clients' },
  { href: `${SM8_BASE}/timesheets`, label: 'Timesheets' },
  { href: `${SM8_BASE}/staff`, label: 'Staff' },
  { href: `${SM8_BASE}/money-owed`, label: 'Money owed' },
  { href: `${SM8_BASE}/queues`, label: 'Queues' },
  { href: `${SM8_BASE}/pricing`, label: 'Pricing' },
];

/** Tabs showing where things stand now, not tied to the date range */
export const SNAPSHOT_TABS = [`${SM8_BASE}/money-owed`, `${SM8_BASE}/queues`];
