import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.lifebetweentitles.com" },
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/apps", destination: "/ventures", permanent: true },
    ];
  },
};

export default nextConfig;
