import { daysBetween } from '@/lib/dates';
import type { ItemState } from './status';

/** Just what the reminder rules need to know about an item */
type ReminderItem = { state: ItemState; due: string | null; requirement: { evidence: string; remindEvery: number } };

/** Items a franchise could do something about now */
export function actionable(item: ReminderItem) {
  return item.requirement.evidence !== 'admin' && (item.state === 'overdue' || item.state === 'dueSoon' || item.state === 'returned');
}

/**
 * Whether the automatic run should remind about an item today:
 * - due soon: once when it comes into the reminder window, and again on the day
 * - overdue or sent back: now, then every `remindEvery` days
 */
export function dueForAutoReminder(item: ReminderItem, lastSent: string | null, today: string): boolean {
  if (!actionable(item)) return false;
  const sinceLast = lastSent ? daysBetween(lastSent.slice(0, 10), today) : null;
  if (item.state === 'dueSoon') {
    if (sinceLast === null) return true;
    return item.due === today && sinceLast > 0;
  }
  return sinceLast === null || sinceLast >= Math.max(1, item.requirement.remindEvery);
}

