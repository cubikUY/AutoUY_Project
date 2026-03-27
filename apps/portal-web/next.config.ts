import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@autouuy/ui", "@autouuy/database"],
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        // CDN personalizado de R2 — reemplazar con tu dominio real
        protocol: "https",
        hostname: "cdn.autouuy.uy",
      },
    ],
  },
};

export default nextConfig;
