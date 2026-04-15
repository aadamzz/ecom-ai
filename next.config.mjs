/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use internal Mac drive for build cache — ExFAT (external SSD) can't handle Turbopack's DB files
  distDir: process.env.NEXT_BUILD_DIR || `${process.env.HOME}/Library/Caches/ui-creator-next`,
  experimental: {
    // Disable Turbopack filesystem cache — ExFAT doesn't support SQLite (invalid digit error)
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    // Disable image optimization in dev — avoids Sharp cache issues on ExFAT
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
