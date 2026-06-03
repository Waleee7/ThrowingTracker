import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // W10: dropped `output: 'export'` — the AI Coach Brain needs a server route
  // (app/api/coach) to hold the ANTHROPIC_API_KEY, which static export can't do.
  // Vercel now deploys this as a normal Next app (SSR/serverless) automatically.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
