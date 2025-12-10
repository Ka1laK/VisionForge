/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [],
        unoptimized: true, // Required for Static Export
    },
    output: process.env.NEXT_OUTPUT === 'export' ? 'export' : 'standalone',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '', // Support for GitHub Pages project paths
};

export default nextConfig;
