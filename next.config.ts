import type { NextConfig } from "next";

// GitHub Pages(프로젝트 페이지)는 /<repo> 하위 경로에서 서빙되므로
// 배포 빌드에서만 basePath/assetPrefix를 적용한다. 로컬 dev에는 영향 없음.
const isPages = process.env.GITHUB_PAGES === "true";
const repo = "instructor-sample";

const nextConfig: NextConfig = {
  output: "export", // 정적 HTML 내보내기 (서버 로직 없는 클라이언트 앱)
  images: { unoptimized: true },
  ...(isPages ? { basePath: `/${repo}`, assetPrefix: `/${repo}/` } : {}),
};

export default nextConfig;
