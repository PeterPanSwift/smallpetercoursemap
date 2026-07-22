import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_TC, Nunito } from "next/font/google";
import "./globals.css";

function isChinese(languageHeader: string | null) {
  return languageHeader?.trim().toLowerCase().startsWith("zh") ?? false;
}

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
  const chinese = isChinese(requestHeaders.get("accept-language"));
  const title = chinese
    ? "彼學島｜和小彼一起探索任何主題"
    : "Peter Learning Island | Explore Any Topic with Little Peter";
  const description = chinese
    ? "把任何課程變成可自由編輯的學習地圖，陪著可愛狐狸小彼逐關完成冒險。"
    : "Turn any course into an editable learning map and complete every level with Little Peter.";

  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: { icon: "/fox.jpg", shortcut: "/fox.jpg" },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `${origin}/og-generic.png`, width: 1670, height: 941, alt: chinese ? "彼學島通用課程地圖" : "Peter Learning Island course map" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-generic.png`],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const language = isChinese(requestHeaders.get("accept-language")) ? "zh-Hant" : "en";
  return (
    <html lang={language}>
      <body className={`${notoSans.variable} ${nunito.variable}`}>{children}</body>
    </html>
  );
}
