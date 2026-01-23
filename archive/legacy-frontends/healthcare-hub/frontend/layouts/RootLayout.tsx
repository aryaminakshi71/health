import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../layouts/globals.css";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ThemeProvider } from "../components/ui/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ERPSurveiVoip - Comprehensive ERP Solution",
  description: "Advanced ERP system with video conferencing, patient management, and comprehensive business tools",
};

interface RootLayoutProps {
  children: React.ReactNode;
  appName?: string;
  appDescription?: string;
}

export default function RootLayout({
  children,
  appName = "ERP Application",
  appDescription = "Enterprise Resource Planning System"
}: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <Header appName={appName} appDescription={appDescription} />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
