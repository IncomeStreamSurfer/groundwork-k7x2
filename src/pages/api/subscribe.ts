import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
export const prerender = false;
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim();
  if (!email || !email.includes('@')) return redirect('/?subscribe=error', 302);
  await supabase.from('groundwork_subscribers').insert({ email }).then(() => {}, () => {});
  return redirect('/?subscribe=ok', 302);
};
