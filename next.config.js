/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  rewrites: async () => [
    {
      source: "/sandbox/:path*",
      destination: "http://localhost:20000/:path*",
    },
  ],
}

module.exports = nextConfig
