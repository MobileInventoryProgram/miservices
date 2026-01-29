'use client';

import { PortableText as PortableTextComponent } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';

const components = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt || 'Image'}
            width={800}
            height={450}
            className="rounded-lg shadow-lg w-full h-auto"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = value.blank ? 'noopener noreferrer' : undefined;
      const target = value.blank ? '_blank' : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          target={target}
          className="text-brand-light-blue hover:underline"
        >
          {children}
        </a>
      );
    },
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-brand-dark-blue mt-8 mb-4 font-helvetica">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold text-brand-dark-blue mt-6 mb-3 font-helvetica">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-lg font-bold text-brand-dark-blue mt-4 mb-2 font-helvetica">
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-brand-light-blue pl-4 my-6 italic text-gray-700">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
        {children}
      </ol>
    ),
  },
};

interface PortableTextProps {
  value: any[];
  className?: string;
}

export default function PortableText({ value, className = '' }: PortableTextProps) {
  if (!value) return null;

  return (
    <div className={className}>
      <PortableTextComponent value={value} components={components} />
    </div>
  );
}
