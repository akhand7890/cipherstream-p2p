/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable symlink generation for OneDrive compatibility
  reactStrictMode: true,
};

export default nextConfig;
