import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <FiAlertCircle className="w-16 h-16 text-brand-light-blue mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-brand-dark-blue mb-4 font-helvetica">
          Post Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the article you're looking for. It may have been removed or the link might be incorrect.
        </p>
        <Link
          href="/news"
          className="inline-block bg-brand-light-blue text-white border-2 border-transparent px-8 py-3 rounded-lg font-semibold hover:bg-brand-dark-blue transition-colors"
        >
          Back to News
        </Link>
      </div>
    </div>
  );
}
