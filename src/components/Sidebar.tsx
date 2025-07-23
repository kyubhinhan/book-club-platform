'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { SIDEBAR_WIDTH_PX } from '@/lib/constants';

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setIsMenuOpen(false);
  };

  const menuItems = [
    {
      text: 'AI 도서 추천',
      icon: <PsychologyIcon className="w-5 h-5" />,
      href: '/',
    },
    {
      text: '모임 관리하기',
      icon: <GroupIcon className="w-5 h-5" />,
      href: '/meetings',
    },
  ];

  return (
    <div
      className="fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 flex flex-col"
      style={{ width: SIDEBAR_WIDTH_PX }}
    >
      {/* 로고 영역 */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="text-decoration-none">
          <h1 className="text-xl font-bold text-blue-600">
            Book Club Platform
          </h1>
        </Link>
      </div>

      {/* 메뉴 영역 */}
      <div className="flex-1 pt-4">
        <nav aria-label="메인 네비게이션">
          <ul>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.text}>
                  <Link href={item.href} className="block mx-2 mb-1">
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <span className={`mr-3 text-blue-600`}>{item.icon}</span>
                      <span className="font-medium">{item.text}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* 사용자 프로필 영역 */}
      <div className="p-4 border-t border-gray-200">
        {status === 'loading' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="text-sm text-gray-500">로딩 중...</div>
          </div>
        ) : session ? (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium overflow-hidden">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  session.user?.name?.[0] || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || '사용자'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </div>
              </div>
            </button>

            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <PersonIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <Link
                href="/auth/signin"
                className="block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="block text-xs text-gray-500 hover:text-gray-700"
              >
                회원가입
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
