'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

/**
 * SessionProvider를 별도 컴포넌트로 분리하는 이유:
 * root layout에서 직접 사용하면 서버 컴포넌트에서 클라이언트 컴포넌트를 import할 수 없음
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider
      // 자동 로그인을 위한 설정
      refetchInterval={5 * 60} // 5분마다 세션 갱신
      refetchOnWindowFocus={true} // 창이 포커스될 때 세션 갱신
    >
      {children}
    </NextAuthSessionProvider>
  );
}
