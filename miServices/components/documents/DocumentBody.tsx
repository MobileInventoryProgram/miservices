'use client';

import { useMemo, type ReactNode } from 'react';
import Image from 'next/image';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity-image';
import { buildOutline, headingAnchor, type DocBlock, type DocContactsBlock, type DocTableBlock } from '@/lib/documents/standard';
import { DOC_CLASS } from './typography';

/** Sanity image refs carry their size ("image-<id>-600x339-png"); use it to reserve space */
export function imageSize(ref: string) {
  const [, w, h] = /-(\d+)x(\d+)-/.exec(ref) || [, '1200', '800'];
  const width = Math.min(Number(w), 1200);
  return { width, height: Math.round((width * Number(h)) / Number(w)) };
}

export function DocTable({ value }: { value: DocTableBlock }) {
  const rows = value.rows || [];
  if (rows.length === 0) return null;
  const head = value.headerRow === false ? null : rows[0];
  const rest = head ? rows.slice(1) : rows;
  return (
    <div className={DOC_CLASS.tableWrap}>
      <table className={DOC_CLASS.table}>
        {head && (
          <thead>
            <tr>
              {head.cells.map((cell, i) => (
                <th key={i} scope="col" className={DOC_CLASS.th}>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rest.map((row) => (
            <tr key={row._key}>
              {row.cells.map((cell, i) => (
                <td key={i} className={DOC_CLASS.td}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocContacts({ value }: { value: DocContactsBlock }) {
  const people = value.people || [];
  if (people.length === 0) return null;
  return (
    <div className={DOC_CLASS.contacts}>
      {people.map((person) => (
        <div key={person._key} className={DOC_CLASS.contactCard}>
          {person.photo?.asset?._ref ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlFor(person.photo).width(112).height(112).fit('crop').auto('format').url()}
              alt=""
              width={56}
              height={56}
              draggable={false}
              className={DOC_CLASS.contactPhoto}
            />
          ) : (
            <span aria-hidden="true" className={`${DOC_CLASS.contactPhoto} flex items-center justify-center text-lg font-semibold text-gray-500`}>
              {person.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </span>
          )}
          <div className="min-w-0">
            <p className={DOC_CLASS.contactName}>{person.name}</p>
            {person.role && <p className={DOC_CLASS.contactRole}>{person.role}</p>}
            {person.phone && (
              <a href={`tel:${person.phone.replace(/\s/g, '')}`} className={`${DOC_CLASS.contactLink} block`}>
                {person.phone}
              </a>
            )}
            {person.email && (
              <a href={`mailto:${person.email}`} className={`${DOC_CLASS.contactLink} block truncate`}>
                {person.email}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A member document's body in the standard style, with section numbers when
 * the document has them switched on.
 */
export default function DocumentBody({ body, numberHeadings }: { body: DocBlock[]; numberHeadings?: boolean }) {
  const { numbers } = useMemo(() => buildOutline(body, !!numberHeadings), [body, numberHeadings]);

  const heading = (Tag: 'h2' | 'h3', className: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Heading({ children, value }: { children?: ReactNode; value: any }) {
      const number = numbers.get(value._key);
      return (
        <Tag id={headingAnchor(value._key)} className={className}>
          {number && <span className={DOC_CLASS.number}>{number}</span>}
          {children}
        </Tag>
      );
    };

  const components: PortableTextComponents = {
    block: {
      h2: heading('h2', DOC_CLASS.section),
      h3: heading('h3', DOC_CLASS.subsection),
      normal: ({ children }) => <p className={DOC_CLASS.paragraph}>{children}</p>,
    },
    list: {
      bullet: ({ children, value }) => <ul className={(value.level || 1) > 1 ? DOC_CLASS.nestedBulletList : DOC_CLASS.bulletList}>{children}</ul>,
      number: ({ children, value }) => <ol className={(value.level || 1) > 1 ? DOC_CLASS.nestedNumberList : DOC_CLASS.numberList}>{children}</ol>,
    },
    listItem: ({ children }) => <li className={DOC_CLASS.listItem}>{children}</li>,
    marks: {
      link: ({ children, value }) => (
        <a href={value?.href} target="_blank" rel="noopener noreferrer" className={DOC_CLASS.link}>
          {children}
        </a>
      ),
    },
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) return null;
        const { width, height } = imageSize(value.asset._ref);
        return (
          <figure className={DOC_CLASS.figure}>
            <Image
              // Sanity's image CDN already resizes and converts to modern formats
              src={urlFor(value).width(width).fit('max').auto('format').quality(80).url()}
              unoptimized
              alt={value.alt || ''}
              width={width}
              height={height}
              draggable={false}
              className={DOC_CLASS.image}
              style={{ width: '100%', maxWidth: width, aspectRatio: `${width} / ${height}` }}
            />
            {value.caption && <figcaption className={DOC_CLASS.caption}>{value.caption}</figcaption>}
          </figure>
        );
      },
      table: ({ value }) => <DocTable value={value} />,
      contacts: ({ value }) => <DocContacts value={value} />,
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={body as any} components={components} />;
}
