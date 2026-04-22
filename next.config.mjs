/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
