'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { SIDEBAR_WIDTH_PX } from '@/lib/constants';

interface ConditionalSidebarProps {
  children: React.ReactNode;
}

export default function ConditionalSidebar({
  children,
}: ConditionalSidebarProps) {
  const pathname = usePathname() || '';

  // PDF 라우트에서는 sidebar 숨기기
  const hideSidebar = pathname.startsWith('/pdf');

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <main
        className="flex-1"
        style={{
          marginLeft: hideSidebar ? '0' : `${SIDEBAR_WIDTH_PX}`,
        }}
      >
        {children}
      </main>
    </div>
  );
}
