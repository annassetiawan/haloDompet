import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* Performance optimizations for Core Web Vitals */

  // Enable React strict mode for better performance
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compress responses with gzip/brotli
  compress: true,

  // Acknowledge webpack config from PWA plugin
  turbopack: {},
  webpack: (config) => {
    // Enable module concatenation for smaller bundles
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    }
    return config
  },

  experimental: {
    turbopackUseSystemTlsCerts: true,
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['lucide-react', 'date-fns', '@supabase/supabase-js'],
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // PWA optimizations
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
