import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['three'],
  images: {
    // Photos are pre-optimised by `pnpm images` into AVIF/WebP at 3 widths,
    // so the runtime optimiser is not needed (keeps Vercel image quota at zero).
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/(images|hdri)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
