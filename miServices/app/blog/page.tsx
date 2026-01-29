import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | miServices',
  description: 'Latest news, tips, and insights from miServices about property inspection and management.',
};

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">Blog</h1>
          <p className="text-xl">News, tips, and insights from miServices</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            We're currently working on our blog. Check back soon for helpful articles, industry insights, 
            and property inspection tips.
          </p>
        </div>
      </div>
    </div>
  );
}
