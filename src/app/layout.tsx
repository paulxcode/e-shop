import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { AnalyticsProvider } from "@/components/layout/AnalyticsProvider"

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "eShop",
  description: "Magazinul tău online preferat",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={manrope.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Sari la conținut
        </a>
        <ErrorBoundary>
          <AnalyticsProvider />
          <Navbar />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster position="top-right" richColors />
        </ErrorBoundary>
      </body>
    </html>
  )
}
