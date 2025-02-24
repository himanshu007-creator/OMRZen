import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OMRZen - Modern OMR Sheet Testing Platform",
  description: "A minimalist, user-friendly online OMR sheet testing platform for conducting and evaluating tests with real-time tracking and detailed analytics.",
  keywords: "OMR, test platform, online testing, exam evaluation, assessment tool",
  authors: [{ name: "OMRZen Team" }],
  openGraph: {
    title: "OMRZen - Modern OMR Sheet Testing Platform",
    description: "Conduct and evaluate tests with real-time tracking and detailed analytics",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "OMRZen - Modern OMR Sheet Testing Platform",
    description: "Conduct and evaluate tests with real-time tracking and detailed analytics",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <SpeedInsights />
        </ThemeProvider>
        <Script 
          id="wsAiSeoMb"
          src="https://seo-fixer.writesonic.com/site-audit/fixer-script/index.js"
          strategy="afterInteractive"
        />
        <Script id="ws-seo-config" strategy="afterInteractive">
          {`
            wsSEOfixer.configure({
              hostURL: 'https://seo-fixer.writesonic.com',
              siteID: '67bc3e78bdefe294a13b3140'
            });
          `}
        </Script>
      </body>
    </html>
  );
}
