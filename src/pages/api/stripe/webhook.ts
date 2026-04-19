import type { APIRoute } from 'astro';
import { getStripeClient } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabase';
import { sendEmail, orderConfirmationHtml } from '../../../lib/email';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get('stripe-signature');
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response('Missing signature or webhook secret', { status: 400 });
  let event;
  try {
    const stripe = getStripeClient();
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) { console.error('[webhook] signature verify failed', err.message); return new Response(`Webhook Error: ${err.message}`, { status: 400 }); }
  if (event.type === 'checkout.session.completed') {
    const session: any = event.data.object;
    try {
      const stripe = getStripeClient();
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      const items = lineItems.data.map((li: any) => ({ name: li.description || li.price?.product?.name || 'Item', quantity: li.quantity || 1, amount: li.amount_total ?? (li.price?.unit_amount || 0) * (li.quantity || 1) }));
      const customerEmail = session.customer_details?.email || session.customer_email;
      const customerName = session.customer_details?.name || null;
      await supabase.from('groundwork_orders').insert({ stripe_session_id: session.id, customer_email: customerEmail, customer_name: customerName, amount_total_pence: session.amount_total, currency: (session.currency || 'USD').toUpperCase(), status: 'paid', line_items: items, shipping_address: session.customer_details?.address || null });
      if (customerEmail) {
        await sendEmail({ to: customerEmail, subject: 'Your Groundwork Coffee order', html: orderConfirmationHtml({ customerName, orderId: session.id.slice(-8).toUpperCase(), lineItems: items, total: session.amount_total, currency: (session.currency || 'USD').toUpperCase() }) });
      }
    } catch (e) { console.error('[webhook] handler failed', e); }
  }
  return new Response('ok', { status: 200 });
};
