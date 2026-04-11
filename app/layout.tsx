import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextAuthProvider } from '@/components/providers'
import { KidBackground } from '@/components/kid-background'
import './globals.css'

const baloo = Baloo_2({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: 'Mauritius Learning Hub',
  description: 'A fun educational game for children to learn about the history and geography of Mauritius',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${baloo.className} antialiased`}>
        <NextAuthProvider>
          <KidBackground />
          {children}
        </NextAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
