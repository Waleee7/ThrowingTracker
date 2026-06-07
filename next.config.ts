import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // W10: dropped `output: 'export'` — the AI Coach Brain needs a server route
  // (app/api/coach) to hold the ANTHROPIC_API_KEY, which static export can't do.
  // Vercel now deploys this as a normal Next app (SSR/serverless) automatically.
  // Overhaul: optimizer ON (static export is gone) so baked broadcast imagery
  // ships as AVIF/WebP with next/image blur placeholders.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
