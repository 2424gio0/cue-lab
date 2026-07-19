import type { Metadata } from "next";
import "./globals.css";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const origin = isGitHubPages
  ? "https://2424gio0.github.io/cue-lab"
  : "https://cue-lab-memory-study.ky00nu.chatgpt.site";
const title = "CUE LAB — 단서와 기억 유지 실험";
const description = "단서 수준에 따른 즉시 성과와 지연 기억을 비교하는 교육용 실험 앱";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: origin,
    images: [{ url: `${origin}/og.png`, width: 1733, height: 909, alt: "CUE LAB 기억 실험" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${origin}/og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
