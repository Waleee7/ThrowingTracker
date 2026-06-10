import type { Metadata, Viewport } from 'next';
import { Anton, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

// Self-hosted via next/font — no render-blocking Google CSS request, no FOUT.
// (Fraunces was loaded here for months but used nowhere — dropped.)
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

export const metadata: Metadata = {
  title: 'ThrowingTracker',
  description: 'Track & field throwing training log — Shot Put, Discus, Hammer, Weight Throw, Javelin',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ThrowingTracker',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximumScale removed — blocking pinch-zoom fails WCAG 1.4.4 (Resize Text).
  // theme-color is owned by the inline script below (not static metadata) so the
  // browser chrome tracks the dark-mode toggle; AppContext keeps it in sync.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${anton.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('throwingDarkMode')==='true';if(d){document.documentElement.classList.add('dark')}var m=document.createElement('meta');m.name='theme-color';m.content=d?'#0A0A0B':'#FFFFFF';document.head.appendChild(m);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
