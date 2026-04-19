import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') || '';
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /checkout/\n\nSitemap: ${base}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
