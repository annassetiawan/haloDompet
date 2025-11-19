import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Acknowledge webpack config from PWA plugin
  turbopack: {},
  webpack: (config) => config,
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
