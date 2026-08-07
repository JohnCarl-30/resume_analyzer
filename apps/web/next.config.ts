import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: join(process.cwd(), "../.."),
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "@clerk/nextjs",
      "@radix-ui/react-icons",
      "sonner",
      "@tanstack/react-query",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
