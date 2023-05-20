/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  rewrites: async () => [
    {
      source: "/sandbox/:path*",
      destination: "http://localhost:20000/:path*",
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openai-labs-public-images-prod.azureedge.net",
      },
    ],
  },
}

module.exports = nextConfig
