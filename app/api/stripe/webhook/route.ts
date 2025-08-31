import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseServer';

// Ensure Node runtime for Stripe SDK
export const runtime = 'nodejs';
// Avoid caching (recommended for webhooks)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sig = headers().get('stripe-signature') ?? '';
  const rawBody = await req.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // no apiVersion override needed

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const upsertSubRow = async (
    orgId: string,
    sub?: Stripe.Subscription,
    status?: string
  ) => {
    const stripe_customer_id = (sub?.customer as string) ?? undefined;
    const stripe_subscription_id = sub?.id;
    const finalStatus = status || sub?.status || 'trialing';

    // ensure a row exists in subscriptions
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('org_id', orgId)
      .maybeSingle();

    if (existing?.id) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          stripe_customer_id,
          stripe_subscription_id,
          status: finalStatus,
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('subscriptions').insert({
        org_id: orgId,
        stripe_customer_id,
        stripe_subscription_id,
        status: finalStatus,
      });
    }

    // mirror status onto orgs for quick gating
    const isActive = finalStatus === 'active' || finalStatus === 'trialing';
    await supabaseAdmin
      .from('orgs')
      .update({ subscription_status: isActive ? 'active' : 'past_due' })
      .eq('id', orgId);
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const orgId = s.metadata?.org_id;
        if (orgId && s.mode === 'subscription' && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            s.subscription as string
          );
          await upsertSubRow(orgId, sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = (sub.metadata as any)?.org_id;
        if (orgId) await upsertSubRow(orgId, sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = (sub.metadata as any)?.org_id;
        if (orgId) await upsertSubRow(orgId, sub, 'canceled');
        break;
      }
      default:
        // ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
