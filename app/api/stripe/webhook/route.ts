import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') as string;
  const body = await req.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.org_id;
      if (orgId) {
        await supabaseAdmin.from('orgs').update({ subscription_status: 'active' }).eq('id', orgId);
      }
    }
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = (sub.metadata as any)?.org_id;
      if (orgId) {
        const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'past_due';
        await supabaseAdmin.from('orgs').update({ subscription_status: status }).eq('id', orgId);
      }
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false }
};
