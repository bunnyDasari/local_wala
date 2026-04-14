/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,   // false = 307 temporary, won't be cached by browser
      },
    ];
  },
};

module.exports = nextConfig;