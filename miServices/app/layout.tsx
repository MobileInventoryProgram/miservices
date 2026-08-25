import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import LoadingBar from "@/components/LoadingBar";
import SessionProvider from "@/components/providers/SessionProvider";
import ConditionalLayout from "@/components/ConditionalLayout";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "miServices - Professional Property Inventory Services UK",
    template: "%s",
  },
  description: "Professional property inventory services across the UK. Inventory reports, check-ins, check-outs, mid-tenancy inspections and more from the UK's trusted inventory clerk network.",
  keywords: "property inventory, inventory reports, check-in, check-out, property inspection, inventory clerk, letting agent services",
  openGraph: {
    siteName: 'miServices',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Suspense fallback={null}>
            <LoadingBar />
          </Suspense>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
