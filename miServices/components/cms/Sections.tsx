import Link from 'next/link';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { CmsCta } from '@/lib/cms/types';

/** The wave shapes behind the blue page headers */
export function HeroWaves({ double = true }: { double?: boolean }) {
  return (
    <div className="absolute inset-0 opacity-10">
      <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
        <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white" />
        {double && <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5" />}
      </svg>
    </div>
  );
}

/** Blue gradient page header: heading and text */
export function GradientHero({ heading, text, children }: { heading?: string; text?: string; children?: React.ReactNode }) {
  return (
    <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20 overflow-hidden">
      <HeroWaves />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">{heading}</h1>
        {text && <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">{text}</p>}
        {children}
      </div>
    </section>
  );
}

/** Gradient call-to-action band at the bottom of a page */
export function CtaBand({ cta }: { cta?: CmsCta | null }) {
  if (!cta?.heading && !cta?.primaryButton) return null;
  return (
    <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
      <HeroWaves double={false} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {cta.heading && <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">{cta.heading}</h2>}
        {cta.text && <p className="text-xl mb-8 opacity-95">{cta.text}</p>}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {cta.primaryButton && (
            <Link href={cta.primaryButton.href} className="bg-white text-brand-dark-blue border-2 border-transparent px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg">
              {cta.primaryButton.label}
            </Link>
          )}
          {cta.secondaryButton && (
            <Link
              href={cta.secondaryButton.href}
              className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
            >
              {cta.secondaryButton.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/** Rich text from the CMS, styled to match page body copy */
export function RichText({ value, paragraphClass = 'text-gray-700 leading-relaxed mb-4' }: { value?: unknown[]; paragraphClass?: string }) {
  if (!value?.length) return null;
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p className={paragraphClass}>{children}</p>,
      h3: ({ children }) => <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">{children}</h3>,
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-700">{children}</ol>,
    },
    marks: {
      link: ({ children, value }) => (
        <Link href={value?.href || '#'} className="text-brand-light-blue underline hover:text-brand-dark-blue">
          {children}
        </Link>
      ),
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={value as any} components={components} />;
}
