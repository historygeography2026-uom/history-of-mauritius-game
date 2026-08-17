import type { Metadata } from 'next'
import { Baloo_2, Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextAuthProvider } from '@/components/providers'
import { KidBackground } from '@/components/kid-background'
import './globals.css'

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

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
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden">
        <NextAuthProvider>
          <KidBackground />
          {children}
        </NextAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
