import type { APIRoute } from 'astro';
import { getStripeClient } from '../../lib/stripe';
import { getProducts } from '../../lib/supabase';
export const prerender = false;
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const { items } = await request.json();
    if (!Array.isArray(items) || !items.length) { return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 }); }
    const products = await getProducts();
    const bySlug = new Map(products.map(p => [p.slug, p]));
    const line_items = [] as any[];
    for (const i of items) {
      const p = bySlug.get(i.slug);
      if (!p) continue;
      const qty = Math.max(1, Math.min(20, Number(i.quantity) || 1));
      line_items.push({ quantity: qty, price_data: { currency: (p.currency || 'USD').toLowerCase(), unit_amount: p.price_pence, product_data: { name: p.name, description: p.short_description || undefined, images: p.image_url ? [p.image_url] : undefined, metadata: { slug: p.slug } } } });
    }
    if (!line_items.length) return new Response(JSON.stringify({ error: 'No valid items found' }), { status: 400 });
    const stripe = getStripeClient();
    const origin = import.meta.env.PUBLIC_SITE_URL || url.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', line_items,
      shipping_address_collection: { allowed_countries: ['US','CA','GB','AU','NZ','IE','DE','FR','NL','SE','NO','DK','FI','BE','AT','CH','ES','IT','PT','JP'] },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      allow_promotion_codes: true,
    });
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { 'Content-Type':'application/json' } });
  } catch (err: any) {
    console.error('[checkout]', err);
    return new Response(JSON.stringify({ error: err.message || 'Checkout failed' }), { status: 500 });
  }
};
