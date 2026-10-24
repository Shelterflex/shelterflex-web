/** Performance optimization configuration for Next.js */

// Listing photos come from the backend's /media route; keep the default in
// sync with lib/media.ts (a .mjs config can't import the TypeScript module).
const mediaBaseUrl = new URL(
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'https://shelterflex.zplague.xyz/media',
);

export const performanceConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Source photos are immutable per URL, so optimised copies can live long.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: mediaBaseUrl.protocol.replace(':', ''),
        hostname: mediaBaseUrl.hostname,
        port: mediaBaseUrl.port,
        pathname: `${mediaBaseUrl.pathname.replace(/\/$/, '')}/**`,
      },
    ],
  },

  // Compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Stellar SDK separate chunk (large library)
            stellar: {
              name: 'stellar',
              test: /[\\/]node_modules[\\/]@stellar[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }

    return config;
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
    ],
  },

  // Turbopack configuration (Next.js 16+)
  turbopack: {
    // Empty config to acknowledge Turbopack usage
    // Webpack config above is kept for fallback compatibility
  },
};
