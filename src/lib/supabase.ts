import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { persistSession: false },
});

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: 'coffee' | 'equipment' | 'bundle';
  subcategory: string | null;
  price_pence: number;
  currency: string;
  image_url: string | null;
  short_description: string | null;
  description: string | null;
  tasting_notes: string[] | null;
  origin: string | null;
  process: string | null;
  roast_level: string | null;
  weight_grams: number | null;
  stock: number;
  featured: boolean;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
};

export async function getProducts(filter?: { category?: string }) {
  let q = supabase.from('groundwork_products').select('*').order('featured', { ascending: false }).order('name');
  if (filter?.category) q = q.eq('category', filter.category);
  const { data, error } = await q;
  if (error) { console.error('[getProducts]', error); return []; }
  return (data || []) as Product[];
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase.from('groundwork_products').select('*').eq('slug', slug).maybeSingle();
  if (error) { console.error('[getProductBySlug]', error); return null; }
  return data as Product | null;
}

export async function getPublishedPosts() {
  const { data, error } = await supabase.from('groundwork_content').select('*').not('published_at', 'is', null).order('published_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getPostBySlug(slug: string) {
  const { data } = await supabase.from('groundwork_content').select('*').eq('slug', slug).not('published_at', 'is', null).maybeSingle();
  return data;
}

export function formatPrice(pence: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(pence / 100);
}
