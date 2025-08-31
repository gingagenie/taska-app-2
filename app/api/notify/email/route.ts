import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const { to, subject, html } = await req.json();
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const result = await resend.emails.send({
    from: 'Taska <noreply@taska.info>',
    to, subject, html
  });
  return NextResponse.json(result);
}
