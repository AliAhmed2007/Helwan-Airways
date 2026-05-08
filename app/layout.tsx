import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSync } from "@/components/auth/AuthSync";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Helwan Airways — Fly With Confidence",
    template: "%s | Helwan Airways",
  },
  description:
    "Book flights, manage reservations, and experience premium travel with Helwan Airways. Serving 150+ destinations worldwide.",
  keywords: ["airline", "flights", "booking", "travel", "Egypt", "Helwan Airways"],
  authors: [{ name: "Helwan Airways" }],
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${geistMono.variable}`}
      >
        <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/15">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={300}>
              <AuthSync />
              {children}
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
