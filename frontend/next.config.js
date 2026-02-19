/* eslint-disable @typescript-eslint/no-require-imports */
// Provide fallback env vars during build to prevent @supabase/ssr from throwing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder';
}
/** @type {import('next').NextConfig} */

const path = require('path')

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true,
  register: true,
  skipWaiting: true
})

const enforceBuildQuality = process.env.ALLOW_BUILD_WITH_ERRORS !== 'true'

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // Transpile shared workspace package
  transpilePackages: ['@sayu/shared'],

  typescript: {
    ignoreBuildErrors: !enforceBuildQuality
  },
  eslint: {
    ignoreDuringBuilds: !enforceBuildQuality
  },

  images: {
    domains: ['www.sayu.my', 'sayu.my', 'localhost'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
      { protocol: 'https', hostname: 'api.replicate.com' },
      { protocol: 'https', hostname: 'images.metmuseum.org' },
      { protocol: 'https', hostname: 'openaccess-cdn.clevelandart.org' },
      { protocol: 'https', hostname: 'api.artic.edu' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'www.artic.edu' },
      { protocol: 'https', hostname: 'ids.si.edu' },
      { protocol: 'https', hostname: 'media.nga.gov' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'k.kakaocdn.net' },
      { protocol: 'https', hostname: 'collections.louvre.fr' },
      { protocol: 'https', hostname: 'cdn.leonardo.ai' },
      { protocol: 'https', hostname: 'www.moma.org' },
      { protocol: 'https', hostname: 'www.guggenheim.org' },
      { protocol: 'https', hostname: 'www.tate.org.uk' },
      { protocol: 'https', hostname: 'www.museoreinasofia.es' },
      { protocol: 'https', hostname: 'www.artsy.net' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'www.nga.gov' },
      { protocol: 'https', hostname: 'www.clevelandart.org' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'www.rijksmuseum.nl' },
      { protocol: 'https', hostname: 'd32dm0rphc51dk.cloudfront.net' },
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
      // Korean museum/gallery image domains
      { protocol: 'https', hostname: '**.go.kr' },
      { protocol: 'https', hostname: 'www.sac.or.kr' },
      { protocol: 'https', hostname: 'www.koreafilm.or.kr' },
      { protocol: 'http', hostname: '**.go.kr' },
      { protocol: 'https', hostname: 'art-map.co.kr' },
      { protocol: 'https', hostname: '**.gagosian.com' },
      { protocol: 'https', hostname: 'lisson-art.s3.amazonaws.com' },
      { protocol: 'https', hostname: '**.perrotin.com' },
      { protocol: 'https', hostname: 'www.arariogallery.com' },
      // International exhibition pipeline domains
      { protocol: 'https', hostname: '**.e-flux.com' },
      { protocol: 'https', hostname: '**.paris.fr' },
      { protocol: 'https', hostname: '**.whitney.org' },
      { protocol: 'https', hostname: 'nrs.harvard.edu' },
      { protocol: 'https', hostname: '**.harvardartmuseums.org' },
      { protocol: 'https', hostname: '**.kulturdaten.berlin' }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256]
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@react-three/drei',
      'framer-motion',
      '@tanstack/react-query',
      'react-hot-toast'
    ],
    scrollRestoration: true
  },

  serverExternalPackages: ['sharp'],

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn']
          }
        : false
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
      'zod/v4/core': require.resolve('zod/v4/core'),
      'zod/v4': require.resolve('zod/v4')
    }
    return config
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          }
        ]
      }
    ]
  }
}

module.exports = withPWA(nextConfig)
