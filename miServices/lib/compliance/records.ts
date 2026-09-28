import 'server-only';
import { newKey } from '@/lib/documents/standard';
import { isDate, ukToday } from '@/lib/dates';
import { sanityWriteClient } from '@/lib/sanity';
import { getComplianceForFranchise, type ComplianceItem } from './status';

/**
 * Creating and changing compliance records: a franchise's submissions, and
 * Head Office's approvals, returns and ticks.
 */

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 5;

const safe = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, '-');

/** One record per franchise, requirement and period */
export function recordId(franchiseId: string, requirementId: string, period: string) {
  return `complianceRecord-${safe(franchiseId)}-${safe(requirementId.replace(/^complianceRequirement-/, ''))}-${safe(period)}`;
}

/**
 * The checklist item a submission or tick is for, and the period to file it
 * under. Rolling items (insurance, yearly confirmations) start a new cycle
 * unless one is still waiting for review or was sent back.
 */
export async function findItem(franchiseId: string, requirementId: string, period: string | null) {
  const compliance = await getComplianceForFranchise(franchiseId);
  if (!compliance) return { error: 'Compliance does not apply to this franchise.' } as const;
  const items = compliance.items.filter((i) => i.requirement._id === requirementId);
  if (!items.length) return { error: 'That requirement was not found.' } as const;

  const item: ComplianceItem | undefined = period ? items.find((i) => i.periodKey === period) || items.find((i) => i.key.endsWith(':rolling')) : items[items.length - 1];
  if (!item) return { error: 'That period is not open.' } as const;

  const rolling = item.key.endsWith(':rolling');
  const reuse = item.record && (item.record.status === 'submitted' || item.record.status === 'returned');
  const filePeriod = rolling ? (reuse ? item.record!.period : `r-${ukToday()}`) : item.periodKey!;
  return { item, period: filePeriod, franchiseName: compliance.name } as const;
}

type Uploaded = { _type: 'complianceFile'; _key: string; name: string; asset: { _type: 'reference'; _ref: string } };

/** Upload a franchise's evidence files to the content store (served only through the access-checked route) */
export async function uploadEvidence(files: File[]): Promise<Uploaded[] | { error: string }> {
  if (files.length > MAX_FILES) return { error: `Up to ${MAX_FILES} files at a time.` };
  for (const file of files) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return { error: `${file.name}: please upload a PDF, JPEG, PNG or WebP file.` };
    if (file.size > MAX_FILE_BYTES) return { error: `${file.name} is over 10 MB.` };
  }
  const uploaded: Uploaded[] = [];
  for (const file of files) {
    const name = file.name.replace(/[^\w.\- ()]/g, '_').slice(0, 120) || 'file';
    const asset = await sanityWriteClient.assets.upload('file', Buffer.from(await file.arrayBuffer()), { filename: name, contentType: file.type });
    uploaded.push({ _type: 'complianceFile', _key: newKey(), name, asset: { _type: 'reference', _ref: asset._id } });
  }
  return uploaded;
}

interface SubmitInput {
  franchiseId: string;
  requirementId: string;
  period: string;
  by: string;
  note: string;
  expiresOn: string | null;
  files: Uploaded[];
  /** Keep files already on a returned submission */
  keepExisting: boolean;
}

/** A franchise submits (or resubmits) an item for review */
export async function submitRecord(input: SubmitInput) {
  const id = recordId(input.franchiseId, input.requirementId, input.period);
  const now = new Date().toISOString();
  const existing = await sanityWriteClient.fetch<{ files?: Uploaded[] } | null>(`*[_id == $id][0]{ files }`, { id });

  await sanityWriteClient
    .transaction()
    .createIfNotExists({
      _id: id,
      _type: 'complianceRecord',
      franchise: { _type: 'reference', _ref: input.franchiseId },
      requirement: { _type: 'reference', _ref: input.requirementId },
      period: input.period,
    })
    .patch(id, (p) =>
      p
        .set({
          status: 'submitted',
          files: [...(input.keepExisting ? existing?.files || [] : []), ...input.files],
          note: input.note,
          submittedBy: input.by,
          submittedAt: now,
          ...(input.expiresOn ? { expiresOn: input.expiresOn } : {}),
        })
        .unset(['reviewedBy', 'reviewedAt'])
        .setIfMissing({ history: [] })
        .append('history', [{ _key: newKey(), _type: 'complianceEvent', action: existing ? 'resubmitted' : 'submitted', by: input.by, at: now, note: input.note || null }])
    )
    .commit();
  return id;
}

/** Head Office approves or sends back a submission */
export async function reviewRecord(id: string, action: 'approve' | 'return', by: string, note: string) {
  const now = new Date().toISOString();
  await sanityWriteClient
    .patch(id)
    .set({ status: action === 'approve' ? 'approved' : 'returned', reviewedBy: by, reviewedAt: now, reviewNote: note })
    .setIfMissing({ history: [] })
    .append('history', [{ _key: newKey(), _type: 'complianceEvent', action: action === 'approve' ? 'approved' : 'returned', by, at: now, note: note || null }])
    .commit();
}

/** Head Office ticks an item done (fees, training…) or not applicable for one period, or undoes that */
export async function markByAdmin(input: {
  franchiseId: string;
  requirementId: string;
  period: string;
  action: 'done' | 'notApplicable' | 'undo';
  by: string;
  note: string;
  expiresOn: string | null;
}) {
  const id = recordId(input.franchiseId, input.requirementId, input.period);
  if (input.action === 'undo') {
    await sanityWriteClient.delete(id);
    return id;
  }
  const now = new Date().toISOString();
  await sanityWriteClient
    .transaction()
    .createIfNotExists({
      _id: id,
      _type: 'complianceRecord',
      franchise: { _type: 'reference', _ref: input.franchiseId },
      requirement: { _type: 'reference', _ref: input.requirementId },
      period: input.period,
    })
    .patch(id, (p) =>
      p
        .set({
          status: input.action === 'done' ? 'approved' : 'notApplicable',
          reviewedBy: input.by,
          reviewedAt: now,
          reviewNote: input.note,
          ...(input.expiresOn && isDate(input.expiresOn) ? { expiresOn: input.expiresOn } : {}),
        })
        .setIfMissing({ history: [] })
        .append('history', [
          { _key: newKey(), _type: 'complianceEvent', action: input.action === 'done' ? 'marked done' : 'marked not applicable', by: input.by, at: now, note: input.note || null },
        ])
    )
    .commit();
  return id;
}
