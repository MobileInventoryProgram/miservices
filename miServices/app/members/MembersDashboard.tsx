import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
  FiAlertCircle,
  FiArrowRight,
  FiBarChart2,
  FiBook,
  FiCheckSquare,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiFileText,
  FiHelpCircle,
  FiImage,
  FiPlus,
  FiSearch,
  FiShield,
  FiSend,
  FiUserPlus,
  FiUsers,
} from 'react-icons/fi';
import FiPoundSign from '@/components/icons/FiPoundSign';
import PageHeader from '@/components/members/PageHeader';
import type { QuoteDashboard, QuoteSummary } from '@/lib/quote/quotes';
import { effectiveStatus, quoteClientName } from '@/lib/quote/types';
import QuoteStatusBadge from './quoting/QuoteStatusBadge';

export interface DashboardData {
  firstName: string;
  territory: string | null;
  isAdmin: boolean;
  /** Belongs to a franchise, so can create quotes and contacts */
  canCreate: boolean;
  quotes: QuoteDashboard | null;
  contacts: { total: number; newLeads: number } | null;
  documents: { total: number; newItems: { title: string; href: string; publishedAt: string }[] };
  drafts: { total: number; items: { title: string; slug: string; section: string; isNew: boolean }[] } | null;
  compliance:
    | { kind: 'franchise'; total: number; urgent: number; items: { title: string; state: string; due: string | null }[] }
    | { kind: 'admin'; total: number; notCompliant: number; awaitingReview: number }
    | null;
  /** Head Office: franchise contracts due for renewal or expired */
  contracts: { renewalDue: number; expired: number } | null;
}

type Tone = 'amber' | 'blue' | 'gray' | 'green' | 'red';

interface AttentionItem {
  key: string;
  icon: IconType;
  tone: Tone;
  title: string;
  detail: string;
  href: string;
}

const TONES: Record<Tone, string> = {
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-brand-light-blue',
  gray: 'bg-gray-100 text-gray-500',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
};

const UK = { timeZone: 'Europe/London' } as const;

function greeting(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { ...UK, hour: 'numeric', hour12: false }).format(now));
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

function shortDate(value?: string) {
  if (!value) return '—';
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return date.toLocaleDateString('en-GB', { ...UK, day: 'numeric', month: 'short' });
}

function daysSince(value?: string) {
  return value ? Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 86_400_000)) : 0;
}

const quoteLabel = (q: QuoteSummary) => `${q.reference || 'Quote'} · ${quoteClientName(q)}`;

/** Things worth doing next, most urgent first */
function attentionItems(data: DashboardData): AttentionItem[] {
  const items: AttentionItem[] = [];
  const c = data.compliance;
  if (c?.kind === 'franchise') {
    for (const i of c.items) {
      items.push({
        key: `comp-${i.title}`,
        icon: FiCheckSquare,
        tone: i.state === 'dueSoon' ? 'blue' : 'amber',
        title: i.state === 'returned' ? 'Action sent back by Head Office' : i.state === 'overdue' ? `Action overdue since ${shortDate(i.due || undefined)}` : `Action due ${shortDate(i.due || undefined)}`,
        detail: i.title,
        href: '/members/actions',
      });
    }
  } else if (c?.kind === 'admin') {
    if (c.awaitingReview) {
      items.push({ key: 'comp-review', icon: FiShield, tone: 'blue', title: `${c.awaitingReview} compliance submission${c.awaitingReview === 1 ? '' : 's'} to review`, detail: 'Approve, or send back with a note', href: '/members/franchisees/compliance/review' });
    }
    if (c.notCompliant) {
      items.push({ key: 'comp-behind', icon: FiShield, tone: 'amber', title: `${c.notCompliant} franchise${c.notCompliant === 1 ? '' : 's'} not compliant`, detail: 'See who is behind and send reminders', href: '/members/franchisees/compliance' });
    }
  }
  const k = data.contracts;
  if (k?.expired) {
    items.push({ key: 'contracts-expired', icon: FiFileText, tone: 'red', title: `${k.expired} contract${k.expired === 1 ? '' : 's'} expired`, detail: 'Renew or update the contract details', href: '/members/franchisees?filter=contracts' });
  }
  if (k?.renewalDue) {
    items.push({ key: 'contracts-renewal', icon: FiFileText, tone: 'amber', title: `${k.renewalDue} contract${k.renewalDue === 1 ? '' : 's'} due for renewal`, detail: 'Within the renewal notice period', href: '/members/franchisees?filter=contracts' });
  }
  for (const q of data.quotes?.expiringSoon || []) {
    items.push({ key: `exp-${q._id}`, icon: FiClock, tone: 'amber', title: `Expires ${shortDate(q.validUntil)}`, detail: quoteLabel(q), href: `/members/quoting/${q._id}` });
  }
  for (const q of data.quotes?.awaitingReply || []) {
    const days = daysSince(q.viewedAt);
    items.push({
      key: `view-${q._id}`,
      icon: FiEye,
      tone: 'blue',
      title: `Opened ${days} day${days === 1 ? '' : 's'} ago, no reply yet`,
      detail: quoteLabel(q),
      href: `/members/quoting/${q._id}`,
    });
  }
  for (const q of data.quotes?.staleDrafts || []) {
    items.push({ key: `draft-${q._id}`, icon: FiSend, tone: 'gray', title: 'Draft not sent yet', detail: quoteLabel(q), href: `/members/quoting/${q._id}/edit` });
  }
  for (const d of data.drafts?.items || []) {
    items.push({
      key: `doc-${d.slug}`,
      icon: FiEdit3,
      tone: 'gray',
      title: d.isNew ? 'New document not published' : 'Document changes not published',
      detail: d.title,
      href: `/members/documents/${d.section}/${d.slug}/edit`,
    });
  }
  for (const doc of data.documents.newItems.slice(0, 3)) {
    items.push({ key: `new-${doc.href}`, icon: FiBook, tone: 'green', title: `New document · ${shortDate(doc.publishedAt)}`, detail: doc.title, href: doc.href });
  }
  return items;
}

function StatCard({
  label,
  value,
  sub,
  href,
  icon: Icon,
  colour,
}: {
  label: string;
  value: number;
  sub?: string;
  href: string;
  icon: IconType;
  colour: string;
}) {
  return (
    <Link href={href} className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 font-helvetica">{value.toLocaleString('en-GB')}</p>
        </div>
        <span className={`${colour} rounded-lg p-2.5 text-white`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-500 group-hover:text-brand-dark-blue">{sub || ' '}</p>
    </Link>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900 font-helvetica">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Members Area home: headline numbers, recent quotes, things needing attention and shortcuts */
export default function MembersDashboard({ data }: { data: DashboardData }) {
  const { quotes, contacts, documents } = data;
  const attention = attentionItems(data);

  const actions: { href: string; label: string; icon: IconType }[] = [
    ...(data.canCreate
      ? [
          { href: '/members/quoting/new', label: 'New quote', icon: FiPlus },
          { href: '/members/contacts/new', label: 'New contact', icon: FiUserPlus },
        ]
      : []),
    { href: '/members/pricing', label: 'Pricing', icon: FiPoundSign as IconType },
    { href: '/members/assets/brand', label: 'Brand assets', icon: FiImage },
    ...(data.isAdmin
      ? [
          { href: '/members/documents', label: 'New document', icon: FiFileText },
          { href: '/members/servicem8', label: 'ServiceM8', icon: FiBarChart2 },
          { href: '/members/franchisees/compliance', label: 'Compliance', icon: FiShield },
        ]
      : []),
  ];

  const today = new Date().toLocaleDateString('en-GB', { ...UK, weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`${greeting()}, ${data.firstName}`}
        intro={
          <>
            {today}
            {data.territory && <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{data.territory}</span>}
          </>
        }
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Headline numbers */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${data.compliance ? 'lg:grid-cols-3 xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
          {quotes && (
            <>
              <StatCard label="Open quotes" value={quotes.open} sub="Sent and waiting for an answer" href="/members/quoting" icon={FiSend} colour="bg-blue-500" />
              <StatCard
                label="Accepted this month"
                value={quotes.acceptedThisMonth}
                sub="View accepted quotes"
                href="/members/quoting?status=accepted"
                icon={FiCheckCircle}
                colour="bg-green-500"
              />
            </>
          )}
          {contacts && (
            <StatCard
              label="Contacts"
              value={contacts.total}
              sub={contacts.newLeads ? `${contacts.newLeads} new lead${contacts.newLeads === 1 ? '' : 's'} this month` : 'No new leads this month'}
              href={contacts.newLeads ? '/members/contacts?status=lead' : '/members/contacts'}
              icon={FiUsers}
              colour="bg-amber-500"
            />
          )}
          {data.compliance?.kind === 'franchise' && (
            <StatCard
              label="Actions"
              value={data.compliance.total}
              sub={data.compliance.urgent ? `${data.compliance.urgent} overdue` : data.compliance.total ? 'Things Head Office needs from you' : 'All caught up'}
              href="/members/actions"
              icon={FiCheckSquare}
              colour={data.compliance.urgent ? 'bg-red-500' : 'bg-teal-500'}
            />
          )}
          {data.compliance?.kind === 'admin' && (
            <StatCard
              label="Compliant franchises"
              value={data.compliance.total - data.compliance.notCompliant}
              sub={`of ${data.compliance.total} · ${data.compliance.awaitingReview} to review`}
              href="/members/franchisees/compliance"
              icon={FiShield}
              colour={data.compliance.notCompliant ? 'bg-red-500' : 'bg-teal-500'}
            />
          )}
          <StatCard
            label="Documents"
            value={documents.total}
            sub={documents.newItems.length ? `${documents.newItems.length} new in the last 2 weeks` : 'Procedures, training and more'}
            href="/members/documents"
            icon={FiBook}
            colour="bg-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Recent quotes */}
          {quotes && (
            <div className="lg:col-span-3">
              <Panel
                title="Recent quotes"
                action={
                  <Link href="/members/quoting" className="inline-flex items-center gap-1 text-sm text-brand-light-blue hover:text-brand-dark-blue">
                    View all <FiArrowRight className="h-4 w-4" />
                  </Link>
                }
              >
                {quotes.recent.length ? (
                  <ul className="divide-y divide-gray-100">
                    {quotes.recent.map((q) => (
                      <li key={q._id}>
                        <Link href={`/members/quoting/${q._id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-brand-dark-blue">{q.reference || 'Quote'}</p>
                            <p className="truncate text-sm text-gray-500">
                              {quoteClientName(q)}
                              {data.isAdmin && q.franchise?.companyName && <span className="text-gray-400"> · {q.franchise.companyName}</span>}
                            </p>
                          </div>
                          <QuoteStatusBadge status={effectiveStatus(q)} />
                          <span className="hidden w-16 text-right text-sm text-gray-500 sm:block">{shortDate(q.updatedAt)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-gray-500">
                    No quotes yet.
                    {data.canCreate && (
                      <Link href="/members/quoting/new" className="ml-1 text-brand-light-blue hover:text-brand-dark-blue">
                        Create your first quote
                      </Link>
                    )}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {/* Needs attention */}
          <div className={quotes ? 'lg:col-span-2' : 'lg:col-span-5'}>
            <Panel title="Needs attention">
              {attention.length ? (
                <ul className="divide-y divide-gray-100">
                  {attention.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.key}>
                        <Link href={item.href} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50">
                          <span className={`mt-0.5 rounded-md p-1.5 ${TONES[item.tone]}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="truncate text-sm text-gray-500">{item.detail}</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                  {data.drafts && data.drafts.total > data.drafts.items.length && (
                    <li className="flex items-center gap-2 px-5 py-3 text-sm text-gray-500">
                      <FiAlertCircle className="h-4 w-4" />
                      {data.drafts.total - data.drafts.items.length} more document drafts waiting
                    </li>
                  )}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-gray-500">
                  <FiCheckCircle className="h-8 w-8 text-green-500" />
                  All caught up. Nothing needs your attention.
                </div>
              )}
            </Panel>
          </div>
        </div>

        {/* Help */}
        <form action="/members/help" className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <label htmlFor="dashboard-help" className="flex items-center gap-2 font-semibold text-gray-900 font-helvetica sm:w-44">
            <FiHelpCircle className="h-5 w-5 text-brand-light-blue" /> Need an answer?
          </label>
          <input
            id="dashboard-help"
            name="q"
            type="search"
            placeholder="Search the Help Centre, e.g. holiday, check-out, company van"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-light-blue focus:outline-none focus:ring-brand-light-blue"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-dark-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-light-blue">
            <FiSearch className="h-4 w-4" /> Search
          </button>
        </form>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 font-semibold text-gray-900 font-helvetica">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-4 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-brand-light-blue hover:text-brand-dark-blue hover:shadow-md"
                >
                  <Icon className="h-5 w-5 text-brand-light-blue" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
