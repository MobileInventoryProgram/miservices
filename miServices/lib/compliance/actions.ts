import type { ComplianceItem, FranchiseCompliance } from './status';

/**
 * A franchise's Actions: only what they have to do themselves, most urgent
 * first. Head Office's own ticks (fees, training) and anything already done,
 * sent or not applicable are left out.
 */
export function franchiseActions(compliance: FranchiseCompliance | null) {
  const items = compliance?.items || [];
  const rank = { returned: 0, overdue: 1, dueSoon: 2, todo: 3 } as Record<string, number>;
  const actions = items
    .filter((i) => i.requirement.evidence !== 'admin' && i.state in rank)
    .sort((a, b) => rank[a.state] - rank[b.state] || (a.due || '9999').localeCompare(b.due || '9999') || a.requirement.order - b.requirement.order);
  const waiting = items.filter((i) => i.state === 'submitted').length;
  const urgent = actions.filter((i) => i.state === 'overdue' || i.state === 'returned').length;
  return { actions, waiting, urgent };
}

export type ActionItem = ComplianceItem;
