import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendEmail } from '../../lib/email';
export const prerender = false;
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  const subject = String(form.get('subject') || '').trim();
  const message = String(form.get('message') || '').trim();
  if (!name || !email || !message) return redirect('/contact?error=missing', 302);
  await supabase.from('groundwork_contact_submissions').insert({ name, email, subject, message });
  await sendEmail({ to: 'hello@groundworkcoffee.co', subject: `[Contact] ${subject || 'New message'} — ${name}`, html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p>${message.replace(/\n/g,'<br/>')}</p>`, reply_to: email });
  await sendEmail({ to: email, subject: 'We got your message at Groundwork Coffee', html: `<p>Hi ${name.split(' ')[0] || 'there'},</p><p>Thanks for reaching out — we'll get back to you within 24 hours. In the meantime, feel free to browse our <a href="/shop">shop</a>.</p><p>— Groundwork</p>` });
  return redirect('/contact?submitted=1', 302);
};
