/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.example.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: '/teklifler/pdf/:id.pdf',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/offers/pdf/:id.pdf`,
      },
    ];
  },
};

module.exports = nextConfig;