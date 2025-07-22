import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 세션에서 사용자 ID 확인
    const session: Session | null = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { name, email } = await request.json();

    // 입력값 검증
    if (!name || !email) {
      return NextResponse.json(
        { message: '이름과 이메일을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인 (다른 사용자가 사용 중인지)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: userId }, // 현재 사용자 제외
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
        email: email,
      },
    });

    return NextResponse.json(
      {
        message: '프로필이 성공적으로 업데이트되었습니다.',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return NextResponse.json(
      { message: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
