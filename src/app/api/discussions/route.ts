import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questions, bookId } = body;

    const discussion = await prisma.discussion.create({
      data: {
        questions,
        bookId,
      },
    });

    return NextResponse.json(discussion);
  } catch (error) {
    console.error('Failed to create discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
