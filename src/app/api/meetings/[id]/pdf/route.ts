import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        book: true,
        creator: true,
        discussion: true,
        attachments: true,
        participants: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: '모임을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Puppeteer로 실제 페이지 방문
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // MeetingDetail 페이지로 이동
    const baseUrl = 'http://localhost:3000';
    const meetingUrl = `${baseUrl}/pdf/${params.id}`;

    await page.goto(meetingUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // PDF 전용 CSS 주입
    await page.addStyleTag({
      content: `
        @media print {
          .flex-row {
            display: flex !important;
            flex-direction: row !important;
          }
          .flex-col {
            display: flex !important;
            flex-direction: column !important;
          }
          .flex {
            display: flex !important;
          }
          .grid {
            display: grid !important;
          }
          .hidden {
            display: none !important;
          }
          .md\\:flex-row {
            display: flex !important;
            flex-direction: row !important;
          }
          .md\\:grid-cols-2 {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `,
    });
    // PDF 생성
    const pdf = await page.pdf({
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      preferCSSPageSize: true,
      printBackground: true,
      scale: 0.8,
    });

    await browser.close();

    // Uint8Array를 Buffer로 변환
    const pdfBuffer = Buffer.from(pdf);

    // 안전한 파일명 생성 (한글 제거)
    const safeFileName =
      meeting.title.replace(/[^\w\s-]/g, '').trim() || 'meeting';
    const fileName = `${safeFileName}_info.pdf`;

    // PDF 응답 반환
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
