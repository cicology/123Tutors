import type React from "react"
import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, Sora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "123Tutors Platform",
  description: "Modern tutoring operations platform for students, tutors, bursary teams, and administrators.",
  generator: "Next.js",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF0090",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#fbf3f9]">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF0090]" />
              <p className="text-sm text-[#4f4a44]">Loading...</p>
            </div>
          </div>
        }>
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
