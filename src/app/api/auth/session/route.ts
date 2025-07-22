import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session) {
      return NextResponse.json(
        { message: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('세션 조회 오류:', error);
    return NextResponse.json(
      { message: '세션 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
