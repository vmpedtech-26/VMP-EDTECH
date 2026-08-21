const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    images: {
        remotePatterns: [
            // Fotos de credencial, evidencias y firmas (storage_service.py -> Cloudflare R2)
            { protocol: 'https', hostname: '*.r2.dev' },
            { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
            // Imágenes de portada del blog
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
