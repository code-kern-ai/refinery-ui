/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  basePath: '/refinery',
  env: {
    IS_DEV: process.env.IS_DEV,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig
