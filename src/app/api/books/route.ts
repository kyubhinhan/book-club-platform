import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
