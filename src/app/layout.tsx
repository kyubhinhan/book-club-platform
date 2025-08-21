import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import ConditionalSidebar from '@/components/ConditionalSidebar';
import AuthGuard from '@/components/AuthGuard';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
});

export const metadata: Metadata = {
  title: 'Book Club Platform',
  description: '독서 모임 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable}`}>
        <SessionProvider>
          <AuthGuard>
            <ConditionalSidebar>{children}</ConditionalSidebar>
          </AuthGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
