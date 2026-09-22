import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Jaknot ATS",
    template: "%s · Jaknot ATS",
  },
  description: "Applicant Tracking System - Jaknot Enterprise Edition",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main id="main-content" className="flex-1 px-8 py-7">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
