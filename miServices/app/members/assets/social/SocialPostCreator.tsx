'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { FiDownload, FiImage, FiLoader, FiMove, FiRotateCcw, FiStar, FiX } from 'react-icons/fi';
import { inputClass } from '@/components/crm/ContactFields';
import {
  POST_SIZES,
  POST_TEMPLATES,
  type PostField,
  type PostSize,
  type PostTemplate,
  type PostTheme,
} from '@/lib/social/templates';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
/** Stable empty object so the preview effect doesn't re-run on every render */
const NONE: Record<string, string> = {};
const toggle = 'px-3 py-1.5 text-sm rounded transition-colors';

/** Resize (and for circles, centre-crop) a photo in the browser before sending it */
async function preparePhoto(file: File, shape: 'background' | 'circle'): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  if (shape === 'circle') {
    const side = Math.min(bitmap.width, bitmap.height);
    canvas.width = canvas.height = Math.min(600, side);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  } else {
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL('image/jpeg', 0.85);
}

/** A background photo and how the member has framed it */
interface Background {
  src: string;
  width: number;
  height: number;
  /** Position of the photo within the frame, 0–100 (like CSS background-position) */
  x: number;
  y: number;
  /** 1 = just covers the post; up to 3× */
  zoom: number;
}

/** Size and offset of the photo when covering a W×H frame — shared by the editor and the crop */
function coverLayout(bg: Background, W: number, H: number) {
  const scale = Math.max(W / bg.width, H / bg.height) * bg.zoom;
  const dw = bg.width * scale;
  const dh = bg.height * scale;
  return { dw, dh, ox: ((W - dw) * bg.x) / 100, oy: ((H - dh) * bg.y) / 100 };
}

const imageCache = new Map<string, HTMLImageElement>();
function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached?.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

/** Crop the photo to exactly the post size using the member's framing */
async function cropBackground(bg: Background, W: number, H: number): Promise<string> {
  const img = await loadImage(bg.src);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const { dw, dh, ox, oy } = coverLayout(bg, W, H);
  canvas.getContext('2d')!.drawImage(img, ox, oy, dw, dh);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function BackgroundEditor({
  field,
  value,
  aspect,
  theme,
  onFile,
  onChange,
  onRemove,
}: {
  field: PostField;
  value?: Background;
  aspect: number;
  theme: PostTheme;
  onFile: (file: File) => void;
  onChange: (next: Partial<Background>) => void;
  onRemove: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [value?.src]);

  const fileInput = (
    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
  );

  if (!value) {
    return (
      <div>
        <p className={labelClass}>{field.label}</p>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 hover:border-brand-light-blue hover:text-brand-dark-blue">
          <FiImage className="h-5 w-5" />
          Choose a background photo
          {fileInput}
        </label>
        {field.type === 'photo' && field.hint && <p className="mt-1 text-xs text-gray-500">{field.hint}</p>}
      </div>
    );
  }

  const boxHeight = boxWidth / aspect;
  const layout = boxWidth ? coverLayout(value, boxWidth, boxHeight) : null;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !layout) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    // Moving the photo right means a smaller x when it overflows the frame
    const spareX = boxWidth - layout.dw;
    const spareY = boxHeight - layout.dh;
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    onChange({
      x: spareX < 0 ? clamp(value.x + (dx * 100) / spareX) : value.x,
      y: spareY < 0 ? clamp(value.y + (dy * 100) / spareY) : value.y,
    });
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className={labelClass}>{field.label}</p>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <FiMove className="h-3 w-3" /> Drag to position
        </span>
      </div>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        role="img"
        aria-label="Background photo framing. Drag to reposition."
        className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-md border border-gray-300 active:cursor-grabbing"
        style={{
          aspectRatio: String(aspect),
          backgroundImage: `url(${value.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: layout ? `${layout.dw}px ${layout.dh}px` : 'cover',
          backgroundPosition: `${value.x}% ${value.y}%`,
        }}
      >
        {/* Same overlay as the post, so the framing reads as it will look */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: theme === 'light' ? 'rgba(255,255,255,0.55)' : 'rgba(30,51,111,0.6)' }}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <label htmlFor={`zoom-${field.key}`} className="text-xs text-gray-600">
          Zoom
        </label>
        <input
          id={`zoom-${field.key}`}
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={value.zoom}
          onChange={(e) => onChange({ zoom: Number(e.target.value) })}
          className="flex-1 accent-brand-dark-blue"
        />
        <button type="button" onClick={() => onChange({ x: 50, y: 50, zoom: 1 })} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
          <FiRotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
      <div className="mt-2 flex items-center gap-4 text-sm">
        <label className="cursor-pointer font-medium text-brand-light-blue hover:text-brand-dark-blue">
          Replace
          {fileInput}
        </label>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
          <FiX className="h-4 w-4" /> Remove
        </button>
      </div>
    </div>
  );
}

async function renderPost(body: object): Promise<Blob> {
  const res = await fetch('/api/members/social/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not create the image');
  return res.blob();
}

function Field({
  field,
  value,
  photo,
  onChange,
  onPhoto,
}: {
  field: PostField;
  value: string;
  photo?: string;
  onChange: (value: string) => void;
  onPhoto: (file: File | null) => void;
}) {
  const id = `post-${field.key}`;

  if (field.type === 'stars') {
    const stars = Number(value) || 5;
    return (
      <fieldset>
        <legend className={labelClass}>{field.label}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(String(n))} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={n === stars}>
              <FiStar className={`h-7 w-7 ${n <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'photo') {
    return (
      <div>
        <p className={labelClass}>{field.label}</p>
        {photo ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" className={`h-16 object-cover ${field.shape === 'circle' ? 'w-16 rounded-full' : 'w-24 rounded'}`} />
            <label className="cursor-pointer text-sm font-medium text-brand-light-blue hover:text-brand-dark-blue">
              Replace
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0] || null)} />
            </label>
            <button type="button" onClick={() => onPhoto(null)} className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
              <FiX className="h-4 w-4" /> Remove
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-gray-600 hover:border-brand-light-blue hover:text-brand-dark-blue">
            <FiImage className="h-5 w-5" />
            Choose a photo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0] || null)} />
          </label>
        )}
        {field.hint && <p className="mt-1 text-xs text-gray-500">{field.hint}</p>}
      </div>
    );
  }

  const over = value.length > field.max;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className={labelClass}>
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <span className={`text-xs tabular-nums ${over ? 'text-red-600' : value.length > field.max * 0.9 ? 'text-amber-600' : 'text-gray-400'}`}>
          {value.length}/{field.max}
        </span>
      </div>
      {field.type === 'textarea' ? (
        <textarea id={id} rows={4} value={value} maxLength={field.max} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <input id={id} value={value} maxLength={field.max} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

export default function SocialPostCreator() {
  const [template, setTemplate] = useState<PostTemplate>(POST_TEMPLATES[0]);
  const [theme, setTheme] = useState<PostTheme>('light');
  const [size, setSize] = useState<PostSize>('square');
  const [values, setValues] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(POST_TEMPLATES.map((t) => [t.key, { ...t.sample }]))
  );
  const [photos, setPhotos] = useState<Record<string, Record<string, string>>>({});
  const [backgrounds, setBackgrounds] = useState<Record<string, Background>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const fields = values[template.key] || NONE;
  const templatePhotos = photos[template.key] || NONE;
  const payload = useCallback(
    () => ({ template: template.key, theme, size, fields, photos: templatePhotos }),
    [template.key, theme, size, fields, templatePhotos]
  );

  // Live preview, re-rendered shortly after typing stops
  useEffect(() => {
    const id = ++requestId.current;
    setRendering(true);
    const timer = setTimeout(async () => {
      try {
        const blob = await renderPost(payload());
        if (id !== requestId.current) return;
        setPreview((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        setError('');
      } catch (e) {
        if (id === requestId.current) setError(e instanceof Error ? e.message : 'Could not create the preview');
      } finally {
        if (id === requestId.current) setRendering(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [payload]);

  // Crop the framed background to the post size whenever the framing or size changes
  const background = backgrounds[template.key];
  const { width: postW, height: postH } = POST_SIZES[size];
  useEffect(() => {
    const key = template.key;
    if (!background) {
      setPhotos((p) => {
        if (!p[key]?.background) return p;
        const next = { ...p[key] };
        delete next.background;
        return { ...p, [key]: next };
      });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const data = await cropBackground(background, postW, postH);
      if (!cancelled) setPhotos((p) => ({ ...p, [key]: { ...(p[key] || {}), background: data } }));
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [background, postW, postH, template.key]);

  const setBackgroundFile = async (file: File) => {
    try {
      const src = await preparePhoto(file, 'background');
      const img = await loadImage(src);
      setBackgrounds((b) => ({ ...b, [template.key]: { src, width: img.naturalWidth, height: img.naturalHeight, x: 50, y: 50, zoom: 1 } }));
    } catch {
      setError('That photo could not be read. Try a JPEG or PNG.');
    }
  };
  const updateBackground = (next: Partial<Background>) =>
    setBackgrounds((b) => (b[template.key] ? { ...b, [template.key]: { ...b[template.key], ...next } } : b));
  const removeBackground = () =>
    setBackgrounds((b) => {
      const next = { ...b };
      delete next[template.key];
      return next;
    });

  const setField = (key: string, value: string) => setValues((v) => ({ ...v, [template.key]: { ...v[template.key], [key]: value } }));

  const setPhoto = async (field: PostField, file: File | null) => {
    if (field.type !== 'photo' || field.shape !== 'circle') return;
    try {
      const data = file ? await preparePhoto(file, field.shape) : null;
      setPhotos((p) => {
        const next = { ...(p[template.key] || {}) };
        if (data) next[field.key] = data;
        else delete next[field.key];
        return { ...p, [template.key]: next };
      });
    } catch {
      setError('That photo could not be read. Try a JPEG or PNG.');
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      const blob = await renderPost({ ...payload(), download: true });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `miservices-${template.key}-${size}-${theme}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const missing = template.fields.some((f) => (f.type === 'text' || f.type === 'textarea') && f.required && !fields[f.key]?.trim());
  const { width, height } = POST_SIZES[size];

  return (
    <div className="space-y-6">
      {/* Template picker */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" role="radiogroup" aria-label="Template">
        {POST_TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={t.key === template.key}
            onClick={() => setTemplate(t)}
            className={`rounded-lg border p-4 text-left transition-all ${
              t.key === template.key ? 'border-brand-light-blue bg-blue-50 ring-2 ring-brand-light-blue' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="font-semibold text-gray-900 font-helvetica">{t.name}</p>
            <p className="mt-1 text-xs text-gray-500">{t.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form */}
        <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex rounded-md border border-gray-200 p-0.5" role="group" aria-label="Colour">
              {(['navy', 'light'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setTheme(value)} aria-pressed={theme === value} className={`${toggle} ${theme === value ? 'bg-brand-dark-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {value === 'navy' ? 'Navy' : 'Light'}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-md border border-gray-200 p-0.5" role="group" aria-label="Size">
              {(['square', 'portrait'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setSize(value)} aria-pressed={size === value} className={`${toggle} ${size === value ? 'bg-brand-dark-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {value === 'square' ? 'Square' : 'Portrait'}
                </button>
              ))}
            </div>
          </div>

          {template.fields.map((field) =>
            field.type === 'photo' && field.shape === 'background' ? (
              <BackgroundEditor
                key={`${template.key}-${field.key}`}
                field={field}
                value={background}
                aspect={postW / postH}
                theme={theme}
                onFile={setBackgroundFile}
                onChange={updateBackground}
                onRemove={removeBackground}
              />
            ) : (
            <Field
              key={`${template.key}-${field.key}`}
              field={field}
              value={fields[field.key] || ''}
              photo={templatePhotos[field.key]}
              onChange={(value) => setField(field.key, value)}
              onPhoto={(file) => setPhoto(field, file)}
            />
            )
          )}

          <button
            type="button"
            onClick={() => setValues((v) => ({ ...v, [template.key]: { ...template.sample } }))}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Reset to example text
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-7">
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-lg bg-gray-200 shadow-lg" style={{ aspectRatio: `${width} / ${height}` }}>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={`${template.name} post preview`} className="h-full w-full object-contain" />
              )}
              {rendering && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs text-gray-600 shadow">
                  <FiLoader className="h-3.5 w-3.5 animate-spin" /> Updating
                </span>
              )}
            </div>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={download}
                disabled={downloading || missing}
                className="inline-flex items-center gap-2 rounded-md bg-brand-light-blue px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark-blue disabled:opacity-50 transition-colors font-helvetica"
              >
                <FiDownload className="h-4 w-4" />
                {downloading ? 'Preparing...' : 'Download PNG'}
              </button>
              <p className="text-xs text-gray-500">
                {POST_SIZES[size].label} · {missing ? 'Fill in the required fields to download' : 'Ready for LinkedIn, Facebook and Instagram'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
