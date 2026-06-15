/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shopified/shared', '@shopified/ui'],
};

module.exports = nextConfig;
