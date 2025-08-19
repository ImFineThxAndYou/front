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
};

export default nextConfig;
