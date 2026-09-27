'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  EditorProvider,
  PortableTextEditable,
  defineSchema,
  useEditor,
  useEditorSelector,
  type PortableTextBlock,
  type RenderAnnotationFunction,
  type RenderBlockFunction,
  type RenderDecoratorFunction,
  type RenderListItemFunction,
  type RenderStyleFunction,
} from '@portabletext/editor';
import { EventListenerPlugin } from '@portabletext/editor/plugins';
import * as selectors from '@portabletext/editor/selectors';
import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowUp,
  FiBold,
  FiCheck,
  FiEdit2,
  FiEye,
  FiGrid,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiRotateCcw,
  FiSave,
  FiSend,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import DocumentBody, { DocContacts, DocTable, imageSize } from '@/components/documents/DocumentBody';
import DocumentContents from '@/components/documents/DocumentContents';
import { ContactsEditor, ImageEditor, TableEditor, uploadDocumentImage } from '@/components/documents/BlockEditors';
import { DOC_CLASS } from '@/components/documents/typography';
import { urlFor } from '@/lib/sanity-image';
import { buildOutline, headingAnchor, newKey, type DocBlock, type DocContactsBlock, type DocImageBlock, type DocTableBlock } from '@/lib/documents/standard';

/** The document standard, enforced by the editor itself */
const schemaDefinition = defineSchema({
  styles: [{ name: 'normal', title: 'Paragraph' }, { name: 'h2', title: 'Section' }, { name: 'h3', title: 'Subsection' }],
  lists: [{ name: 'bullet', title: 'Bullets' }, { name: 'number', title: 'Numbered' }],
  decorators: [{ name: 'strong', title: 'Bold' }, { name: 'em', title: 'Italic' }],
  annotations: [{ name: 'link', title: 'Link', fields: [{ name: 'href', type: 'string' }] }],
  blockObjects: [
    { name: 'image', title: 'Image', fields: [{ name: 'asset', type: 'object' }, { name: 'alt', type: 'string' }, { name: 'caption', type: 'string' }] },
    { name: 'table', title: 'Table', fields: [{ name: 'headerRow', type: 'boolean' }, { name: 'rows', type: 'array' }] },
    { name: 'contacts', title: 'Contact cards', fields: [{ name: 'people', type: 'array' }] },
  ],
});

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const toolButton = 'inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded px-2 text-sm font-medium transition-colors disabled:opacity-40';
const toolIdle = 'text-gray-700 hover:bg-gray-100';
const toolActive = 'bg-brand-light-blue/10 text-brand-dark-blue';

export interface DocumentEditorProps {
  id: string;
  slug: string;
  viewHref: string | null;
  listHref: string;
  subcategories: Record<string, string>;
  initial: {
    title: string;
    description: string;
    subcategory: string;
    order: number;
    numberHeadings: boolean;
    isPublished: boolean;
    body: DocBlock[];
  };
  draftRev: string | null;
  publishedRev: string | null;
  hasDraft: boolean;
  hasPublished: boolean;
  lastSaved?: string;
}

type EditingObject = { key: string; type: 'image' | 'table' | 'contacts' } | null;

// ─── Toolbar ────────────────────────────────────────────────────

function Toolbar({ onInsert, onInsertImage }: { onInsert: (block: DocBlock) => void; onInsertImage: (file: File) => void }) {
  const editor = useEditor();
  const style = useEditorSelector(editor, selectors.getActiveStyle);
  const bold = useEditorSelector(editor, selectors.isActiveDecorator('strong'));
  const italic = useEditorSelector(editor, selectors.isActiveDecorator('em'));
  const bullet = useEditorSelector(editor, selectors.isActiveListItem('bullet'));
  const numbered = useEditorSelector(editor, selectors.isActiveListItem('number'));
  const link = useEditorSelector(editor, selectors.isActiveAnnotation('link'));
  const expanded = useEditorSelector(editor, selectors.isSelectionExpanded);
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const keep = (e: React.MouseEvent) => e.preventDefault(); // keep the text selection
  const send = (event: Parameters<typeof editor.send>[0]) => {
    editor.send(event);
    editor.send({ type: 'focus' });
  };

  const applyLink = () => {
    let url = href.trim();
    if (!url) return;
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url)) url = url.includes('@') ? `mailto:${url}` : `https://${url}`;
    send({ type: 'annotation.add', annotation: { name: 'link', value: { href: url } } });
    setLinkOpen(false);
    setHref('');
  };

  const styleButton = (name: 'normal' | 'h2' | 'h3', label: string) => (
    <button
      type="button"
      onMouseDown={keep}
      onClick={() => send({ type: 'style.add', style: name })}
      aria-pressed={(style || 'normal') === name}
      className={`${toolButton} ${(style || 'normal') === name ? toolActive : toolIdle}`}
    >
      {label}
    </button>
  );

  return (
    <div className="sticky top-16 z-20 -mx-6 mb-6 border-b border-gray-200 bg-white/95 px-4 py-2 backdrop-blur sm:-mx-10 sm:px-8">
      <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Formatting">
        {styleButton('normal', 'Paragraph')}
        {styleButton('h2', 'Section')}
        {styleButton('h3', 'Subsection')}
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button type="button" onMouseDown={keep} onClick={() => send({ type: 'decorator.toggle', decorator: 'strong' })} aria-pressed={bold} aria-label="Bold" title="Bold (⌘B)" className={`${toolButton} ${bold ? toolActive : toolIdle}`}>
          <FiBold className="h-4 w-4" />
        </button>
        <button type="button" onMouseDown={keep} onClick={() => send({ type: 'decorator.toggle', decorator: 'em' })} aria-pressed={italic} aria-label="Italic" title="Italic (⌘I)" className={`${toolButton} ${italic ? toolActive : toolIdle}`}>
          <FiItalic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={keep}
          onClick={() => (link ? send({ type: 'annotation.remove', annotation: { name: 'link' } }) : setLinkOpen((o) => !o))}
          disabled={!link && !expanded}
          aria-pressed={link}
          title={link ? 'Remove link' : expanded ? 'Add a link' : 'Select some text to link it'}
          className={`${toolButton} ${link ? toolActive : toolIdle}`}
        >
          <FiLink className="h-4 w-4" />
          {link ? 'Unlink' : 'Link'}
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button type="button" onMouseDown={keep} onClick={() => send({ type: 'list item.toggle', listItem: 'bullet' })} aria-pressed={bullet} className={`${toolButton} ${bullet ? toolActive : toolIdle}`}>
          <FiList className="h-4 w-4" /> Bullets
        </button>
        <button type="button" onMouseDown={keep} onClick={() => send({ type: 'list item.toggle', listItem: 'number' })} aria-pressed={numbered} className={`${toolButton} ${numbered ? toolActive : toolIdle}`}>
          1. Numbered
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button type="button" onMouseDown={keep} onClick={() => fileInput.current?.click()} className={`${toolButton} ${toolIdle}`}>
          <FiImage className="h-4 w-4" /> Image
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onInsertImage(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onMouseDown={keep}
          onClick={() =>
            onInsert({
              _type: 'table',
              _key: newKey(),
              headerRow: true,
              rows: [
                { _type: 'tableRow', _key: newKey(), cells: ['Heading', 'Heading'] },
                { _type: 'tableRow', _key: newKey(), cells: ['', ''] },
              ],
            })
          }
          className={`${toolButton} ${toolIdle}`}
        >
          <FiGrid className="h-4 w-4" /> Table
        </button>
        <button
          type="button"
          onMouseDown={keep}
          onClick={() => onInsert({ _type: 'contacts', _key: newKey(), people: [] })}
          className={`${toolButton} ${toolIdle}`}
        >
          <FiUsers className="h-4 w-4" /> Contacts
        </button>
      </div>
      {linkOpen && (
        <div className="mt-2 flex items-center gap-2">
          <input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              }
              if (e.key === 'Escape') setLinkOpen(false);
            }}
            placeholder="Web address, email or phone"
            aria-label="Link address"
            className={`${inputClass} max-w-md py-1.5`}
          />
          <button type="button" onClick={applyLink} className={`${toolButton} bg-brand-light-blue text-white hover:bg-brand-dark-blue`}>
            Add link
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className={`${toolButton} ${toolIdle}`} aria-label="Cancel">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Frame around an image/table/contacts block in the editor, with its actions */
function ObjectFrame({ label, selected, children, onEdit, onMove, onRemove }: { label: string; selected: boolean; children: ReactNode; onEdit: () => void; onMove: (by: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className={`group relative my-4 rounded-md ring-2 transition ${selected ? 'ring-brand-light-blue' : 'ring-transparent hover:ring-gray-200'}`} contentEditable={false}>
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1 opacity-0 shadow-sm transition group-hover:opacity-100 focus-within:opacity-100">
        <span className="px-1.5 text-xs font-medium text-gray-500">{label}</span>
        <button type="button" onClick={onEdit} className={`${toolButton} ${toolIdle}`}>
          <FiEdit2 className="h-3.5 w-3.5" /> Edit
        </button>
        <button type="button" onClick={() => onMove(-1)} className={`${toolButton} ${toolIdle}`} aria-label={`Move ${label} up`}>
          <FiArrowUp className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => onMove(1)} className={`${toolButton} ${toolIdle}`} aria-label={`Move ${label} down`}>
          <FiArrowDown className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onRemove} className={`${toolButton} text-red-600 hover:bg-red-50`} aria-label={`Remove ${label}`}>
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div onDoubleClick={onEdit}>{children}</div>
    </div>
  );
}

/** Opens the table/image/contacts editors and writes their changes back into the document */
function ObjectEditors({ editing, body, onClose }: { editing: EditingObject; body: DocBlock[]; onClose: () => void }) {
  const editor = useEditor();
  if (!editing) return null;
  const block = body.find((b) => b._key === editing.key);
  if (!block) return null;
  const save = (props: Record<string, unknown>) => {
    editor.send({ type: 'block.set', at: [{ _key: editing.key }], props });
    onClose();
  };
  if (editing.type === 'table') return <TableEditor value={block as DocTableBlock} onSave={save} onClose={onClose} />;
  if (editing.type === 'image') return <ImageEditor value={block as DocImageBlock} onSave={save} onClose={onClose} />;
  return <ContactsEditor value={block as DocContactsBlock} onSave={save} onClose={onClose} />;
}

/** Inserts new blocks (from the toolbar) through the editor */
function useInsert(setEditing: (e: EditingObject) => void, setError: (e: string) => void) {
  const editor = useEditor();
  const insert = useCallback(
    (block: DocBlock) => {
      editor.send({ type: 'insert.block', block: block as unknown as PortableTextBlock, placement: 'auto' });
      if (block._type !== 'block') setEditing({ key: block._key, type: block._type });
    },
    [editor, setEditing]
  );
  const insertImage = useCallback(
    async (file: File) => {
      setError('');
      try {
        const ref = await uploadDocumentImage(file);
        insert({ _type: 'image', _key: newKey(), asset: { _type: 'reference', _ref: ref } });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Image upload failed');
      }
    },
    [insert, setError]
  );
  return { insert, insertImage };
}

function EditorArea({
  body,
  numbers,
  markers,
  setEditing,
  setError,
}: {
  body: DocBlock[];
  numbers: Map<string, string>;
  markers: Map<string, string>;
  setEditing: (e: EditingObject) => void;
  setError: (e: string) => void;
}) {
  const editor = useEditor();
  const { insert, insertImage } = useInsert(setEditing, setError);

  const renderStyle: RenderStyleFunction = (props) => {
    const key = props.block._key;
    if (props.value === 'h2' || props.value === 'h3') {
      const number = numbers.get(key);
      return (
        <div
          id={headingAnchor(key)}
          data-number={number || undefined}
          className={`${props.value === 'h2' ? DOC_CLASS.section : DOC_CLASS.subsection} ${number ? 'before:mr-2 before:tabular-nums before:text-brand-light-blue before:content-[attr(data-number)]' : ''}`}
        >
          {props.children}
        </div>
      );
    }
    return <div className={props.block.listItem ? '' : DOC_CLASS.paragraph}>{props.children}</div>;
  };

  const renderListItem: RenderListItemFunction = (props) => (
    <div
      data-marker={markers.get(props.block._key) || '•'}
      className={`relative my-1 leading-relaxed text-gray-800 before:absolute before:-left-6 before:w-5 before:text-right before:text-brand-light-blue before:content-[attr(data-marker)] ${props.level > 1 ? 'ml-12' : 'ml-6'}`}
    >
      {props.children}
    </div>
  );

  const renderDecorator: RenderDecoratorFunction = (props) => (props.value === 'strong' ? <strong>{props.children}</strong> : <em>{props.children}</em>);

  const renderAnnotation: RenderAnnotationFunction = (props) => (
    <span className={DOC_CLASS.link} title={(props.value as { href?: string }).href}>
      {props.children}
    </span>
  );

  const renderBlock: RenderBlockFunction = (props) => {
    const value = props.value as unknown as DocBlock;
    if (value._type === 'block') return <div>{props.children}</div>;
    const at: [{ _key: string }] = [{ _key: value._key }];
    const frame = (label: string, type: 'image' | 'table' | 'contacts', content: ReactNode) => (
      <ObjectFrame
        label={label}
        selected={props.selected}
        onEdit={() => setEditing({ key: value._key, type })}
        onMove={(by) => editor.send({ type: by < 0 ? 'move.block up' : 'move.block down', at })}
        onRemove={() => editor.send({ type: 'delete.block', at })}
      >
        {content}
      </ObjectFrame>
    );
    if (value._type === 'table') return frame('Table', 'table', <DocTable value={value} />);
    if (value._type === 'contacts')
      return frame(
        'Contact cards',
        'contacts',
        value.people?.length ? <DocContacts value={value} /> : <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No contacts yet — click Edit to add people.</p>
      );
    if (value._type === 'image' && value.asset?._ref) {
      const { width } = imageSize(value.asset._ref);
      return frame(
        'Image',
        'image',
        <figure className={DOC_CLASS.figure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urlFor(value).width(Math.min(width, 900)).fit('max').auto('format').url()} alt={value.alt || ''} className={DOC_CLASS.image} style={{ maxWidth: width }} />
          {value.caption && <figcaption className={DOC_CLASS.caption}>{value.caption}</figcaption>}
        </figure>
      );
    }
    return <div>{props.children}</div>;
  };

  return (
    <>
      <Toolbar onInsert={insert} onInsertImage={insertImage} />
      <PortableTextEditable
        aria-label="Document text"
        className="min-h-[50vh] outline-none"
        hotkeys={{ marks: { 'mod+b': 'strong', 'mod+i': 'em' } }}
        renderStyle={renderStyle}
        renderListItem={renderListItem}
        renderDecorator={renderDecorator}
        renderAnnotation={renderAnnotation}
        renderBlock={renderBlock}
        renderPlaceholder={() => <span className="text-gray-400">Start writing…</span>}
      />
      {body.length === 0 && <p className="text-sm text-gray-400">The document is empty.</p>}
    </>
  );
}

/**
 * Pasted headings are mapped to the standard before the editor reads them:
 * H1/H2 → Section, H3–H6 → Subsection, quotes → paragraphs. Everything else
 * outside the standard (fonts, colours, underline…) the editor drops itself.
 */
function standardisePastedHtml(html: string): string {
  return html
    .replace(/<(\/?)h1\b/gi, '<$1h2')
    .replace(/<(\/?)h[4-6]\b/gi, '<$1h3')
    .replace(/<(\/?)blockquote\b/gi, '<$1p');
}

const REWRITTEN = Symbol('rewritten');

function onPasteCapture(e: React.ClipboardEvent<HTMLDivElement>) {
  const native = e.nativeEvent as ClipboardEvent & { [REWRITTEN]?: boolean };
  const html = e.clipboardData?.getData('text/html');
  if (native[REWRITTEN] || !html) return;
  const cleaned = standardisePastedHtml(html);
  if (cleaned === html || typeof DataTransfer === 'undefined') return;
  e.preventDefault();
  e.stopPropagation();
  const data = new DataTransfer();
  data.setData('text/html', cleaned);
  data.setData('text/plain', e.clipboardData.getData('text/plain'));
  const replay = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }) as ClipboardEvent & { [REWRITTEN]?: boolean };
  replay[REWRITTEN] = true;
  e.target.dispatchEvent(replay);
}

/** List markers for the editor: bullets, and numbers counted within each list */
function listMarkers(body: DocBlock[]): Map<string, string> {
  const markers = new Map<string, string>();
  const counters: number[] = [];
  for (const block of body) {
    if (block._type !== 'block' || !block.listItem) {
      counters.length = 0;
      continue;
    }
    const level = block.level || 1;
    counters.length = level;
    if (block.listItem === 'number') {
      counters[level - 1] = (counters[level - 1] || 0) + 1;
      const n = counters[level - 1];
      markers.set(block._key, level > 1 ? `${String.fromCharCode(96 + ((n - 1) % 26) + 1)}.` : `${n}.`);
    } else {
      counters[level - 1] = 0;
      markers.set(block._key, level > 1 ? '◦' : '•');
    }
  }
  return markers;
}

// ─── Page ───────────────────────────────────────────────────────

export default function DocumentEditor(props: DocumentEditorProps) {
  const { id, slug, listHref, subcategories } = props;
  const router = useRouter();

  const [title, setTitle] = useState(props.initial.title);
  const [description, setDescription] = useState(props.initial.description);
  const [subcategory, setSubcategory] = useState(props.initial.subcategory);
  const [order, setOrder] = useState(String(props.initial.order));
  const [numberHeadings, setNumberHeadings] = useState(props.initial.numberHeadings);
  const [isPublished, setIsPublished] = useState(props.initial.isPublished);
  const [body, setBody] = useState<DocBlock[]>(props.initial.body);

  const [draftRev, setDraftRev] = useState(props.draftRev);
  const [publishedRev, setPublishedRev] = useState(props.publishedRev);
  const [hasDraft, setHasDraft] = useState(props.hasDraft);
  const [hasPublished, setHasPublished] = useState(props.hasPublished);
  const [viewHref, setViewHref] = useState(props.viewHref);

  const [busy, setBusy] = useState<'' | 'save' | 'publish' | 'discard' | 'delete'>('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<'' | 'discard' | 'delete'>('');
  const [editing, setEditing] = useState<EditingObject>(null);
  const [preview, setPreview] = useState(false);

  const payload = useMemo(
    () => ({ title, description, subcategory, order: Number(order) || 0, numberHeadings, isPublished, body }),
    [title, description, subcategory, order, numberHeadings, isPublished, body]
  );
  const serialized = JSON.stringify(payload);
  const [savedSnapshot, setSavedSnapshot] = useState(serialized);
  const dirty = serialized !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const { sections, numbers } = useMemo(() => buildOutline(body, numberHeadings), [body, numberHeadings]);
  const markers = useMemo(() => listMarkers(body), [body]);

  const saveDraft = async (): Promise<boolean> => {
    setBusy('save');
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/documents/${id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, draftRev }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to save the draft');
        return false;
      }
      setDraftRev(data.draftRev);
      setHasDraft(true);
      setSavedSnapshot(serialized);
      setNotice('Draft saved. Members still see the published version until you publish.');
      return true;
    } catch {
      setError('An error occurred. Please try again.');
      return false;
    } finally {
      setBusy('');
    }
  };

  const publish = async () => {
    if ((dirty || !hasDraft) && !(await saveDraft())) return;
    setBusy('publish');
    setError('');
    try {
      const res = await fetch(`/api/admin/documents/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedRev }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to publish');
        return;
      }
      setPublishedRev(data.publishedRev);
      setDraftRev(null);
      setHasDraft(false);
      setHasPublished(true);
      setViewHref(`/members/documents/${subcategory}/${slug}`);
      setNotice(isPublished ? 'Published — members now see this version.' : 'Published, but hidden from members (Visible to members is off).');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const discard = async () => {
    setBusy('discard');
    setError('');
    const res = await fetch(`/api/admin/documents/${id}/draft`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed to discard the draft');
      setBusy('');
      setConfirm('');
      return;
    }
    setSavedSnapshot(serialized); // nothing to warn about when leaving
    window.location.reload();
  };

  const remove = async () => {
    setBusy('delete');
    setError('');
    const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed to delete the document');
      setBusy('');
      setConfirm('');
      return;
    }
    setSavedSnapshot(serialized);
    router.push(listHref);
    router.refresh();
  };

  const scrollTo = (anchor: string) => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const status = !hasPublished
    ? { text: 'Not published yet', className: 'bg-amber-100 text-amber-900' }
    : hasDraft || dirty
      ? { text: 'Unpublished changes', className: 'bg-amber-100 text-amber-900' }
      : { text: 'Published', className: 'bg-green-100 text-green-800' };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader width="6xl"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Edit document
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>{status.text}</span>
          </span>
        }
        breadcrumbs={[
          { label: 'Documents', href: '/members/documents' },
          { label: subcategories[props.initial.subcategory] || 'Documents', href: listHref },
          { label: props.initial.title || 'Untitled document', href: viewHref || undefined },
          { label: 'Edit' },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Details */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4" aria-label="Document details">
          <div>
            <label htmlFor="doc-title" className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input id="doc-title" value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} className={`${inputClass} text-lg font-semibold`} />
          </div>
          <div>
            <label htmlFor="doc-description" className="mb-1 block text-sm font-medium text-gray-700">
              Summary <span className="font-normal text-gray-400">(shown on the document list)</span>
            </label>
            <textarea id="doc-description" rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="doc-section" className="mb-1 block text-sm font-medium text-gray-700">
                Section
              </label>
              <select id="doc-section" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={`${inputClass} bg-white`}>
                {Object.entries(subcategories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doc-order" className="mb-1 block text-sm font-medium text-gray-700">
                Position in list
              </label>
              <input id="doc-order" type="number" min="0" max="999" value={order} onChange={(e) => setOrder(e.target.value)} className={inputClass} />
            </div>
            <label className="flex items-start gap-2 pt-6 text-sm">
              <input type="checkbox" className="mt-0.5" checked={numberHeadings} onChange={(e) => setNumberHeadings(e.target.checked)} />
              <span>
                <span className="font-medium text-gray-900">Number headings</span>
                <span className="block text-xs text-gray-500">1, 1.1, 1.2… worked out automatically</span>
              </span>
            </label>
            <label className="flex items-start gap-2 pt-6 text-sm">
              <input type="checkbox" className="mt-0.5" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              <span>
                <span className="font-medium text-gray-900">Visible to members</span>
                <span className="block text-xs text-gray-500">Off hides it once published</span>
              </span>
            </label>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            {sections.length > 0 ? (
              <DocumentContents sections={sections} onNavigate={scrollTo} />
            ) : (
              <p className="text-sm text-gray-500 lg:sticky lg:top-24">Add a Section heading and the contents list builds itself.</p>
            )}
          </div>

          <EditorProvider initialConfig={{ schemaDefinition, initialValue: props.initial.body as unknown as PortableTextBlock[] }}>
            <EventListenerPlugin
              on={(event) => {
                if (event.type === 'mutation') setBody((event.value || []) as unknown as DocBlock[]);
              }}
            />
            <div className="rounded-lg border border-gray-200 bg-white px-6 pb-10 shadow-sm sm:px-10" onPasteCapture={onPasteCapture}>
              <h2 className="pt-8 pb-2 text-3xl font-bold text-gray-900 font-helvetica">{title || 'Untitled document'}</h2>
              <EditorArea body={body} numbers={numbers} markers={markers} setEditing={setEditing} setError={setError} />
            </div>
            <ObjectEditors editing={editing} body={body} onClose={() => setEditing(null)} />
          </EditorProvider>
        </div>

        <p className="text-xs text-gray-500">
          Tip: use <strong>Section</strong> and <strong>Subsection</strong> for headings — never type numbers into them. Pasted text is tidied to the
          document standard automatically.
        </p>

        {/* Actions — kept in view */}
        <div className="sticky bottom-0 -mx-4 sm:mx-0 border-t sm:border sm:rounded-lg border-gray-200 bg-white/95 backdrop-blur px-4 py-3 shadow-sm space-y-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md flex items-center gap-2" role="alert">
              <FiAlertCircle className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveDraft}
              disabled={!!busy || !dirty}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-brand-dark-blue bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              <FiSave className="w-4 h-4" />
              {busy === 'save' ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={!!busy || (!dirty && !hasDraft && hasPublished)}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-md text-white bg-brand-light-blue hover:bg-brand-dark-blue disabled:opacity-50 transition-colors font-helvetica"
            >
              <FiSend className="w-4 h-4" />
              {busy === 'publish' ? 'Publishing…' : 'Publish'}
            </button>
            <button type="button" onClick={() => setPreview(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
              <FiEye className="w-4 h-4" /> Preview
            </button>
            <span className="text-sm" role="status">
              {dirty ? <span className="text-amber-700">Unsaved changes</span> : notice && <span className="inline-flex items-center gap-1 text-green-700"><FiCheck className="h-4 w-4" /> {notice}</span>}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {confirm ? (
                <>
                  <span className="text-sm text-gray-700">{confirm === 'discard' ? 'Throw away all unpublished changes?' : 'Delete this document for everyone?'}</span>
                  <button
                    type="button"
                    onClick={confirm === 'discard' ? discard : remove}
                    disabled={!!busy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {confirm === 'discard' ? 'Discard' : 'Delete'}
                  </button>
                  <button type="button" onClick={() => setConfirm('')} className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {hasDraft && hasPublished && (
                    <button type="button" onClick={() => setConfirm('discard')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                      <FiRotateCcw className="w-4 h-4" /> Discard draft
                    </button>
                  )}
                  <button type="button" onClick={() => setConfirm('delete')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50">
                    <FiTrash2 className="w-4 h-4" /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/70 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Preview">
          <div className="mx-auto max-w-4xl">
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="text-sm">
                <strong>Preview</strong> — how members will see this version
              </p>
              <button type="button" autoFocus onClick={() => setPreview(false)} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20">
                <FiX className="h-4 w-4" /> Close
              </button>
            </div>
            <article className="rounded-lg bg-white p-6 shadow-xl sm:p-10">
              <h1 className="mb-6 text-3xl font-bold text-gray-900 font-helvetica">{title}</h1>
              <DocumentBody body={body} numberHeadings={numberHeadings} />
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
