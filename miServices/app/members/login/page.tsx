'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = session.user.role;
      if (role === 'franchise') {
        router.push('/members/franchise/dashboard');
      } else if (role === 'staff') {
        router.push('/members/staff/dashboard');
      } else if (role === 'admin') {
        router.push('/members/admin/dashboard');
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        setIsLoading(false);
      } else if (result?.ok) {
        // Refresh session to get user data
        window.location.reload();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (testUsername: string, testPassword: string) => {
    setError('');
    setIsLoading(true);
    setUsername(testUsername);
    setPassword(testPassword);

    try {
      const result = await signIn('credentials', {
        username: testUsername,
        password: testPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        setIsLoading(false);
      } else if (result?.ok) {
        window.location.reload();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="miServices Logo"
            width={200}
            height={67}
            className="mb-8 mx-auto"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark-blue mx-auto"></div>
          <p className="mt-4 text-gray-600 font-helvetica">Checking your credentials...</p>
        </div>
      </div>
    );
  }

  // Show welcome back message for authenticated users while redirecting
  if (status === 'authenticated' && session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="miServices Logo"
            width={200}
            height={67}
            className="mb-8 mx-auto"
          />
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark-blue font-helvetica mb-2">
            Welcome back{session.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-gray-600 mb-4">Taking you to your dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light-blue mx-auto"></div>
        </div>
      </div>
    );
  }

  // Only show login form if unauthenticated
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src="/logo.png"
            alt="miServices Logo"
            width={200}
            height={67}
            className="mb-8"
          />
        </Link>
        <h2 className="text-center text-3xl font-bold text-brand-dark-blue font-helvetica">
          Members Area
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                <FiAlertCircle className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-light-blue hover:bg-brand-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Quick Login (Test Accounts)
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Admin123!')}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-purple-600 rounded-md shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
              >
                Login as Admin
              </button>
              
              <button
                type="button"
                onClick={() => handleQuickLogin('staff', 'Staff123!')}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
              >
                Login as Head Office Staff
              </button>
              
              <button
                type="button"
                onClick={() => handleQuickLogin('franchise', 'Franchise123!')}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-center focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
              >
                Login as Franchisee
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  For franchise opportunities
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/franchise"
                className="w-full inline-flex justify-center py-2 px-4 border border-brand-dark-blue rounded-md shadow-sm text-sm font-medium text-brand-dark-blue bg-white hover:bg-gray-50 font-helvetica"
              >
                Learn About Franchising
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Need access?{' '}
          <Link href="/contact" className="text-brand-light-blue hover:text-brand-dark-blue font-semibold">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
