import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_TC, Nunito } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_TC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "彼學島｜和小彼一起探索任何主題";
  const description = "把任何課程變成可自由編輯的學習地圖，陪著可愛狐狸小彼逐關完成冒險。";

  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: { icon: "/fox.jpg", shortcut: "/fox.jpg" },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `${origin}/og-generic.png`, width: 1670, height: 941, alt: "彼學島通用課程地圖" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-generic.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className={`${notoSans.variable} ${nunito.variable}`}>{children}</body>
    </html>
  );
}
