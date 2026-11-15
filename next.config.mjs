/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discountstorebd.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ],
    unoptimized: true, 
  },
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/product/:id',
        destination: '/shop/:id',
        permanent: true,
      },
      {
        source: '/product/:id/',
        destination: '/shop/:id/',
        permanent: true,
      },
      {
        source: '/user/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/forgot-password',
        destination: '/auth/forgot-password',
        permanent: true,
      },
      {
        source: '/myorder',
        destination: '/profile?tab=orders',
        permanent: true,
      },
      {
        source: '/payments',
        destination: '/profile?tab=payments',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;