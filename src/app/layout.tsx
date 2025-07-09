import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import { SIDEBAR_WIDTH_PX } from '@/lib/constants';
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
        <Providers>
          <AuthGuard>
            <div className="flex">
              <Sidebar />
              <main
                className="flex-1"
                style={{ marginLeft: `${SIDEBAR_WIDTH_PX}` }}
              >
                {children}
              </main>
            </div>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
