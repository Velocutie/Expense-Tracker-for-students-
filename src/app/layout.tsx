import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExpenseWise — College Student Money Manager",
  description: "Track your expenses, manage money received, and stay on budget as a college student.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ExpenseWise",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "ExpenseWise — College Student Money Manager",
    description: "Track your expenses, manage money received, and stay on budget as a college student.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-[family-name:var(--font-inter)] transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
