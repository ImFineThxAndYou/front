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
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
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
