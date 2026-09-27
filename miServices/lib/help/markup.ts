/**
 * Help answers are typed as simple text and stored as Portable Text:
 * blank line = new paragraph, lines starting "- " = bullet points, **bold**.
 * Used by the Head Office editor and the starter-set seed script.
 */

export interface AnswerSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

export interface AnswerBlock {
  _type: 'block';
  _key: string;
  style: 'normal';
  markDefs: never[];
  children: AnswerSpan[];
  listItem?: 'bullet';
  level?: number;
}

function keyMaker(prefix: string) {
  let n = 0;
  return () => `${prefix}${(n++).toString(36)}`;
}

function spans(line: string, key: () => string): AnswerSpan[] {
  // **bold** runs; an unmatched ** is kept as text
  const out: AnswerSpan[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ _type: 'span', _key: key(), text: line.slice(last, m.index), marks: [] });
    out.push({ _type: 'span', _key: key(), text: m[1], marks: ['strong'] });
    last = m.index + m[0].length;
  }
  if (last < line.length || !out.length) out.push({ _type: 'span', _key: key(), text: line.slice(last), marks: [] });
  return out;
}

/** Typed answer → Portable Text blocks. Keys are stable for the same text. */
export function answerToBlocks(text: string, keyPrefix = 'a'): AnswerBlock[] {
  const key = keyMaker(keyPrefix);
  const blocks: AnswerBlock[] = [];
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const lines = paragraph.split('\n').map((l) => l.trim()).filter(Boolean);
    lines.forEach((line, i) => {
      const bullet = /^[-•*]\s+/.test(line);
      const content = bullet ? line.replace(/^[-•*]\s+/, '') : line;
      const previous = blocks[blocks.length - 1];
      // Consecutive plain lines in one paragraph join into a single paragraph
      if (!bullet && i > 0 && previous && !previous.listItem) {
        previous.children.push({ _type: 'span', _key: key(), text: ' ', marks: [] }, ...spans(content, key));
        return;
      }
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'normal',
        markDefs: [],
        children: spans(content, key),
        ...(bullet ? { listItem: 'bullet' as const, level: 1 } : {}),
      });
    });
  }
  return blocks;
}

type LooseBlock = { _type?: string; listItem?: string; children?: { text?: string; marks?: string[] }[] };

/** Portable Text → the typed form, for editing */
export function blocksToAnswer(blocks: LooseBlock[] | undefined): string {
  const out: string[] = [];
  let previousWasBullet = false;
  for (const block of blocks || []) {
    if (block._type !== 'block') continue;
    const text = (block.children || []).map((c) => (c.marks?.includes('strong') ? `**${c.text || ''}**` : c.text || '')).join('');
    const bullet = !!block.listItem;
    if (out.length) out.push(bullet && previousWasBullet ? '\n' : '\n\n');
    out.push(bullet ? `- ${text}` : text);
    previousWasBullet = bullet;
  }
  return out.join('');
}

/** Plain text of an answer, for search and previews */
export function answerPlainText(blocks: LooseBlock[] | undefined): string {
  return (blocks || [])
    .filter((b) => b._type === 'block')
    .map((b) => (b.children || []).map((c) => c.text || '').join(''))
    .join(' ');
}
