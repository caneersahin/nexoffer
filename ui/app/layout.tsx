import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexoffer',
  description: 'Profesyonel teklif hazırlama ve yönetim platformu',
  keywords: ['teklif', 'teklif yönetimi', 'nexoffer', 'pdf teklif', 'müşteri yönetimi'],
  authors: [{ name: 'Caner Şahin', url: 'https://canersahin.com' }],
  creator: 'Caner Şahin',
  icons: {
    icon: '/favicon.ico', // favicon.ico'yu public klasörüne koy
  },
  openGraph: {
    title: 'Nexoffer',
    description: 'Profesyonel teklif hazırlama ve yönetim platformu',
    // url: 'https://nexoffer.com', // eğer varsa canlı URL’in
    siteName: 'Nexoffer',
    images: [
      {
        url: '/logos/logo3.png', // public klasörüne bu resmi ekle (1200x630 ideal boyut)
        width: 1200,
        height: 630,
        alt: 'Nexoffer - Profesyonel teklif platformu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexoffer',
    description: 'Profesyonel teklif hazırlama ve yönetim platformu',
    images: ['/logos/logo3.png'],
    creator: '@caneersahin', // Twitter varsa buraya yazabilirsin
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
