'use client';

import Link from 'next/link';
import { FiDownload, FiFileText } from 'react-icons/fi';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import { CARD_PAGE_SIZE } from '@/lib/pagination';

interface FileItem {
  _id: string;
  title: string;
  slug: string;
  url?: string;
}

/** Head Office uploaded asset files, paged */
export default function MoreDownloads({ files }: { files: FileItem[] }) {
  const paged = usePagedList(files, CARD_PAGE_SIZE);
  if (files.length === 0) return null;

  return (
    <section ref={paged.topRef} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 font-helvetica mb-4">More downloads</h2>
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
        {paged.items.map((doc) => (
          <li key={doc._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <Link href={`/members/assets/files/${doc.slug}`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-dark-blue">
              <FiFileText className="w-4 h-4 text-gray-400" />
              {doc.title}
            </Link>
            {doc.url && (
              <a
                href={`${doc.url}?dl=`}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <FiDownload className="w-3.5 h-3.5" />
                Download
              </a>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Pagination {...paged} noun="files" onPageChange={paged.setPage} hideSinglePage />
      </div>
    </section>
  );
}
