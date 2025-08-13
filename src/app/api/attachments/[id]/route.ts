import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: params.id },
      include: {
        meeting: {
          select: {
            title: true,
            book: {
              select: {
                title: true,
                author: true,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: '첨부파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error('Attachment fetch error:', error);
    return NextResponse.json(
      { error: '첨부파일 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(
      authOptions as any
    )) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const attachmentId = params.id;

    // 첨부파일 조회
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        meeting: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: '첨부파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 모임 생성자만 삭제 가능
    if (attachment.meeting.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: '첨부파일을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Cloudinary에서 파일 삭제
    if (attachment.filename) {
      await deleteFromCloudinary(attachment.filename);
    }

    // 첨부파일 삭제
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({
      message: '첨부파일이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Attachment delete error:', error);
    return NextResponse.json(
      { error: '첨부파일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
