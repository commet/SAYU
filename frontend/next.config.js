// Provide fallback env vars during build to prevent @supabase/ssr from throwing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder';
}

/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true,
  register: true,
  skipWaiting: true
})

const nextConfig = {
  reactStrictMode: false, // React 19 RC compatibility
  poweredByHeader: false, // X-Powered-By 헤더 제거
  compress: true, // gzip 압축 활성화
  productionBrowserSourceMaps: false, // 프로덕션 소스맵 비활성화

  // Transpile shared workspace package
  transpilePackages: ['@sayu/shared'],

  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    // unoptimized 제거 - Next.js 이미지 최적화 활성화 (AVIF/WebP 변환, 리사이징)
    domains: ['www.sayu.my', 'sayu.my', 'localhost'],
    // Next.js는 remotePatterns를 최대 50개까지만 허용 - 필수 도메인만 포함
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
      { protocol: 'https', hostname: '**.kulturdaten.berlin' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일로 증가
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // 디바이스별 이미지 크기 최적화
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // 실험적 기능으로 성능 향상
  experimental: {
    optimizeCss: true, // CSS 최적화 활성화
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@react-three/drei',
      'framer-motion',
      '@tanstack/react-query',
      'react-hot-toast'
    ],
    scrollRestoration: true, // 스크롤 위치 복원
  },
  
  // Next.js 15 설정
  serverExternalPackages: ['sharp'],
  
  // Turbopack 설정 (experimental에서 이동)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // 컴파일러 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  webpack: (config, { isServer }) => {
    const path = require('path');

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
      'zod/v4/core': require.resolve('zod/v4/core'),
      'zod/v4': require.resolve('zod/v4'),
    };
    return config;
  },

  // Force cache invalidation
  generateBuildId: async () => {
    return 'build-' + Date.now()
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
    ];
  }
}

module.exports = withPWA(nextConfig)
