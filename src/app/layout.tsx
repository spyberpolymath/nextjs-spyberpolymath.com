import type { Metadata } from 'next'
import RouteGuard from './components/RouteGuard'
import LayoutProvider from './components/LayoutProvider'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo'
import StructuredData from '@/app/components/StructuredData'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Cybersecurity Researcher & Ethical Hacker',
  description: 'Professional portfolio of Aman Anil (SpyberPolymath), a cybersecurity researcher and ethical hacker with expertise in API security, AI systems, penetration testing, vulnerability assessment, and digital privacy solutions.',
  keywords: [
    'cybersecurity portfolio',
    'ethical hacker portfolio',
    'penetration testing services',
    'API security expert',
    'AI security specialist',
    'vulnerability assessment',
    'security consulting',
    'cyber security research',
    'information security expert',
    'security auditing services'
  ],
  canonical: '/',
  type: 'website',
  tags: ['cybersecurity', 'ethical-hacking', 'portfolio', 'expertise']
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Generate structured data for the website and person
  const personData = generateStructuredData('Person');
  const websiteData = generateStructuredData('Website');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="google-site-verification" content="your-google-verification-code" />
        
        {/* Structured Data for Rich Results */}
        <StructuredData data={[personData, websiteData]} />
      </head>
      <body suppressHydrationWarning>
        <LayoutProvider>
          <RouteGuard>
            <Analytics />
            {children}
            <SpeedInsights />
          </RouteGuard>
        </LayoutProvider>
      </body>
    </html>
  )
}
