import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { token: string } }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:53759';
  const url = `${API_BASE_URL}/api/offers/pdf/${params.token}.pdf`;
  const res = await fetch(url);
  if (!res.ok) {
    return new NextResponse('Internal Server Error', { status: res.status });
  }
  const data = await res.arrayBuffer();
  return new NextResponse(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="teklif-${params.token}.pdf"`,
    },
  });
}
