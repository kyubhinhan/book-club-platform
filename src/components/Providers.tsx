'use client';

import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // 자동 로그인을 위한 설정
      refetchInterval={5 * 60} // 5분마다 세션 갱신
      refetchOnWindowFocus={true} // 창이 포커스될 때 세션 갱신
    >
      {children}
    </SessionProvider>
  );
}
