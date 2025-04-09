/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Move this line inside the nextConfig object
};

module.exports = nextConfig; // Correctly export the config