import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Modulo: Test — cognitive assessments & personality archetypes",
    template: "%s · Modulo: Test",
  },
  description:
    "Modulo: Test measures reasoning across five cognitive domains and maps your trait profile onto ten Modulo archetypes. Estimates, not verdicts.",
  applicationName: "Modulo: Test",
  openGraph: {
    title: "Modulo: Test",
    description:
      "IQ-style cognitive assessments and personality archetypes, scored with a transparent model.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-sand-400 focus:px-4 focus:py-2 focus:text-sm focus:text-ink-950"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
