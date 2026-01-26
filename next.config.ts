import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ✅ WordPress (Palmera Junior)
      {
        protocol: "https",
        hostname: "palmerajunior.com",
        pathname: "/wp-content/uploads/**",
      },

      // ✅ Unsplash (images)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },

      // ✅ (opcional pero recomendado) Unsplash source
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
