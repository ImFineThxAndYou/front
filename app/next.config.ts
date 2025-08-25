import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // 동적 라우트 사용을 위해 비활성화
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 임시로 TypeScript 오류 무시
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    // Next.js 15 메타데이터 관련 경고 줄이기
    metadata: {
      // 메타데이터 자동 생성 비활성화
      generateMetadata: false,
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  // 빌드 성능 최적화
  swcMinify: true,
  // 메타데이터 경고 억제
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 개발 환경에서 캐시 문제 해결
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 개발 환경에서 캐시 비활성화
      config.cache = false;
      // HMR 안정성 개선
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
