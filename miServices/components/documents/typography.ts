/**
 * One set of styles for member documents. Used by the reader (DocumentBody)
 * and the editor, so what admins edit looks exactly like what members read.
 */
export const DOC_CLASS = {
  section: 'scroll-mt-24 mt-12 mb-4 pb-2 border-b border-gray-200 text-2xl font-bold leading-tight text-brand-dark-blue font-helvetica first:mt-0',
  subsection: 'scroll-mt-24 mt-8 mb-3 text-lg font-bold leading-snug text-gray-900 font-helvetica',
  number: 'mr-2 tabular-nums text-brand-light-blue',
  paragraph: 'my-3 leading-relaxed text-gray-800',
  bulletList: 'my-3 list-disc space-y-1.5 pl-6 text-gray-800 marker:text-brand-light-blue',
  numberList: 'my-3 list-decimal space-y-1.5 pl-6 text-gray-800 marker:text-gray-500',
  nestedBulletList: 'mt-1.5 list-[circle] space-y-1 pl-6',
  nestedNumberList: 'mt-1.5 list-[lower-alpha] space-y-1 pl-6',
  listItem: 'leading-relaxed pl-1',
  link: 'text-brand-light-blue underline underline-offset-2 hover:text-brand-dark-blue',
  figure: 'my-6',
  image: 'mx-auto h-auto rounded-md border border-gray-200',
  caption: 'mt-2 text-center text-sm text-gray-500',
  tableWrap: 'my-6 overflow-x-auto rounded-md border border-gray-200',
  table: 'w-full border-collapse text-sm',
  th: 'bg-brand-dark-blue/5 px-3 py-2 text-left font-semibold text-brand-dark-blue align-top border-b border-gray-200 whitespace-pre-line',
  td: 'px-3 py-2 text-gray-800 align-top border-t border-gray-100 whitespace-pre-line',
  contacts: 'my-6 grid grid-cols-1 gap-3 sm:grid-cols-2',
  contactCard: 'flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50/60 p-4',
  contactPhoto: 'h-14 w-14 flex-shrink-0 rounded-full object-cover bg-gray-200',
  contactName: 'font-semibold text-gray-900 font-helvetica',
  contactRole: 'text-sm text-gray-600',
  contactLink: 'text-sm text-brand-light-blue hover:text-brand-dark-blue',
} as const;
