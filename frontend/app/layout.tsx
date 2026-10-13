import type { Metadata } from "next";
import "./globals.css";
import "./product.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Ascende — Progress is earned",
  description: "Evidence-governed milestone capital on stable GenLayer Studionet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-glow" aria-hidden="true" />
        <SiteHeader />
        {children}
        <footer className="site-footer"><span>ASCENDE / PROVE PROGRESS</span><span>STUDIONET · 61999 · FINALIZED CONTRACT STATE</span></footer>
      </body>
    </html>
  );
}
