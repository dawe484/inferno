import { ClerkProvider } from '@clerk/nextjs';
import '../globals.css';
import { Inter } from 'next/font/google';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Fotter';
import LeftSidebar from '@/components/shared/LeftSidebar';
import RightSidebar from '@/components/shared/RightSidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Inferno',
  description: 'A Next.js 13 Send Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={inter.className}>
          <Header />
          <main className='flex flex-row'>
            <LeftSidebar />
            <section className='main-container'>
              <div className='w-full max-w-4xl'>{children}</div>
            </section>
            <RightSidebar />
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
