import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/layouts/globals.css'
import { AppProviders } from '@/layouts/AppProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERP System',
  description: 'Enterprise Resource Planning System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
