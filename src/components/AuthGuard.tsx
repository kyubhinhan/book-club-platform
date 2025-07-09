'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  excludePaths?: string[];
}

export default function AuthGuard({
  children,
  requireAuth = false,
  redirectTo = '/auth/signin',
  excludePaths = ['/auth/signin', '/auth/signup'],
}: AuthGuardProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (status === 'loading') return;

    // 현재 경로 확인
    const currentPath = window.location.pathname;
    const isExcludedPath = excludePaths.includes(currentPath);

    // 인증이 필요한 페이지인데 로그인되지 않은 경우
    if (requireAuth && status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    // 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근하는 경우
    if (status === 'authenticated' && isExcludedPath) {
      router.push('/');
      return;
    }
  }, [status, requireAuth, redirectTo, router, excludePaths]);

  // 로딩 중일 때 표시할 내용
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 인증이 필요한 페이지인데 로그인되지 않은 경우
  if (requireAuth && status === 'unauthenticated') {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
}
