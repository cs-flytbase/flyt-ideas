/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    tracing: false, // Disable tracing to prevent file permission errors
  },
};

module.exports = nextConfig;
