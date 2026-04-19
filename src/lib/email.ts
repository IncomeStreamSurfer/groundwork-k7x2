const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function sendEmail(opts: { to: string; subject: string; html: string; from?: string; reply_to?: string; }) {
  if (!RESEND_API_KEY) { console.warn('[email] RESEND_API_KEY not set'); return { ok: false, skipped: true }; }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: opts.from || `Groundwork Coffee Co. <${FROM_EMAIL}>`,
        to: [opts.to], subject: opts.subject, html: opts.html, reply_to: opts.reply_to,
      }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (e) { return { ok: false, error: String(e) }; }
}

export function orderConfirmationHtml(input: { customerName?: string | null; orderId: string; lineItems: Array<{name:string;quantity:number;amount:number}>; total: number; currency: string; }) {
  const fmt = (c: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:input.currency||'USD'}).format(c/100);
  const items = input.lineItems.map(li => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee">${li.name} × ${li.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right">${fmt(li.amount)}</td></tr>`).join('');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#2a1810"><h1 style="font-family:Georgia,serif;color:#2a1810;margin:0 0 8px">Thanks for your order${input.customerName?`, ${input.customerName}`:''}!</h1><p style="color:#555">We're getting your beans and gear ready. Here's what's on the way:</p><table style="width:100%;border-collapse:collapse;margin:24px 0">${items}<tr><td style="padding:16px 0 0;font-weight:600">Total</td><td style="padding:16px 0 0;text-align:right;font-weight:600">${fmt(input.total)}</td></tr></table><p style="color:#555">Order reference: <code>${input.orderId}</code></p><p style="color:#555">Questions? Just reply to this email.</p><p style="color:#c9783d;font-weight:500;margin-top:32px">— The Groundwork team</p></div>`;
}
