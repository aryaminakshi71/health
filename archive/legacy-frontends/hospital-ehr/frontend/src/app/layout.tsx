import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Heal & Health Hospital - EHR System',
    description: 'Enterprise Hospital Management System - Best Multispecialty Hospital in Gurgaon',
}

import { Providers } from './providers';
import MainLayout from '@/components/MainLayout';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="theme-color" content="#ffffff" />
            </head>
            <body className={inter.className}>
                <Providers>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </Providers>
            </body>
        </html>
    )
}
