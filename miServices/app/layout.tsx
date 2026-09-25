import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import LoadingBar from "@/components/LoadingBar";
import SessionProvider from "@/components/providers/SessionProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import { BASE_URL, getSiteSettings } from "@/lib/cms/site";

// Pages pick up CMS changes within a minute
export const revalidate = 60;

/** Site-wide defaults from Site Settings; each page sets its own title and description */
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    metadataBase: new URL(BASE_URL),
    title: { default: site.defaultTitle || site.siteName, template: '%s' },
    description: site.defaultDescription,
    keywords: site.defaultKeywords,
    openGraph: { siteName: site.siteName, type: 'website', locale: 'en_GB' },
    twitter: { card: 'summary_large_image' },
    ...(process.env.SITE_NOINDEX === 'true' ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteSettings();
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Suspense fallback={null}>
            <LoadingBar />
          </Suspense>
          <ConditionalLayout site={site}>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
