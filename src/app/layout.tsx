
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import { getSiteSettings } from '@/app/admin/settings/_actions'; // Import the action

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const noto_sans_bengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-sans-bengali',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Bajibuz Promo Hub | সেরা প্রোমোশন ও অফার',
  description: 'Bajibuz এর আকর্ষণীয় প্রোমোশন, বোনাস এবং কিভাবে সহজেই জয়েন করবেন তা জানুন। আজই যোগ দিন!',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();

  let backgroundStyle: React.CSSProperties = {};
  let videoBackgroundElement: React.ReactNode = null;

  if (siteSettings) {
    if (siteSettings.backgroundType === 'color') {
      backgroundStyle.backgroundColor = siteSettings.backgroundValue;
    } else if (siteSettings.backgroundType === 'image' || siteSettings.backgroundType === 'gif') {
      backgroundStyle.backgroundImage = `url('${siteSettings.backgroundValue}')`;
      backgroundStyle.backgroundSize = 'cover';
      backgroundStyle.backgroundPosition = 'center';
      backgroundStyle.backgroundRepeat = 'no-repeat';
    } else if (siteSettings.backgroundType === 'video') {
      videoBackgroundElement = (
        <video
          autoPlay
          loop
          muted
          playsInline // Important for mobile
          className="absolute inset-0 w-full h-full object-cover -z-10" // -z-10 to put it behind content
        >
          <source src={siteSettings.backgroundValue} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
  }


  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${noto_sans_bengali.variable} font-sans antialiased flex flex-col min-h-screen relative`}
        style={backgroundStyle} // Apply dynamic background style
        suppressHydrationWarning={true} // Add suppressHydrationWarning here as well
      >
        {videoBackgroundElement} {/* Render video background if applicable */}
        <div className="relative z-0 flex flex-col min-h-screen"> {/* Content wrapper for z-indexing */}
          <SiteHeader />
          <main className="flex-grow">{children}</main>
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}

