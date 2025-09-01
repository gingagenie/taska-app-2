import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const { priceId, orgId, mode = 'subscription' } = await req.json();
  if (!priceId || !orgId) {
    return NextResponse.json({ error: 'priceId and orgId required' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const { data: subRow } = await supabaseAdmin
    .from('subscriptions').select('id, stripe_customer_id')
    .eq('org_id', orgId).maybeSingle();

  let customerId = subRow?.stripe_customer_id ?? null;

  if (!customerId) {
    const { data: org } = await supabaseAdmin.from('orgs').select('name').eq('id', orgId).single();
    const customer = await stripe.customers.create({
      name: org?.name || 'Taska Customer',
      metadata: { org_id: orgId },
    });
    customerId = customer.id;

    if (subRow?.id) {
      await supabaseAdmin.from('subscriptions')
        .update({ stripe_customer_id: customerId }).eq('id', subRow.id);
    } else {
      await supabaseAdmin.from('subscriptions')
        .insert({ org_id: orgId, stripe_customer_id: customerId });
    }
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const session = await stripe.checkout.sessions.create({
    mode: mode as any,
    customer: customerId!,
    billing_address_collection: 'auto',
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${site}/dashboard/billing?success=1`,
    cancel_url: `${site}/dashboard/billing?canceled=1`,
    metadata: { org_id: orgId },
  });

  return NextResponse.json({ url: session.url });
}
