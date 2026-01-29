import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingBar from "@/components/LoadingBar";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "miServices - Professional Property Inspection Services",
  description: "Leading property inspection services including inventory reports, check-ins, check-outs, property visits, and block management for lettings agents, property managers, and landlords.",
  keywords: "property inspection, inventory reports, check-in, check-out, property management",
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
          <LoadingBar />
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
