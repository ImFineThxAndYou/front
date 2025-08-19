import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // 동적 라우트 사용을 위해 비활성화
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
