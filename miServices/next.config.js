/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/pre-tenancy',
        destination: '/services/pre-tenancy',
        permanent: true,
      },
      {
        source: '/check-ins',
        destination: '/services/check-ins',
        permanent: true,
      },
      {
        source: '/mid-tenancy',
        destination: '/services/mid-tenancy',
        permanent: true,
      },
      {
        source: '/check-outs',
        destination: '/services/check-outs',
        permanent: true,
      },
      {
        source: '/inventory-reports',
        destination: '/services/inventory-reports',
        permanent: true,
      },
      {
        source: '/property-visits',
        destination: '/services/property-visits',
        permanent: true,
      },
      {
        source: '/block-management',
        destination: '/services/block-management',
        permanent: true,
      },
      {
        source: '/end-tenancy',
        destination: '/services/end-tenancy',
        permanent: true,
      },
      {
        source: '/members/operations',
        destination: '/members/documents',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
