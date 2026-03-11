import { MetadataRoute } from 'next';

const baseUrl = 'https://coachos.com.br'; // Ajustar conforme o domínio final

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/sobre',
    '/funcionalidades',
    '/faq',
    '/contato',
    '/termos',
    '/privacidade',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
