/**
 * Preview switch: with FORMS_DISABLED=true the contact, pricing, prospectus
 * and sample-document forms accept submissions but send nothing on to the CRM
 * (Zapier). The booking form (ServiceM8) is not affected.
 */
export const formsDisabled = () => process.env.FORMS_DISABLED === 'true';

/** Send a form to its Zapier webhook, unless forms are switched off */
export async function sendToZapier(url: string | undefined, payload: unknown): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (formsDisabled()) {
    console.log('[forms disabled] not sent:', JSON.stringify(payload).slice(0, 200));
    return { ok: true, skipped: true };
  }
  if (!url) return { ok: false, error: 'Webhook not configured' };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.ok ? { ok: true } : { ok: false, error: await res.text() };
}
