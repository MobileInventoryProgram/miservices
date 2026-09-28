import type { ComplianceItem, ItemState } from '@/lib/compliance/status';
import ItemRow from './ItemRow';

const GROUPS: { title: string; states: ItemState[]; open?: boolean; note?: string }[] = [
  { title: 'Needs action', states: ['overdue', 'returned', 'dueSoon'], open: true },
  { title: 'To do', states: ['todo'] },
  { title: 'Awaiting review', states: ['submitted'], note: 'Sent to Head Office. They’ll tick these off once checked.' },
  { title: 'Done', states: ['done'] },
  { title: 'Not applicable', states: ['notApplicable'] },
];

const ORDER: ItemState[] = ['overdue', 'returned', 'dueSoon', 'todo', 'submitted', 'done', 'notApplicable'];

/** A franchise's checklist, grouped by what needs doing */
export default function Checklist({ items, mode, franchiseId }: { items: ComplianceItem[]; mode: 'franchise' | 'admin'; franchiseId?: string }) {
  const sorted = [...items].sort(
    (a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || (a.due || '9999').localeCompare(b.due || '9999') || a.requirement.order - b.requirement.order
  );
  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const groupItems = sorted.filter((i) => group.states.includes(i.state));
        if (!groupItems.length) return null;
        return (
          <section key={group.title}>
            <h2 className="mb-1 font-semibold text-gray-900 font-helvetica">
              {group.title} <span className="font-normal text-gray-400">({groupItems.length})</span>
            </h2>
            {group.note && <p className="mb-2 text-sm text-gray-500">{group.note}</p>}
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              {groupItems.map((item) => (
                <ItemRow key={item.key} item={item} mode={mode} franchiseId={franchiseId} defaultOpen={group.open && groupItems.length <= 3} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
