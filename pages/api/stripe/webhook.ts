import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: any[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function upsertSubRow(orgId: string, sub?: Stripe.Subscription, status?: string) {
  const stripe_customer_id = (sub?.customer as string) ?? undefined;
  const stripe_subscription_id = sub?.id;
  const finalStatus = status || sub?.status || 'trialing';

  const { data: existing } = await supabaseAdmin
    .from('subscriptions').select('id').eq('org_id', orgId).maybeSingle();

  if (existing?.id) {
    await supabaseAdmin.from('subscriptions').update({
      stripe_customer_id, stripe_subscription_id, status: finalStatus
    }).eq('id', existing.id);
  } else {
    await supabaseAdmin.from('subscriptions').insert({
      org_id: orgId, stripe_customer_id, stripe_subscription_id, status: finalStatus
    });
  }

  const isActive = finalStatus === 'active' || finalStatus === 'trialing';
  await supabaseAdmin.from('orgs')
    .update({ subscription_status: isActive ? 'active' : 'past_due' })
    .eq('id', orgId);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string;
  const rawBody = (await buffer(req)).toString('utf8');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const orgId = s.metadata?.org_id;
        if (orgId && s.mode === 'subscription' && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
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
        break;
    }
    return res.status(200).json({ received: true });
  } catch (e: any) {
    return res.status(500).send(e.message || 'Server error');
  }
}

