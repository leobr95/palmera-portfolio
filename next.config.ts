import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "palmerajunior.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
