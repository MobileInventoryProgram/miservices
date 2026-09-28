'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiMinus,
  FiMonitor,
  FiMousePointer,
  FiSave,
  FiSend,
  FiSmartphone,
  FiTrash2,
  FiType,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { campaignProblems, FIRST_NAME_TOKEN, newBlock, renderCampaign, STARTER_BLOCKS, type Block, type BlockType, type CompanyDetails } from '@/lib/marketing/blocks';
import type { ListKey } from '@/lib/marketing/lists';
import { MARKETING_BASE } from './tabs';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';
const smallButton = 'inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

export interface ComposerCampaign {
  id: string | null;
  name: string;
  list: ListKey;
  subject: string;
  previewText: string;
  blocks: Block[];
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'heading', label: 'Heading', icon: FiType },
  { type: 'text', label: 'Text', icon: FiType },
  { type: 'button', label: 'Button', icon: FiMousePointer },
  { type: 'image', label: 'Image', icon: FiImage },
  { type: 'divider', label: 'Divider', icon: FiMinus },
];

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

/** One block's fields */
function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const [area, setArea] = useState<HTMLTextAreaElement | null>(null);
  const insertName = () => {
    if (block.type !== 'text' && block.type !== 'heading') return;
    const at = area?.selectionStart ?? block.text.length;
    onChange({ ...block, text: block.text.slice(0, at) + FIRST_NAME_TOKEN + block.text.slice(at) });
  };

  switch (block.type) {
    case 'heading':
      return <input aria-label="Heading" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Heading" className={`${inputClass} font-semibold`} />;
    case 'text':
      return (
        <div className="space-y-1">
          <textarea
            ref={setArea}
            aria-label="Text"
            rows={Math.min(14, Math.max(4, block.text.split('\n').length + 1))}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Write here. Leave a blank line between paragraphs."
            className={inputClass}
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <button type="button" onClick={insertName} className="inline-flex items-center gap-1 text-brand-light-blue hover:text-brand-dark-blue">
              <FiUser className="h-3.5 w-3.5" /> Insert first name
            </button>
            <span>**bold** for bold text</span>
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input aria-label="Button text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Button text" className={inputClass} />
          <input aria-label="Button link" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://" className={inputClass} />
        </div>
      );
    case 'image':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input aria-label="Image address" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="Image address (https://…)" className={`${inputClass} sm:col-span-2`} />
          <input aria-label="Image description" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} placeholder="Describe the image" className={inputClass} />
          <input aria-label="Image link" value={block.link || ''} onChange={(e) => onChange({ ...block, link: e.target.value || undefined })} placeholder="Link when clicked (optional)" className={inputClass} />
        </div>
      );
    default:
      return <hr className="my-2 border-gray-200" />;
  }
}

export default function Composer({
  initial,
  company,
  lists,
  adminFirstName,
  adminEmail,
}: {
  initial: ComposerCampaign;
  company: CompanyDetails;
  lists: { key: ListKey; name: string; subscribers: number | null }[];
  adminFirstName: string;
  adminEmail: string;
}) {
  const router = useRouter();
  const [c, setC] = useState<ComposerCampaign>(initial.blocks.length ? initial : { ...initial, blocks: STARTER_BLOCKS.map((b) => ({ ...b })) });
  const [dirty, setDirty] = useState(!initial.id);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [width, setWidth] = useState<'desktop' | 'mobile'>('desktop');
  const [confirm, setConfirm] = useState<null | 'send' | 'delete'>(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [mode, setMode] = useState<'now' | 'later'>('now');

  const update = (next: Partial<ComposerCampaign>) => {
    setC((current) => ({ ...current, ...next }));
    setDirty(true);
    setNotice(null);
  };
  const setBlock = (i: number, b: Block) => update({ blocks: c.blocks.map((x, j) => (j === i ? b : x)) });
  const move = (i: number, by: number) => {
    const blocks = [...c.blocks];
    const [b] = blocks.splice(i, 1);
    blocks.splice(i + by, 0, b);
    update({ blocks });
  };

  const preview = useMemo(() => renderCampaign(c.blocks, { company, previewText: c.previewText, mode: 'preview', sampleFirstName: adminFirstName }).html, [c.blocks, c.previewText, company, adminFirstName]);
  const problems = campaignProblems(c);
  const chosenList = lists.find((l) => l.key === c.list);
  const payload = { name: c.name, list: c.list, subject: c.subject, previewText: c.previewText, blocks: c.blocks };

  /** Save to Resend; returns the campaign id */
  const save = async (): Promise<string> => {
    if (c.id && !dirty) return c.id;
    if (c.id) {
      await call(`/api/admin/marketing/campaigns/${c.id}`, 'PATCH', payload);
      setDirty(false);
      return c.id;
    }
    const { id } = await call('/api/admin/marketing/campaigns', 'POST', payload);
    setC((current) => ({ ...current, id }));
    setDirty(false);
    window.history.replaceState(null, '', `${MARKETING_BASE}/${id}`);
    return id;
  };

  const run = async (label: string, work: () => Promise<void>) => {
    setBusy(label);
    setNotice(null);
    try {
      await work();
    } catch (err) {
      setNotice({ tone: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setBusy(null);
    }
  };

  const onSave = () =>
    run('save', async () => {
      await save();
      setNotice({ tone: 'ok', text: 'Draft saved.' });
    });

  const onTest = () =>
    run('test', async () => {
      const { to } = await call('/api/admin/marketing/test', 'POST', payload);
      setNotice({ tone: 'ok', text: `Test sent to ${to}.` });
    });

  const onSend = () =>
    run('send', async () => {
      const id = await save();
      const at = mode === 'later' && scheduleAt ? new Date(scheduleAt).toISOString() : undefined;
      if (mode === 'later' && !at) throw new Error('Pick when to send it.');
      await call(`/api/admin/marketing/campaigns/${id}/send`, 'POST', at ? { scheduledAt: at } : {});
      setConfirm(null);
      router.push(`${MARKETING_BASE}/${id}`);
      router.refresh();
    });

  const onDelete = () =>
    run('delete', async () => {
      if (c.id) await call(`/api/admin/marketing/campaigns/${c.id}`, 'DELETE');
      router.push(MARKETING_BASE);
      router.refresh();
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Settings and content */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cm-name" className={labelClass}>
                Campaign name <span className="font-normal text-gray-400">(only you see this)</span>
              </label>
              <input id="cm-name" value={c.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Autumn landlord offer" className={inputClass} />
            </div>
            <div>
              <label htmlFor="cm-list" className={labelClass}>
                Send to
              </label>
              <select id="cm-list" value={c.list} onChange={(e) => update({ list: e.target.value as ListKey })} className={inputClass}>
                {lists.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.name}
                    {l.subscribers !== null ? ` (${l.subscribers.toLocaleString('en-GB')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="cm-subject" className={labelClass}>
              Subject line
            </label>
            <input id="cm-subject" value={c.subject} onChange={(e) => update({ subject: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="cm-preview" className={labelClass}>
              Preview text <span className="font-normal text-gray-400">(shown after the subject in most inboxes)</span>
            </label>
            <input id="cm-preview" value={c.previewText} onChange={(e) => update({ previewText: e.target.value })} className={inputClass} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 font-helvetica">Content</h2>
          <ol className="space-y-3">
            {c.blocks.map((b, i) => (
              <li key={b.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{BLOCK_TYPES.find((t) => t.type === b.type)?.label}</span>
                  <span className="flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                      <FiArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === c.blocks.length - 1} aria-label="Move down" className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                      <FiArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => update({ blocks: c.blocks.filter((_, j) => j !== i) })} aria-label="Remove" className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-700">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
                <BlockEditor block={b} onChange={(next) => setBlock(i, next)} />
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Add:</span>
            {BLOCK_TYPES.map((t) => (
              <button key={t.type} type="button" onClick={() => update({ blocks: [...c.blocks, newBlock(t.type)] })} className={smallButton}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Preview and actions */}
      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900 font-helvetica">Preview</h2>
          <div className="inline-flex rounded-lg bg-gray-100 p-1" role="group" aria-label="Preview width">
            {(['desktop', 'mobile'] as const).map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={width === w}
                onClick={() => setWidth(w)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${width === w ? 'bg-white text-brand-dark-blue shadow-sm' : 'text-gray-600'}`}
              >
                {w === 'desktop' ? <FiMonitor className="h-4 w-4" /> : <FiSmartphone className="h-4 w-4" />}
                {w === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-100 p-2 shadow-sm">
          <div className="mb-2 rounded bg-white px-3 py-2 text-xs text-gray-600">
            <p className="truncate">
              <strong className="text-gray-900">{c.subject || 'Subject line'}</strong>
              {c.previewText && <span className="text-gray-500"> — {c.previewText}</span>}
            </p>
          </div>
          <iframe
            title="Email preview"
            srcDoc={preview}
            sandbox=""
            className="mx-auto block h-[60vh] min-h-[420px] rounded bg-white transition-all"
            style={{ width: width === 'desktop' ? '100%' : 375, maxWidth: '100%' }}
          />
        </div>
        <p className="text-xs text-gray-500">
          The preview uses your first name. Each person sees their own, or “there” if we don’t have it. The unsubscribe link and company details are added
          automatically.
        </p>

        {notice && (
          <p className={`flex items-center gap-2 text-sm ${notice.tone === 'ok' ? 'text-green-700' : 'text-red-700'}`} role={notice.tone === 'ok' ? 'status' : 'alert'}>
            {notice.tone === 'ok' ? <FiCheckCircle className="h-4 w-4" /> : <FiAlertCircle className="h-4 w-4" />} {notice.text}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSave} disabled={!!busy || (!dirty && !!c.id)} className={smallButton}>
            <FiSave className="h-4 w-4" /> {busy === 'save' ? 'Saving…' : dirty || !c.id ? 'Save draft' : 'Saved'}
          </button>
          <button type="button" onClick={onTest} disabled={!!busy} className={smallButton} title={`Sends to ${adminEmail}`}>
            <FiSend className="h-4 w-4" /> {busy === 'test' ? 'Sending…' : 'Send me a test'}
          </button>
          <button
            type="button"
            onClick={() => setConfirm('send')}
            disabled={!!busy || problems.length > 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-dark-blue px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-light-blue disabled:opacity-50"
          >
            <FiSend className="h-4 w-4" /> Send or schedule…
          </button>
          {c.id && (
            <button type="button" onClick={() => setConfirm('delete')} disabled={!!busy} className="ml-auto inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-700">
              <FiTrash2 className="h-4 w-4" /> Delete draft
            </button>
          )}
        </div>
        {problems.length > 0 && (
          <ul className="list-disc space-y-0.5 pl-5 text-xs text-amber-800">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="confirm-title" className="text-lg font-semibold text-gray-900 font-helvetica">
                {confirm === 'send' ? 'Send this campaign?' : 'Delete this draft?'}
              </h2>
              <button type="button" onClick={() => setConfirm(null)} aria-label="Close" className="text-gray-400 hover:text-gray-700">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            {confirm === 'send' ? (
              <>
                <p className="text-sm text-gray-700">
                  <strong>{c.subject}</strong> goes to the <strong>{chosenList?.name}</strong> list
                  {chosenList?.subscribers !== null && chosenList?.subscribers !== undefined
                    ? `: about ${chosenList.subscribers.toLocaleString('en-GB')} ${chosenList.subscribers === 1 ? 'person' : 'people'}`
                    : ''}
                  . This can’t be undone once it’s sent.
                </p>
                <fieldset className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="when" checked={mode === 'now'} onChange={() => setMode('now')} /> Send now
                  </label>
                  <label className="flex flex-wrap items-center gap-2">
                    <input type="radio" name="when" checked={mode === 'later'} onChange={() => setMode('later')} /> <FiClock className="h-4 w-4 text-gray-400" /> Schedule for
                    <input
                      type="datetime-local"
                      aria-label="Send at"
                      value={scheduleAt}
                      onChange={(e) => {
                        setScheduleAt(e.target.value);
                        setMode('later');
                      }}
                      className={`${inputClass} w-auto`}
                    />
                  </label>
                </fieldset>
                {notice?.tone === 'error' && <p className="text-sm text-red-700">{notice.text}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setConfirm(null)} className={smallButton}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSend}
                    disabled={!!busy}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-dark-blue px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-light-blue disabled:opacity-50"
                  >
                    <FiSend className="h-4 w-4" /> {busy === 'send' ? 'Sending…' : mode === 'now' ? 'Send now' : 'Schedule'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700">The draft is removed from Resend. Nothing has been sent.</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setConfirm(null)} className={smallButton}>
                    Keep it
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={!!busy}
                    className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <FiTrash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
