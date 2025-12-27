/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    disableStaticImages: false,
  },
};

module.exports = nextConfig;
