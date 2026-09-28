import { newKey } from '@/lib/documents/standard';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_EVIDENCE, COMPLIANCE_FREQUENCIES } from './options';

const int = (value: unknown, min: number, max: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && value !== '' && value !== null && value !== undefined ? Math.min(max, Math.max(min, n)) : null;
};

/** A requirement from Head Office's form, or what's wrong with it */
export function readRequirementInput(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
  if (!title) return { error: 'Please give it a title.' } as const;
  const category = COMPLIANCE_CATEGORIES.find((c) => c.value === body.category)?.value;
  const frequency = COMPLIANCE_FREQUENCIES.find((f) => f.value === body.frequency)?.value;
  const evidence = COMPLIANCE_EVIDENCE.find((e) => e.value === body.evidence)?.value;
  if (!category || !frequency || !evidence) return { error: 'Please choose a category, how often, and how it is completed.' } as const;

  const sources = Array.isArray(body.sources)
    ? body.sources
        .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object' && typeof (s as Record<string, unknown>).documentId === 'string')
        .slice(0, 10)
        .map((s) => ({
          documentId: String(s.documentId),
          headingKey: typeof s.headingKey === 'string' && s.headingKey ? s.headingKey : undefined,
          headingText: typeof s.headingText === 'string' && s.headingText ? s.headingText.slice(0, 200) : undefined,
        }))
    : [];

  return {
    input: {
      title,
      description: typeof body.description === 'string' ? body.description.trim().slice(0, 1500) : '',
      category,
      frequency,
      evidence,
      askExpiry: evidence === 'upload' && body.askExpiry === true,
      dueWithinDays: frequency === 'once' || frequency === 'ongoing' || frequency === 'annual' ? int(body.dueWithinDays, 0, 730) : null,
      monthlyDay: frequency === 'monthly' ? int(body.monthlyDay, 0, 28) ?? 0 : null,
      monthOffset: frequency === 'monthly' && body.monthOffset === true,
      weeklyDay: frequency === 'weekly' ? int(body.weeklyDay, 1, 7) ?? 5 : null,
      annualMonth: frequency === 'annual' ? int(body.annualMonth, 1, 12) : null,
      annualDay: frequency === 'annual' ? int(body.annualDay, 1, 31) : null,
      remindBefore: int(body.remindBefore, 0, 60) ?? 7,
      remindEvery: int(body.remindEvery, 1, 60) ?? 7,
      sources,
    },
  } as const;
}

export type RequirementInput = Extract<ReturnType<typeof readRequirementInput>, { input: unknown }>['input'];

/** The stored fields for a requirement (shared with PATCH) */
export function requirementFields(input: RequirementInput) {
  const { sources, ...rest } = input;
  return {
    ...rest,
    sources: sources.map((s) => ({
      _type: 'complianceSource',
      _key: newKey(),
      document: { _type: 'reference', _ref: s.documentId },
      ...(s.headingKey ? { headingKey: s.headingKey, headingText: s.headingText || '' } : {}),
    })),
  };
}
