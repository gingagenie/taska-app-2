import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { to, body } = await req.json();
  const user = process.env.MESSAGEMEDIA_API_KEY!;
  const pass = process.env.MESSAGEMEDIA_API_SECRET!;
  const auth = Buffer.from(user + ':' + pass).toString('base64');

  const res = await fetch('https://api.messagemedia.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages: [{ content: body, destination_number: to }] })
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
