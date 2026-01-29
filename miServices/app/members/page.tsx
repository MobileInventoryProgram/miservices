import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Members Area | miServices',
  description: 'Login to the miServices members area.',
};

export default function Members() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">Members Area</h1>
          <p className="text-xl">Access your account</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">Login</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light-blue" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light-blue" />
            </div>
            <button type="submit" className="w-full bg-brand-light-blue text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90">
              Login
            </button>
            <p className="text-center text-gray-600 text-sm">
              Forgot your password? <a href="#" className="text-brand-light-blue hover:underline">Reset it here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
