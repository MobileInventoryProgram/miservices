import { PortableText } from '@portabletext/react';
import type { AnswerBlock } from '@/lib/help/markup';

/** A help answer's text: paragraphs, bullets and bold */
export default function AnswerBody({ answer, className = '' }: { answer: AnswerBlock[]; className?: string }) {
  return (
    <div className={`space-y-3 text-gray-700 leading-relaxed ${className}`}>
      <PortableText
        value={answer}
        components={{
          list: { bullet: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul> },
          marks: {
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            link: ({ children, value }) => (
              <a href={value?.href} className="text-brand-light-blue underline hover:text-brand-dark-blue">
                {children}
              </a>
            ),
          },
        }}
      />
    </div>
  );
}
